import { describe, expect, it } from "vitest";
import { foundryNineBuilding, haldenHouseBuilding } from "../src/directory";

const buildings = [haldenHouseBuilding, foundryNineBuilding];

describe("the directory", () => {
  it("gives each building four destinations with a unique slug", () => {
    for (const b of buildings) {
      expect(b.destinations.length, b.id).toBe(4);
      const slugs = b.destinations.map((d) => d.slug);
      expect(new Set(slugs).size, b.id).toBe(slugs.length);
    }
  });

  it("gives every destination the three forms, and a short one short enough to fit 30 m", () => {
    for (const b of buildings) {
      for (const d of b.destinations) {
        expect(d.long.length, `${b.id}/${d.slug}`).toBeGreaterThan(d.medium.length);
        expect(d.medium.length, `${b.id}/${d.slug}`).toBeGreaterThanOrEqual(d.short.length);
        expect(d.short.length, `${b.id}/${d.slug}`).toBeLessThanOrEqual(30);
        expect(d.short.trim().split(/\s+/).length, `${b.id}/${d.slug}`).toBeLessThanOrEqual(4);
      }
    }
  });

  it("points each building at its own template and pictogram colourway", () => {
    expect(haldenHouseBuilding.templateId).toBe("sightline.SignFamily");
    expect(foundryNineBuilding.templateId).toBe("sightline.SignFamilyFoundry");
    expect(haldenHouseBuilding.pictogramDir).not.toBe(foundryNineBuilding.pictogramDir);
  });
});
