import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { foundryNineBuilding, haldenHouseBuilding } from "../src/directory";

describe("the generated family", () => {
  it("writes one values file per destination per building", async () => {
    for (const b of [haldenHouseBuilding, foundryNineBuilding]) {
      for (const d of b.destinations) {
        const path = `designs/${b.id}/${d.slug}.values.json`;
        const file = JSON.parse(await readFile(path, "utf8")) as {
          template: { id: string; module: string; version: string };
          formats: string[];
          values: { short?: string; pictogram: { src: string } };
        };
        expect(file.template.id, path).toBe(b.templateId);
        expect(file.template.module, path).toBe(`../../${b.templateModule}`);
        expect(file.formats, path).toEqual(["near", "mid", "far"]);
        expect(file.values.short, path).toBe(d.short);
        expect(file.values.pictogram.src, path).toBe(
          `../../${b.pictogramDir}/${d.pictogram}.png`
        );
      }
    }
  });
});
