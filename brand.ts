import { defineTheme, extendTheme } from "@hyper-elements/react";
import type { ThemeInput } from "@hyper-elements/react";

export type ArrowStyle = "circle" | "chevron";

export type SignBrand = {
  id: string;
  label: string;
  arrowStyle: ArrowStyle;
  /** The family the template sets on every text node. Must have a file in FONT_FACES. */
  fontFamily: string;
  /** Relative to `templates/`, so a design's example resolves its pictogram. */
  pictogramDir: string;
  theme: ThemeInput;
};

const base = defineTheme({
  colors: {
    background: "#FFFFFF",
    foreground: "#14201C",
    primary: "#1F4D3F",
    primaryForeground: "#FFFFFF",
    muted: "#5A6660",
    border: "#D9D4C8",
  },
  fontSizes: { body: 32 },
  lineHeights: { body: 1.15 },
  fonts: { body: "IBM Plex Sans", heading: "IBM Plex Sans" },
  radii: { md: 12 },
});

export const haldenHouse: SignBrand = {
  id: "halden-house",
  label: "Halden House",
  arrowStyle: "circle",
  fontFamily: "IBM Plex Sans",
  pictogramDir: "../assets/pictograms",
  theme: extendTheme(base, {
    colors: {
      background: "#F4F1EA",
      foreground: "#14201C",
      primary: "#1F4D3F",
      primaryForeground: "#F4F1EA",
      muted: "#6B6A5F",
      border: "#DAD3C2",
    },
  }),
};

export const foundryNine: SignBrand = {
  id: "foundry-nine",
  label: "Foundry Nine",
  arrowStyle: "chevron",
  fontFamily: "Barlow Condensed",
  pictogramDir: "../assets/pictograms/light",
  theme: extendTheme(base, {
    colors: {
      background: "#0B0B0C",
      foreground: "#FFFFFF",
      primary: "#F5D90A",
      primaryForeground: "#0B0B0C",
      muted: "#A8A8A8",
      border: "#2A2A2E",
    },
    fonts: { body: "Barlow Condensed", heading: "Barlow Condensed" },
    fontSizes: { body: 36 },
  }),
};

export const brands = { "halden-house": haldenHouse, "foundry-nine": foundryNine };

export const legibility = {
  // ADA 2010 Standards Table 703.5.5 within its scope (characters 40-120 in above the floor).
  // Beyond that scope this ratio is OUR assumption; replace it with your fabricator's.
  ratio: 0.0125, // character height / viewing distance, far-field assumption
  houseWordLimit: 6, // our house limit, not a legal maximum
  scope: "characters 40-120 in above the floor (ADA 2010 Standards Table 703.5.5)",
  beyond: "beyond that distance the ratio is a declared assumption, not a standard",
} as const;
