import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { render } from "@hyper-elements/react";
import sheet from "../templates/sign-sheet";

const DESIGN = "designs/_schedule/halden-house.values.json";
const PDF = "out/designs/_schedule/halden-house.a3.pdf";

const VALUES = {
  building: "Halden House",
  rows: [
    {
      destination: "Car park",
      long: "Visitor car park — follow the blue P signs past the north gate",
      medium: "Visitor car park, north gate",
      short: "Visitor car park",
    },
  ],
};

describe("the sign schedule", () => {
  it("labels itself as design proofs, not print files", async () => {
    const { html } = await render(sheet.design(VALUES, { format: "a3" }));
    expect(html).toContain("Design proofs, not print files.");
  });

  it("renders an A3 PDF", async () => {
    execFileSync("npx", ["hyper-elements", "render", DESIGN], { stdio: "pipe" });
    const bytes = await readFile(PDF);
    expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(2_000);
  });
});
