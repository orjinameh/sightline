import localFont from "next/font/local";
import type { ReactNode } from "react";

/**
 * The same WOFF files the template renders with, so the page and the signs agree. `next/font/local`
 * fingerprints and self-hosts them; nothing is fetched from a CDN.
 */
const plex = localFont({
  src: [
    { path: "../assets/fonts/ibm-plex-sans-latin-400-normal.woff", weight: "400", style: "normal" },
    { path: "../assets/fonts/ibm-plex-sans-latin-500-normal.woff", weight: "500", style: "normal" },
    { path: "../assets/fonts/ibm-plex-sans-latin-600-normal.woff", weight: "600", style: "normal" },
    { path: "../assets/fonts/ibm-plex-sans-latin-700-normal.woff", weight: "700", style: "normal" },
  ],
  display: "swap",
  fallback: ["-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata = {
  title: "Sightline",
  description:
    "A wayfinding sign family where one directory of destinations renders at 3 m, 12 m and 30 m — and the distance changes the copy.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={plex.className}>
      <body
        style={{
          margin: 0,
          background: "#F4F1EA",
          color: "#14201C",
          fontFamily: plex.style.fontFamily,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {children}
      </body>
    </html>
  );
}
