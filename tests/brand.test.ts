import { describe, expect, it } from "vitest";
import { brands, foundryNine, haldenHouse, legibility } from "../brand";

describe("brands", () => {
  it("makes two buildings from one base theme", () => {
    expect(Object.keys(brands)).toEqual(["halden-house", "foundry-nine"]);
    expect(haldenHouse.theme).toBeDefined();
    expect(foundryNine.theme).toBeDefined();
    expect(haldenHouse.theme).not.toBe(foundryNine.theme);
  });

  it("makes them visibly different in type and arrow", () => {
    expect(haldenHouse.fontFamily).not.toBe(foundryNine.fontFamily);
    expect(haldenHouse.arrowStyle).not.toBe(foundryNine.arrowStyle);
  });

  it("points each building at its own pictogram colourway", () => {
    expect(haldenHouse.pictogramDir).toBe("../assets/pictograms");
    expect(foundryNine.pictogramDir).toBe("../assets/pictograms/light");
  });
});

describe("legibility", () => {
  it("is a declared assumption, not a rule", () => {
    expect(legibility.ratio).toBe(0.0125);
    expect(legibility.houseWordLimit).toBe(6);
  });

  it("cites the standard only within its scope", () => {
    expect(legibility.scope).toContain("703.5.5");
    expect(legibility.scope).toContain("40");
    expect(legibility.scope).toContain("120");
    expect(legibility.beyond).toContain("assumption");
  });
});
