import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("the contract view", () => {
  it("commits the real describe() output", async () => {
    const d = JSON.parse(await readFile("docs/contract.json", "utf8")) as {
      id: string;
      formats: Record<string, unknown>;
      fields: Array<{ path: string }>;
      rules: { core: Array<{ code: string; stage: string }> };
    };
    expect(d.id).toBe("sightline.SignFamily");
    expect(Object.keys(d.formats)).toEqual(["near", "mid", "far"]);
    expect(d.fields).toHaveLength(6);
    expect(d.rules.core.map((r) => r.code)).toContain("image/fit");
    expect(d.rules.core.find((r) => r.code === "image/fit")?.stage).toBe("measured");
  });

  it("draws that contract as the README's first image", async () => {
    const png = await readFile("docs/images/contract.png");
    expect(png.readUInt32BE(16)).toBe(2000);
    expect(png.readUInt32BE(20)).toBe(1400);
  });
});
