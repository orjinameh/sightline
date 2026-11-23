import { describe, expect, it } from "vitest";
import { FORMATS, type FormatName } from "../src/formats";
import { LAYOUT, layoutFor } from "../src/layout";

const FORMATS_LIST: FormatName[] = ["near", "mid", "far"];

describe("layout", () => {
  it("gives every format geometry that fits inside the canvas", () => {
    for (const name of FORMATS_LIST) {
      const L = layoutFor(name);
      expect(L.width).toBe(FORMATS[name].width);
      expect(L.height).toBe(FORMATS[name].height);
      expect(L.padding * 2 + L.copyColumnWidth, name).toBeLessThanOrEqual(L.width);
    }
  });

  it("bounds the copy column instead of giving it the whole canvas", () => {
    // The copy budget is the column, not the canvas: at full width a long form fits on one line
    // and nothing refuses (spec §7.3).
    expect(LAYOUT.far.copyColumnWidth).toBeLessThan(FORMATS.far.width * 0.7);
    expect(LAYOUT.mid.copyColumnWidth).toBeLessThan(FORMATS.mid.width * 0.7);
  });

  it("fits the far copy on exactly one line, and the near copy on several", () => {
    expect(LAYOUT.far.maxLines).toBe(1);
    expect(LAYOUT.mid.maxLines).toBe(1);
    expect(LAYOUT.near.maxLines).toBeGreaterThan(1);
  });

  it("tries type sizes from largest to smallest", () => {
    for (const name of FORMATS_LIST) {
      const sizes = LAYOUT[name].fitSizes;
      expect(sizes.length, name).toBeGreaterThan(0);
      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i]!).toBeLessThan(sizes[i - 1]!);
      }
    }
  });

  it("stacks the near sign and runs the mid and far signs horizontally", () => {
    expect(LAYOUT.near.arrangement).toBe("stacked");
    expect(LAYOUT.mid.arrangement).toBe("row");
    expect(LAYOUT.far.arrangement).toBe("row");
  });
});
