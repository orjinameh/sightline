import { execFileSync } from "node:child_process";
import { access, rm } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const NO_SHORT = "designs/_refusal/car-park.values.json";
const WITH_SHORT = "designs/_refusal/car-park-short.values.json";
const OUT = "out/designs/_refusal";

function run(args: string[]): { code: number; out: string } {
  try {
    const out = execFileSync("npx", ["hyper-elements", ...args], {
      encoding: "utf8",
      stdio: "pipe",
    });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? 1, out: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

type Diag = { code: string; field?: string; message: string; path?: string };

function diagnostics(jsonLines: string): Diag[] {
  const found: Diag[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      if (typeof obj.code === "string") found.push(obj as unknown as Diag);
      Object.values(obj).forEach(walk);
    }
  };
  for (const line of jsonLines.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      walk(JSON.parse(trimmed));
    } catch {
      // the summary line is not JSON
    }
  }
  return found;
}

describe("the 30 m refusal", () => {
  it("fails a 30 m sign that has no short form", () => {
    const r = run(["check", NO_SHORT, "--json"]);
    expect(r.code).toBe(1);
    // A rule entry also carries a `code`; the diagnostic is the one that names a field.
    const fit = diagnostics(r.out).find(
      (d) => d.code === "image/fit" && typeof d.field === "string"
    );
    expect(fit, "no image/fit diagnostic with a field was reported").toBeDefined();
    expect(fit?.field).toBe("short");
    expect(fit?.message).toContain("cut about");
  });

  it("never writes the refused format", async () => {
    await rm(OUT, { recursive: true, force: true });
    const r = run(["render", NO_SHORT]);
    expect(r.code).toBe(1);
    // Measured: render writes the formats that pass and refuses the one that cannot fit.
    // The guarantee is that the 30 m sign is never drawn truncated — not that out/ is empty.
    await expect(access(`${OUT}/car-park.far.png`)).rejects.toThrow();
  });

  it("passes the same destination once the short form is written", () => {
    const r = run(["check", WITH_SHORT]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("fit short:");
  });
});
