import { describe, expect, it } from "vitest";
import { FORMATS, FORMAT_LABEL } from "../src/formats";
import { copyFor, copyFormFor } from "../src/copy";

describe("formats", () => {
  it("matches the proof sizes the spec measured at 150 DPI", () => {
    expect(FORMATS.near).toEqual({ width: 1772, height: 1181, scale: 1 });
    expect(FORMATS.mid).toEqual({ width: 3543, height: 1772, scale: 1 });
    expect(FORMATS.far).toEqual({ width: 5315, height: 1772, scale: 1 });
  });

  it("labels each format by its viewing distance", () => {
    expect(FORMAT_LABEL.near).toBe("3 m");
    expect(FORMAT_LABEL.mid).toBe("12 m");
    expect(FORMAT_LABEL.far).toBe("30 m");
  });
});

describe("copy-by-distance", () => {
  const v = {
    long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
    medium: "Visitor car park, north gate",
    short: "Visitor car park",
  };

  it("chooses the copy from the distance, not from a field", () => {
    expect(copyFormFor("near")).toBe("long");
    expect(copyFormFor("mid")).toBe("medium");
    expect(copyFormFor("far")).toBe("short");
  });

  it("draws the long form at 3 m", () => {
    expect(copyFor("near", v)).toEqual({ field: "long", text: v.long, fellBack: false });
  });

  it("draws the medium form at 12 m", () => {
    expect(copyFor("mid", v)).toEqual({ field: "medium", text: v.medium, fellBack: false });
  });

  it("draws the short form at 30 m", () => {
    expect(copyFor("far", v)).toEqual({ field: "short", text: v.short, fellBack: false });
  });

  it("falls back to the long form at 30 m, and says so, when the short form is missing", () => {
    expect(copyFor("far", { long: v.long, medium: v.medium })).toEqual({
      field: "short",
      text: v.long,
      fellBack: true,
    });
  });

  it("treats a whitespace-only short form as missing", () => {
    expect(copyFor("far", { ...v, short: "   " })).toEqual({
      field: "short",
      text: v.long,
      fellBack: true,
    });
  });
});
