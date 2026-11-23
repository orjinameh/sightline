import type { FormatName } from "./formats";

export type CopyForm = "long" | "medium" | "short";

export type SignValues = {
  destination: string;
  long: string;
  medium: string;
  short?: string;
  arrow: "left" | "right" | "up" | "down" | "none";
  pictogram: { src: string; width: number; height: number };
};

export function copyFormFor(format: FormatName): CopyForm {
  if (format === "near") return "long";
  if (format === "mid") return "medium";
  return "short";
}

export function copyFor(
  format: FormatName,
  v: Pick<SignValues, "long" | "medium" | "short">
): { field: CopyForm; text: string; fellBack: boolean } {
  const field = copyFormFor(format);
  if (field === "long") return { field, text: v.long, fellBack: false };
  if (field === "medium") return { field, text: v.medium, fellBack: false };
  const short = (v.short ?? "").trim();
  if (short.length > 0) return { field: "short", text: short, fellBack: false };
  return { field: "short", text: v.long, fellBack: true };
}
