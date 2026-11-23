import { FORMATS, type FormatName } from "./formats";

export type Arrangement = "stacked" | "row";

export type FormatLayout = {
  width: number;
  height: number;
  padding: number;
  arrangement: Arrangement;
  copyColumnWidth: number;
  fitSizes: readonly number[];
  maxLines: number;
  pictogramBox: number;
  arrowBox: number;
  gap: number;
  footSize: number;
};

/**
 * The copy column is the copy budget. At the far format's full width an 82-character long form
 * fits on one line at 120 px and nothing refuses — so the copy gets 3200 px, and that is what
 * "cannot fit" means. Change these numbers and re-run the refusal test.
 */
export const LAYOUT: Record<FormatName, FormatLayout> = {
  near: {
    width: FORMATS.near.width,
    height: FORMATS.near.height,
    padding: 72,
    arrangement: "stacked",
    copyColumnWidth: 1478,
    fitSizes: [72, 64, 56],
    maxLines: 3,
    pictogramBox: 260,
    arrowBox: 110,
    gap: 40,
    footSize: 24,
  },
  mid: {
    width: FORMATS.mid.width,
    height: FORMATS.mid.height,
    padding: 96,
    arrangement: "row",
    copyColumnWidth: 2100,
    fitSizes: [104, 92, 80],
    maxLines: 1,
    pictogramBox: 340,
    arrowBox: 150,
    gap: 44,
    footSize: 28,
  },
  far: {
    width: FORMATS.far.width,
    height: FORMATS.far.height,
    padding: 120,
    arrangement: "row",
    copyColumnWidth: 3200,
    // 340 px is where a four-word short form fills the 3200 px column; the long form needs roughly
    // 12,600 px at the smallest size, so the refusal stays decisive.
    fitSizes: [400, 340, 280],
    maxLines: 1,
    pictogramBox: 420,
    arrowBox: 200,
    gap: 56,
    footSize: 32,
  },
};

export function layoutFor(format: FormatName): FormatLayout {
  return LAYOUT[format];
}
