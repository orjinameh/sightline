export type FormatName = "near" | "mid" | "far";

/** The proof resolution. One constant, so the fallback ladder in spec §6.2 is a one-line change. */
export const DPI = 150;

const mmToPx = (mm: number): number => Math.round((mm / 25.4) * DPI);

/** The sign's physical size at each viewing distance. Design choices, not standards. */
export const MM: Record<FormatName, { width: number; height: number }> = {
  near: { width: 300, height: 200 },
  mid: { width: 600, height: 300 },
  far: { width: 900, height: 300 },
};

export const FORMATS: Record<FormatName, { width: number; height: number; scale: number }> = {
  near: { width: mmToPx(MM.near.width), height: mmToPx(MM.near.height), scale: 1 },
  mid: { width: mmToPx(MM.mid.width), height: mmToPx(MM.mid.height), scale: 1 },
  far: { width: mmToPx(MM.far.width), height: mmToPx(MM.far.height), scale: 1 },
};

export const FORMAT_LABEL: Record<FormatName, string> = {
  near: "3 m",
  mid: "12 m",
  far: "30 m",
};
