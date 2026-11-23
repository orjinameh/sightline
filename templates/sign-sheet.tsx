import {
  Column,
  Document,
  Heading,
  Table,
  TableCell,
  TableRow,
  Text,
  prop,
} from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { MM, FORMAT_LABEL } from "../src/formats";
import type { SignBrand } from "../brand";

const FONT_FACES = [
  { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-400-normal.woff", weight: 400 },
  { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-600-normal.woff", weight: 600 },
  { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-700-normal.woff", weight: 700 },
];

const row = prop.object(
  {
    destination: prop.text({ label: "Destination", required: true, maxLength: 60 }),
    long: prop.text({ label: "Long form (3 m)", required: true, maxLength: 120 }),
    medium: prop.text({ label: "Medium form (12 m)", required: true, maxLength: 60 }),
    short: prop.text({ label: "Short form (30 m)", required: false, maxLength: 30 }),
  },
  { label: "Destination row" }
);

export function signSheet(brand: SignBrand) {
  return template({
    id: "sightline.SignSheet",
    version: "1.0.0",
    label: `Sign schedule — ${brand.label}`,
    root: "Document",
    formats: { a3: { size: "A3", orientation: "landscape" } },
    fields: {
      building: prop.text({ label: "Building", required: true, maxLength: 60 }),
      rows: prop.list(row, { label: "Destinations", min: 1, max: 8 }),
    },
    rules: { require: { core: ["document/overflow", "layout/overflow"] } },
    example: {
      building: brand.label,
      rows: [
        {
          destination: "Car park",
          long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
          medium: "Visitor car park, north gate",
          short: "Visitor car park",
        },
        {
          destination: "Toilets",
          long: "Toilets and accessible toilet, through the double doors on your left",
          medium: "Toilets, on your left",
          short: "Toilets",
        },
      ],
    },
    render(v) {
      const sizes = `near ${MM.near.width}×${MM.near.height} · mid ${MM.mid.width}×${MM.mid.height} · far ${MM.far.width}×${MM.far.height} mm`;
      return (
        <Document
          size="A3"
          orientation="landscape"
          fonts={FONT_FACES}
          lang="en"
          margin={40}
          style={{ fontFamily: "IBM Plex Sans" }}
        >
          <Column style={{ gap: 14 }}>
            <Heading level={1} style={{ fontFamily: "IBM Plex Sans", fontSize: 26, fontWeight: 700 }}>
              {`Sign schedule — ${v.building}`}
            </Heading>
            <Text style={{ fontFamily: "IBM Plex Sans", fontSize: 10, fontWeight: 400 }}>
              {`Design proofs, not print files. ${sizes}. Character height follows ADA 2010 Standards Table 703.5.5 within its scope; beyond that the ratio in brand.ts is a declared assumption, and six words is a house limit, not a legal one.`}
            </Text>
            <Table
              style={{
                cellPadding: [6, 8],
                rowBorder: { width: 1, style: "solid", color: "#DAD3C2" },
              }}
            >
              <TableRow header>
                <TableCell>Destination</TableCell>
                <TableCell>{`Long form — ${FORMAT_LABEL.near}`}</TableCell>
                <TableCell>{`Medium form — ${FORMAT_LABEL.mid}`}</TableCell>
                <TableCell>{`Short form — ${FORMAT_LABEL.far}`}</TableCell>
              </TableRow>
              {v.rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell style={{ fontWeight: 600 }}>{r.destination}</TableCell>
                  <TableCell>{r.long}</TableCell>
                  <TableCell>{r.medium}</TableCell>
                  <TableCell>{r.short ?? "— refuses: write the short form"}</TableCell>
                </TableRow>
              ))}
            </Table>
          </Column>
        </Document>
      );
    },
  });
}

import { haldenHouse } from "../brand";

export default signSheet(haldenHouse);
