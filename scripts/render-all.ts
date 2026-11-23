import { execFileSync } from "node:child_process";

execFileSync("npx", ["hyper-elements", "render", "designs/", "--out", "out"], {
  stdio: "inherit",
});

console.log("render:designs: wrote out/designs/");
