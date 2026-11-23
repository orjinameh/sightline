import {
  Canvas,
  Column,
  Heading,
  Image,
  Polygon,
  Row,
  Svg,
  Text,
  prop,
  token,
} from "@hyper-elements/react";
import { field, fitInside, template } from "@hyper-elements/react/template";
import { copyFor } from "../src/copy";
import { layoutFor, type FormatLayout } from "../src/layout";
import { FORMATS, FORMAT_LABEL, type FormatName } from "../src/formats";
import { haldenHouse, type SignBrand } from "../brand";

/**
 * Paths, not bytes: a Canvas's `fonts` prop takes file paths, data: URIs or http(s) URLs.
 * Font bytes belong to renderImage's options. Every weight used below must be present, or
 * image/font-weight is an error.
 */
const FONT_FACES = [
  { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-400-normal.woff", weight: 400 },
  { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-500-normal.woff", weight: 500 },
  { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-600-normal.woff", weight: 600 },
  { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-700-normal.woff", weight: 700 },
  { family: "Barlow Condensed", src: "../assets/fonts/barlow-condensed-latin-500-normal.woff", weight: 500 },
  { family: "Barlow Condensed", src: "../assets/fonts/barlow-condensed-latin-600-normal.woff", weight: 600 },
  { family: "Barlow Condensed", src: "../assets/fonts/barlow-condensed-latin-700-normal.woff", weight: 700 },
];

type ArrowDir = "left" | "right" | "up" | "down" | "none";

const ARROW_POINTS: Record<ArrowDir, string> = {
  // The apex is the first point: x=96 points right, x=4 points left.
  right: "96,50 50,12 50,36 4,36 4,64 50,64 50,88",
  left: "4,50 50,12 50,36 96,36 96,64 50,64 50,88",
  up: "50,4 12,50 36,50 36,96 64,96 64,50 88,50",
  down: "50,96 12,50 36,50 36,4 64,4 64,50 88,50",
  none: "",
};

function arrow(brand: SignBrand, L: FormatLayout, dir: ArrowDir) {
  if (dir === "none") return null;
  const points = ARROW_POINTS[dir];

  if (brand.arrowStyle === "chevron") {
    return (
      <Svg width={L.arrowBox} height={L.arrowBox} viewBox="0 0 100 100" style={{ flex: "none" }}>
        <Polygon points={points} style={{ fill: token("colors.primary") }} />
      </Svg>
    );
  }

  return (
    <Column
      style={{
        width: L.arrowBox,
        height: L.arrowBox,
        borderRadius: L.arrowBox / 2,
        backgroundColor: token("colors.primary"),
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Svg width={L.arrowBox * 0.56} height={L.arrowBox * 0.56} viewBox="0 0 100 100">
        <Polygon points={points} style={{ fill: token("colors.primaryForeground") }} />
      </Svg>
    </Column>
  );
}

export function signFamily(brand: SignBrand, id: string) {
  const family = brand.fontFamily;

  return template({
    id,
    version: "1.0.0",
    label: `Wayfinding sign family — ${brand.label}`,
    guidance:
      "One destination per design. Give the long form for 3 m, the medium form for 12 m, and a three- or four-word short form for 30 m. Leave the short form out and the 30 m sign refuses by design — that is the point.",
    root: "Canvas",
    formats: FORMATS,
    fields: {
      destination: prop.text({ label: "Destination", required: true, maxLength: 60 }),
      long: prop.text({ label: "Long form (3 m)", required: true, maxLength: 120 }),
      medium: prop.text({ label: "Medium form (12 m)", required: true, maxLength: 60 }),
      short: prop.text({
        label: "Short form (30 m)",
        required: false,
        maxLength: 30,
        guidance:
          "Three or four words. Left empty, the 30 m sign carries the long form and refuses with image/fit.",
      }),
      arrow: prop.choice(["left", "right", "up", "down", "none"], {
        label: "Arrow",
        default: "right",
      }),
      pictogram: field.image({
        label: "Pictogram",
        required: true,
        fit: "contain",
        aspect: { min: 0.8, max: 1.2 },
        minWidth: 512,
        accepts: ["svg", "png"],
        transparent: "required",
      }),
    },
    rules: {
      require: { core: ["canvas/overflow", "image/overflow", "image/glyph", "image/fit"] },
    },
    example: {
      destination: "Car park",
      long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
      medium: "Visitor car park, north gate",
      short: "Visitor car park",
      arrow: "right",
      pictogram: { src: `${brand.pictogramDir}/car-park.png`, width: 512, height: 512 },
    },
    render(v, { format }) {
      const name = format as FormatName;
      const L = layoutFor(name);
      const copy = copyFor(name, v);
      const art = fitInside(v.pictogram, { width: L.pictogramBox, height: L.pictogramBox });

      const heading = (
        <Heading
          field={copy.field}
          fit={{ sizes: [...L.fitSizes], maxLines: L.maxLines }}
          style={{
            fontFamily: family,
            fontWeight: 700,
            lineHeight: 1.04,
            color: token("colors.foreground"),
          }}
        >
          {copy.text}
        </Heading>
      );

      const copyColumn = (
        <Column style={{ width: L.copyColumnWidth }}>
          {heading}
        </Column>
      );

      const pictogram = (
        <Image field="pictogram" src={v.pictogram} alt="" style={art} />
      );

      const arrowEl = arrow(brand, L, v.arrow as ArrowDir);

      const main =
        L.arrangement === "row" ? (
          <Row style={{ gap: L.gap, alignItems: "center" }}>
            {pictogram}
            {copyColumn}
            {arrowEl}
          </Row>
        ) : (
          <Column style={{ gap: L.gap }}>
            {pictogram}
            <Row style={{ gap: L.gap, alignItems: "end" }}>
              {copyColumn}
              {arrowEl}
            </Row>
          </Column>
        );

      return (
        <Canvas
          width={L.width}
          height={L.height}
          fonts={FONT_FACES}
          theme={brand.theme}
          lang="en"
          style={{
            backgroundColor: token("colors.background"),
            padding: L.padding,
            fontFamily: family,
          }}
        >
          <Column
            style={{
              width: L.width - L.padding * 2,
              height: L.height - L.padding * 2,
              // Centre the copy in the sign and set the foot just beneath it. Pinning the foot to
              // the bottom edge with space-between left a dead void in the middle of the sign.
              justifyContent: "center",
              gap: L.gap,
            }}
          >
            {main}
            <Text
              style={{
                fontFamily: family,
                fontSize: L.footSize,
                fontWeight: 500,
                letterSpacing: L.footSize * 0.12,
                textTransform: "uppercase",
                color: token("colors.muted"),
              }}
            >
              {`${v.destination} · ${brand.label} · ${FORMAT_LABEL[name]}`}
            </Text>
          </Column>
        </Canvas>
      );
    },
  });
}

export default signFamily(haldenHouse, "sightline.SignFamily");
