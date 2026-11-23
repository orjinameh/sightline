import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

function size(png: Buffer): { w: number; h: number } {
  return { w: png.readUInt32BE(16), h: png.readUInt32BE(20) };
}

describe("the demo", () => {
  it("reproduces every image in one command", async () => {
    // No directory deletion: this suite runs alongside the render and strip tests, and they
    // share out/ and docs/images. Asserting real dimensions is what catches a blank render.
    execFileSync("npm", ["run", "demo"], { stdio: "pipe" });

    expect(size(await readFile("docs/images/strip.png"))).toEqual({ w: 3840, h: 800 });
    expect(size(await readFile("docs/images/contract.png"))).toEqual({ w: 2000, h: 1400 });

    const described = JSON.parse(await readFile("docs/contract.json", "utf8")) as {
      formats: Record<string, unknown>;
    };
    expect(Object.keys(described.formats)).toEqual(["near", "mid", "far"]);

    const expected = {
      "out/designs/halden-house/car-park.near.png": { w: 1772, h: 1181 },
      "out/designs/halden-house/car-park.mid.png": { w: 3543, h: 1772 },
      "out/designs/halden-house/car-park.far.png": { w: 5315, h: 1772 },
      "out/designs/foundry-nine/car-park.far.png": { w: 5315, h: 1772 },
    } as const;

    for (const [path, dims] of Object.entries(expected)) {
      expect(size(await readFile(path)), path).toEqual(dims);
    }
  });
});
