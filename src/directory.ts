export type PictogramName = "car-park" | "toilets" | "reception" | "lift" | "exit";

export type Arrow = "left" | "right" | "up" | "down" | "none";

/**
 * The directory's shape — deliberately NOT `SignValues`. A destination carries a pictogram
 * *name*; `scripts/build-directory.ts` maps it to the `{ src, width, height }` that
 * `SignValues.pictogram` expects. Keeping them apart is what lets one directory feed two
 * colourways, and it keeps the directory free of file paths.
 */
export type Destination = {
  slug: string;
  destination: string;
  long: string;
  medium: string;
  short: string;
  arrow: Arrow;
  pictogram: PictogramName;
};

export type Building = {
  id: string;
  label: string;
  /** Repo-root relative, e.g. "templates/sign-family.tsx". */
  templateModule: string;
  templateId: string;
  /** Repo-root relative, e.g. "assets/pictograms". */
  pictogramDir: string;
  destinations: Destination[];
};

export { haldenHouseBuilding } from "../directory/halden-house";
export { foundryNineBuilding } from "../directory/foundry-nine";
