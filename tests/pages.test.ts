import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const FORBIDDEN = ["print-ready", "ADA compliant at 30 m", "the legal maximum is six words"];

describe("the preview page", () => {
  it("opens with the contract, and every path is relative to docs/", async () => {
    const html = await readFile("docs/index.html", "utf8");
    expect(html).toContain("<title>Sightline</title>");

    const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    expect(imgs[0]).toBe("images/contract.png");
    expect(imgs).toContain("images/strip.png");
    expect(imgs.some((src) => src.includes("signs/foundry-nine"))).toBe(true);

    for (const phrase of FORBIDDEN) {
      expect(html.toLowerCase(), phrase).not.toContain(phrase.toLowerCase());
    }
  });

  it("can be deployed to Vercel as a static site", async () => {
    const cfg = JSON.parse(await readFile("vercel.json", "utf8")) as {
      outputDirectory?: string;
    };
    expect(cfg.outputDirectory).toBe("docs");
  });
});
