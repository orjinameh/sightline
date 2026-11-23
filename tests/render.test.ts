import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

function dimensions(png: Buffer): { width: number; height: number } {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

describe("the rendered family", () => {
  it("renders each distance at the size its format declares", async () => {
    const expected = {
      near: { width: 1772, height: 1181 },
      mid: { width: 3543, height: 1772 },
      far: { width: 5315, height: 1772 },
    } as const;

    for (const format of ["near", "mid", "far"] as const) {
      const png = await readFile(`out/designs/halden-house/car-park.${format}.png`);
      expect(dimensions(png), format).toEqual(expected[format]);
    }
  });

  it("renders both buildings", async () => {
    const png = await readFile("out/designs/foundry-nine/car-park.far.png");
    expect(dimensions(png)).toEqual({ width: 5315, height: 1772 });
  });
});
