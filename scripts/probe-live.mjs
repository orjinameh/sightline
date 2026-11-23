import { spawn } from "node:child_process";

/**
 * Owns the whole `next start` lifecycle.
 *
 * Two traps this guards against:
 * 1. `next start` spawns a `next-server` grandchild. Killing the `npx` wrapper leaves it listening, so
 *    a later run would silently test stale code. We spawn detached and kill the whole process group.
 * 2. A fixed port lets a leftover server answer for us. The port is random, and EADDRINUSE fails fast.
 */
const PORT = 3200 + Math.floor(Math.random() * 300);
const BASE = `http://127.0.0.1:${PORT}`;

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "production" },
  detached: true,
});

let log = "";
server.stdout.on("data", (b) => (log += b));
server.stderr.on("data", (b) => (log += b));

function stop() {
  try {
    // Negative pid = the whole process group, so next-server goes too.
    process.kill(-server.pid, "SIGTERM");
  } catch {
    /* already gone */
  }
}

async function waitForServer() {
  for (let i = 0; i < 90; i++) {
    if (/EADDRINUSE/.test(log)) {
      throw new Error(`port ${PORT} already in use — a stale server would shadow this run\n${log}`);
    }
    try {
      const r = await fetch(`${BASE}/api/render`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      if (r.status > 0) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server did not start on ${PORT}\n${log}`);
}

function check(name, condition, detail) {
  if (!condition) {
    console.error(`FAIL ${name}: ${detail}`);
    stop();
    process.exit(1);
  }
  console.log(`ok   ${name}`);
}

const BASE_VALUES = {
  destination: "Car park",
  long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
  medium: "Visitor car park, north gate",
  arrow: "right",
  pictogram: "car-park",
};

try {
  await waitForServer();

  const refusal = await fetch(`${BASE}/api/render`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(BASE_VALUES),
  });
  const refused = await refusal.json();
  const diagnostics = refused.diagnostics ?? [];
  const fit = diagnostics.find((d) => d.code === "image/fit");
  const strayFont = diagnostics.filter((d) => d.code === "image/font");

  check("refusal status is 422", refusal.status === 422, `got ${refusal.status}`);
  check("refusal reports image/fit", Boolean(fit), JSON.stringify(diagnostics));
  check("refusal names the short field", fit?.field === "short", JSON.stringify(fit));
  check("refusal withholds the far image", !refused.images?.far, "far image was returned");
  check(
    "no spurious image/font diagnostics",
    strayFont.length === 0,
    `${strayFont.length} image/font: ${JSON.stringify(strayFont[0] ?? {})}`
  );
  check(
    "only the refusal is reported",
    diagnostics.length === 1,
    `${diagnostics.length} diagnostics: ${JSON.stringify(diagnostics.map((d) => d.code))}`
  );

  const ok = await fetch(`${BASE}/api/render`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...BASE_VALUES, short: "Visitor car park" }),
  });
  const passed = await ok.json();
  check("valid status is 200", ok.status === 200, `got ${ok.status}`);
  check(
    "valid returns three images",
    ["near", "mid", "far"].every((f) => passed.images?.[f]),
    JSON.stringify(Object.keys(passed.images ?? {}))
  );
  check(
    "images are PNG data URLs",
    String(passed.images?.far ?? "").startsWith("data:image/png;base64,"),
    String(passed.images?.far ?? "").slice(0, 40)
  );
  check("valid reports no diagnostics", (passed.diagnostics ?? []).length === 0, JSON.stringify(passed.diagnostics));

  stop();
  process.exit(0);
} catch (error) {
  console.error(String(error));
  stop();
  process.exit(1);
}
