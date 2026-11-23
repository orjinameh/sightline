import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("the strip", () => {
  it("puts the three distances at one scale in a single image", async () => {
    const png = await readFile("docs/images/strip.png");
    expect(png.readUInt32BE(16)).toBe(3840);
    expect(png.readUInt32BE(20)).toBe(800);
    expect(png.length).toBeGreaterThan(50_000);
  });
});
