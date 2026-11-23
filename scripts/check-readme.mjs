import { readFileSync } from "node:fs";

const STAMP = "<!-- readme-schema: R3-cli-tool v1 -->";

const WANT = [
  "# Sightline",
  "## Demo",
  "## What it does",
  "## Quickstart",
  "## Built at Hyper Elements Template Challenge",
  "## Install",
  "## Usage",
  "## Commands / API reference",
  "## How it works",
  "## Roadmap",
  "## License",
];

const FORBIDDEN = ["print-ready", "ADA compliant at 30 m", "the legal maximum is six words"];

const REQUIRED = [
  "These are design proofs, not print files.",
  "declared assumption",
  "house limit",
  "image/fit",
  "npx hyper-elements describe",
];

const text = readFileSync("README.md", "utf8");
const lines = text.split(/\r?\n/);

const fail = (message) => {
  console.log(`FAIL: ${message}`);
  process.exit(1);
};

if (lines[0] !== STAMP) fail(`line 1 is not the schema stamp: ${JSON.stringify(lines[0])}`);

let inFence = false;
const got = [];
for (const line of lines) {
  if (line.startsWith("```")) {
    inFence = !inFence;
    continue;
  }
  if (!inFence && /^#{1,2} /.test(line)) got.push(line);
}

if (got.length !== WANT.length) {
  fail(`expected ${WANT.length} headings, found ${got.length}: ${JSON.stringify(got)}`);
}
for (let i = 0; i < WANT.length; i++) {
  if (got[i] !== WANT[i]) {
    fail(`heading ${i + 1}: expected ${JSON.stringify(WANT[i])}, found ${JSON.stringify(got[i])}`);
  }
}

const lower = text.toLowerCase();
for (const phrase of FORBIDDEN) {
  if (lower.includes(phrase.toLowerCase())) {
    fail(`forbidden string present: ${JSON.stringify(phrase)}`);
  }
}

for (const fragment of REQUIRED) {
  if (!text.includes(fragment)) fail(`required fragment missing: ${JSON.stringify(fragment)}`);
}

const firstImage = text.match(/!\[[^\]]*\]\(([^)\s]+)/);
if (!firstImage) fail("no image found");
if (!firstImage[1].endsWith("docs/images/contract.png")) {
  fail(`the first image must be docs/images/contract.png, found ${firstImage[1]}`);
}

console.log("PASS");
