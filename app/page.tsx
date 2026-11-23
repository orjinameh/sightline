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
