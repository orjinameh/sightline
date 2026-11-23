import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { foundryNineBuilding, haldenHouseBuilding } from "../src/directory";
import type { Building } from "../src/directory";

const TEMPLATE_VERSION = "1.0.0";

function valuesFile(b: Building, d: Building["destinations"][number]): unknown {
  return {
    version: 1,
    template: {
      module: `../../${b.templateModule}`,
      id: b.templateId,
      version: TEMPLATE_VERSION,
    },
    formats: ["near", "mid", "far"],
    values: {
      destination: d.destination,
      long: d.long,
      medium: d.medium,
      short: d.short,
      arrow: d.arrow,
      pictogram: {
        src: `../../${b.pictogramDir}/${d.pictogram}.png`,
        width: 512,
        height: 512,
      },
    },
  };
}

async function main(): Promise<void> {
  let written = 0;
  for (const b of [haldenHouseBuilding, foundryNineBuilding]) {
    for (const d of b.destinations) {
      const path = `designs/${b.id}/${d.slug}.values.json`;
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, `${JSON.stringify(valuesFile(b, d), null, 2)}\n`, "utf8");
      written += 1;
    }
  }
  console.log(`build:directory: wrote ${written} values files`);
}

await main();
