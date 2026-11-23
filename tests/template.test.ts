import { describe, expect, it } from "vitest";
import family from "../templates/sign-family";
import foundry from "../templates/sign-family-foundry";

const EXAMPLE = {
  destination: "Car park",
  long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
  medium: "Visitor car park, north gate",
  short: "Visitor car park",
  arrow: "right" as const,
  pictogram: { src: "../assets/pictograms/car-park.png", width: 512, height: 512 },
};

describe("the sign family", () => {
  it("opens three formats and six fields", () => {
    const d = family.describe();
    expect(Object.keys(d.formats ?? {})).toEqual(["near", "mid", "far"]);
    expect(d.fields.map((f) => f.path).sort()).toEqual(
      ["arrow", "destination", "long", "medium", "pictogram", "short"].sort()
    );
  });

  it("requires all four measured rules", () => {
    const d = family.describe();
    const core = (d.rules?.core ?? []).map((r) => (typeof r === "string" ? r : r.code));
    expect(core).toEqual(["canvas/overflow", "image/overflow", "image/glyph", "image/fit"]);
  });

  it("publishes each image's region in every format", () => {
    const d = family.describe();
    const pictogram = d.fields.find((f) => f.path === "pictogram") as
      | { regions?: Record<string, { box: number[]; pixels: number[] }> }
      | undefined;
    expect(Object.keys(pictogram?.regions ?? {})).toEqual(["near", "mid", "far"]);
    for (const region of Object.values(pictogram?.regions ?? {})) {
      expect(region.box).toHaveLength(2);
      expect(region.pixels).toHaveLength(2);
    }
  });

  it("makes a second building from the same factory, under its own id", () => {
    expect(family.describe().id).toBe("sightline.SignFamily");
    expect(foundry.describe().id).toBe("sightline.SignFamilyFoundry");
  });

  it("accepts its example in every format", () => {
    for (const format of ["near", "mid", "far"] as const) {
      const checked = family.check(EXAMPLE, { format });
      expect(checked.valid, format).toBe(true);
    }
  });
});
