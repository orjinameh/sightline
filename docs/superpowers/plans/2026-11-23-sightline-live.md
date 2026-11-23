# Live Renderer Implementation Plan

**Goal:** A real interactive site — type a destination, press Render, and the deployed serverless function runs the actual template, returning three signs or the real `image/fit` refusal.
**Architecture:** A Next.js App Router app at the repo root. `app/page.tsx` is the form; `app/api/render/route.ts` imports the same `templates/sign-family.tsx` the CLI uses, calls `renderImage()` per format with font and pictogram bytes from `assets/`, and returns base64 PNGs or the library's diagnostics. Nothing is re-implemented — the site and the CLI run one template.
**Tech Stack:** Next.js 16.4.6 · React 19.3.1 · Node 24 · `@hyper-elements/react` 0.5.2 · `satori` 0.33.5 · `@resvg/resvg-js` 2.6.2
**Source spec:** docs/superpowers/specs/2026-11-23-sightline-sign-family-design.md

> **Vercel facts that decide the shape** (from the pack's Next.js notes):
> 1. `renderImage()` needs **Node**, never Edge.
> 2. `satori` and `@resvg/resvg-js` must be **`serverExternalPackages`**, or the native binary is bundled wrongly.
> 3. Files read at runtime must be **traced into the function** — `outputFileTracingIncludes`.
> 4. Fonts are bytes, never URLs; nothing is fetched at render time.

---

### Task 18: The live renderer

**Files:**
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/api/render/route.ts`
- Create: `scripts/probe-live.mjs`
- Modify: `package.json`

**Effort:** high
**Model tier:** top
**Provides:** `POST /api/render`, `next.config.ts`
**Requires:** `signFamily`, `sightline.SignFamily`, `assets/fonts/*.woff`, `assets/pictograms/*.png`

- [ ] **Step 1: Add Next to `package.json`**

      Add to `dependencies`: `"next": "16.4.6"`. Add to `scripts`:
      `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`.

      Keep every existing script and dependency exactly as it is — the CLI, the tests and `npm run demo`
      must keep working.

- [ ] **Step 2: Write `next.config.ts`**

      ```ts
      import type { NextConfig } from "next";

      const nextConfig: NextConfig = {
        // Native binaries and the font/text engine must stay outside the bundle.
        serverExternalPackages: ["@resvg/resvg-js", "satori"],
        // The API reads these at request time; Vercel must trace them into the function.
        outputFileTracingIncludes: {
          "/api/render": ["./assets/**"],
        },
      };

      export default nextConfig;
      ```

- [ ] **Step 3: Write `app/api/render/route.ts`**

      The route runs the **same** template module the CLI runs. It never re-implements layout or copy
      selection, so the live site cannot drift from the tested behaviour.

      ```ts
      import { readFile } from "node:fs/promises";
      import path from "node:path";
      import { renderImage } from "@hyper-elements/react/image";
      import family from "../../../templates/sign-family";

      export const runtime = "nodejs";
      export const dynamic = "force-dynamic";

      const FORMATS = ["near", "mid", "far"] as const;
      type Format = (typeof FORMATS)[number];

      const FONT_FILES = [
        { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-400-normal.woff", weight: 400 },
        { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-500-normal.woff", weight: 500 },
        { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-600-normal.woff", weight: 600 },
        { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-700-normal.woff", weight: 700 },
      ];

      const PICTOGRAMS = ["car-park", "toilets", "reception", "lift", "exit"] as const;
      type Pictogram = (typeof PICTOGRAMS)[number];

      const ARROWS = ["left", "right", "up", "down", "none"] as const;

      type Body = {
        destination?: unknown;
        long?: unknown;
        medium?: unknown;
        short?: unknown;
        arrow?: unknown;
        pictogram?: unknown;
      };

      const text = (v: unknown, max: number): string =>
        typeof v === "string" ? v.slice(0, max) : "";

      export async function POST(request: Request): Promise<Response> {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ ok: false, diagnostics: [], images: {} }, { status: 400 });
        }

        const pictogramName: Pictogram = (PICTOGRAMS as readonly string[]).includes(
          String(body.pictogram)
        )
          ? (body.pictogram as Pictogram)
          : "car-park";

        const arrow = (ARROWS as readonly string[]).includes(String(body.arrow))
          ? (body.arrow as (typeof ARROWS)[number])
          : "right";

        const short = text(body.short, 30);

        const values = {
          destination: text(body.destination, 60) || "Car park",
          long: text(body.long, 120) || "Visitor car park — follow the blue P signs past the north gate",
          medium: text(body.medium, 60) || "Visitor car park, north gate",
          ...(short.trim() ? { short } : {}),
          arrow,
          pictogram: {
            src: `assets/pictograms/${pictogramName}.png`,
            width: 512,
            height: 512,
          },
        };

        const root = process.cwd();
        const fonts = await Promise.all(
          FONT_FILES.map(async (f) => ({
            family: f.family,
            weight: f.weight,
            src: await readFile(path.join(root, "assets", "fonts", f.file)),
          }))
        );
        const images: Record<string, Buffer> = {
          [values.pictogram.src]: await readFile(
            path.join(root, "assets", "pictograms", `${pictogramName}.png`)
          ),
        };

        const rendered: Partial<Record<Format, string>> = {};
        const diagnostics: unknown[] = [];

        for (const format of FORMATS) {
          try {
            const { image } = await renderImage(family.design(values, { format }), {
              fonts,
              images,
              format: "png",
            });
            rendered[format] = `data:image/png;base64,${Buffer.from(image).toString("base64")}`;
          } catch (error) {
            const found = (error as { diagnostics?: unknown[] }).diagnostics;
            if (Array.isArray(found)) diagnostics.push(...found);
            else diagnostics.push({ code: "render/failed", message: String(error) });
          }
        }

        // Exactly the CLI's contract: the formats that fit are returned, the one that cannot fit is
        // not, and the diagnostics explain why.
        if (diagnostics.length > 0) {
          return Response.json({ ok: false, diagnostics, images: rendered }, { status: 422 });
        }

        return Response.json({ ok: true, diagnostics: [], images: rendered });
      }
      ```

- [ ] **Step 4: Write `app/layout.tsx`**

      ```tsx
      import type { ReactNode } from "react";

      export const metadata = {
        title: "Sightline",
        description:
          "A wayfinding sign family where one directory of destinations renders at 3 m, 12 m and 30 m — and the distance changes the copy.",
      };

      export default function RootLayout({ children }: { children: ReactNode }) {
        return (
          <html lang="en">
            <body style={{ margin: 0, background: "#F4F1EA", color: "#14201C" }}>{children}</body>
          </html>
        );
      }
      ```

- [ ] **Step 5: Write `app/page.tsx`**

      A client component: the form, the Render button, three panels, and the refusal rendered as the
      library reports it.

      ```tsx
      "use client";

      import { useState } from "react";

      type Images = Partial<Record<"near" | "mid" | "far", string>>;
      type Diagnostic = { code?: string; field?: string; message?: string; path?: string };
      type Result = { ok: boolean; diagnostics: Diagnostic[]; images: Images };

      const PICTOGRAMS = ["car-park", "toilets", "reception", "lift", "exit"];
      const ARROWS = ["left", "right", "up", "down", "none"];

      const FORMAT_LABEL: Record<string, string> = {
        near: "3 m — long form",
        mid: "12 m — medium form",
        far: "30 m — short form",
      };

      export default function Page() {
        const [destination, setDestination] = useState("Car park");
        const [long, setLong] = useState(
          "Visitor car park — follow the blue P signs past the north gate and the delivery bay"
        );
        const [medium, setMedium] = useState("Visitor car park, north gate");
        const [short, setShort] = useState("");
        const [arrow, setArrow] = useState("right");
        const [pictogram, setPictogram] = useState("car-park");
        const [result, setResult] = useState<Result | null>(null);
        const [busy, setBusy] = useState(false);

        async function render(): Promise<void> {
          setBusy(true);
          try {
            const res = await fetch("/api/render", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ destination, long, medium, short, arrow, pictogram }),
            });
            setResult((await res.json()) as Result);
          } finally {
            setBusy(false);
          }
        }

        const field = {
          width: "100%",
          padding: "10px 12px",
          border: "1px solid #DAD3C2",
          borderRadius: 8,
          font: "inherit",
          background: "#fff",
          color: "#14201C",
        } as const;

        return (
          <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 96px" }}>
            <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Sightline
            </h1>
            <p style={{ fontSize: 18, color: "#6B6A5F", margin: "0 0 28px", maxWidth: "62ch" }}>
              One destination, three distances. The distance chooses the copy — and when the copy cannot
              fit, the template refuses instead of shrinking it. Leave the 30 m form empty to see it.
            </p>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label>
                Destination
                <input style={field} value={destination} onChange={(e) => setDestination(e.target.value)} maxLength={60} />
              </label>
              <label>
                Pictogram
                <select style={field} value={pictogram} onChange={(e) => setPictogram(e.target.value)}>
                  {PICTOGRAMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                Arrow
                <select style={field} value={arrow} onChange={(e) => setArrow(e.target.value)}>
                  {ARROWS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <label>
                Long form — 3 m
                <textarea style={{ ...field, minHeight: 62 }} value={long} onChange={(e) => setLong(e.target.value)} maxLength={120} />
              </label>
              <label>
                Medium form — 12 m
                <input style={field} value={medium} onChange={(e) => setMedium(e.target.value)} maxLength={60} />
              </label>
              <label>
                Short form — 30 m <span style={{ color: "#6B6A5F" }}>(leave empty to see the refusal)</span>
                <input style={field} value={short} onChange={(e) => setShort(e.target.value)} maxLength={30} placeholder="Visitor car park" />
              </label>
            </div>

            <button
              onClick={() => void render()}
              disabled={busy}
              style={{
                marginTop: 16,
                padding: "12px 22px",
                borderRadius: 999,
                border: "none",
                background: "#1F4D3F",
                color: "#fff",
                font: "inherit",
                fontWeight: 600,
                cursor: busy ? "progress" : "pointer",
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Rendering…" : "Render the family"}
            </button>

            {result && (
              <section style={{ marginTop: 28 }}>
                {result.diagnostics.length > 0 && (
                  <div
                    style={{
                      border: "2px solid #8C2F2F",
                      background: "#fff",
                      borderRadius: 10,
                      padding: "14px 18px",
                      marginBottom: 20,
                    }}
                  >
                    <strong style={{ color: "#8C2F2F" }}>The template refused.</strong>
                    {result.diagnostics.map((d, i) => (
                      <pre
                        key={i}
                        style={{
                          whiteSpace: "pre-wrap",
                          margin: "10px 0 0",
                          font: "13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
                          color: "#14201C",
                        }}
                      >{`${d.code ?? "error"}${d.field ? ` · field: ${d.field}` : ""}
      ${d.message ?? ""}`}</pre>
                    ))}
                  </div>
                )}

                <div style={{ display: "grid", gap: 20 }}>
                  {(["near", "mid", "far"] as const).map((format) =>
                    result.images[format] ? (
                      <figure key={format} style={{ margin: 0 }}>
                        <img
                          src={result.images[format]}
                          alt={`${FORMAT_LABEL[format]} sign`}
                          style={{ width: "100%", height: "auto", border: "1px solid #DAD3C2", borderRadius: 10, background: "#fff" }}
                        />
                        <figcaption style={{ fontSize: 14, color: "#6B6A5F", marginTop: 6 }}>
                          {FORMAT_LABEL[format]}
                        </figcaption>
                      </figure>
                    ) : (
                      <figure key={format} style={{ margin: 0 }}>
                        <div
                          style={{
                            border: "2px dashed #DAD3C2",
                            borderRadius: 10,
                            minHeight: 120,
                            display: "grid",
                            placeItems: "center",
                            color: "#6B6A5F",
                            fontSize: 14,
                          }}
                        >
                          {FORMAT_LABEL[format]} — not rendered
                        </div>
                      </figure>
                    )
                  )}
                </div>
              </section>
            )}

            <footer style={{ marginTop: 64, paddingTop: 20, borderTop: "1px solid #DAD3C2", fontSize: 14, color: "#6B6A5F" }}>
              These are design proofs, not print files. The legibility ratio in <code>brand.ts</code> is a
              declared assumption, and six words is a house limit, not a legal one. The same template runs
              in the CLI: <code>npx hyper-elements check designs/</code>.
            </footer>
          </main>
        );
      }
      ```

- [ ] **Step 6: Write `scripts/probe-live.mjs`**

      Builds are slow and server starts are flaky, so the probe owns the whole lifecycle: start
      `next start`, poll until it answers, assert both cases, stop it.

      ```js
      import { spawn } from "node:child_process";

      const PORT = 3111;
      const BASE = `http://127.0.0.1:${PORT}`;

      const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NODE_ENV: "production" },
      });
      let log = "";
      server.stdout.on("data", (b) => (log += b));
      server.stderr.on("data", (b) => (log += b));

      const stop = () => {
        try {
          server.kill("SIGTERM");
        } catch {
          /* already gone */
        }
      };

      async function waitForServer() {
        for (let i = 0; i < 60; i++) {
          try {
            const r = await fetch(`${BASE}/api/render`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: "{}",
            });
            if (r.status > 0) return;
          } catch {
            /* not up yet */
          }
          await new Promise((r) => setTimeout(r, 500));
        }
        throw new Error(`server did not start\n${log}`);
      }

      function check(name, condition, detail) {
        if (!condition) {
          console.error(`FAIL ${name}: ${detail}`);
          stop();
          process.exit(1);
        }
        console.log(`ok   ${name}`);
      }

      try {
        await waitForServer();

        const refusal = await fetch(`${BASE}/api/render`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            destination: "Car park",
            long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
            medium: "Visitor car park, north gate",
            arrow: "right",
            pictogram: "car-park",
          }),
        });
        const refused = await refusal.json();
        const fit = (refused.diagnostics ?? []).find((d) => d.code === "image/fit");
        check("refusal status is 422", refusal.status === 422, `got ${refusal.status}`);
        check("refusal reports image/fit", Boolean(fit), JSON.stringify(refused.diagnostics ?? []));
        check("refusal names the short field", fit?.field === "short", JSON.stringify(fit));
        check("refusal withholds the far image", !refused.images?.far, "far image was returned");

        const ok = await fetch(`${BASE}/api/render`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            destination: "Car park",
            long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
            medium: "Visitor car park, north gate",
            short: "Visitor car park",
            arrow: "right",
            pictogram: "car-park",
          }),
        });
        const passed = await ok.json();
        check("valid status is 200", ok.status === 200, `got ${ok.status}`);
        check("valid returns three images", ["near", "mid", "far"].every((f) => passed.images?.[f]), JSON.stringify(Object.keys(passed.images ?? {})));
        check(
          "images are PNG data URLs",
          String(passed.images?.far ?? "").startsWith("data:image/png;base64,"),
          String(passed.images?.far ?? "").slice(0, 40)
        );

        stop();
        process.exit(0);
      } catch (error) {
        console.error(String(error));
        stop();
        process.exit(1);
      }
      ```

- [ ] **Step 7: Run the gate**

      Run: `npm install && npm run build && node scripts/probe-live.mjs && echo GATE-PASS`
      Expected: `GATE-PASS`

      If the build fails on `satori` or `@resvg/resvg-js`, they are missing from
      `serverExternalPackages`. If the probe reports a missing image, `outputFileTracingIncludes` does not
      cover `./assets/**` — or `process.cwd()` is not the repo root. If the refusal case returns 200,
      the route is swallowing diagnostics instead of returning 422.

- [ ] **Step 8: Commit (kernel-performed — no agent runs this)**
      Message: `feat: a live renderer that runs the real template on the server`
