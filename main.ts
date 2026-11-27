// DealRadar hand-in program (Node 22, standard library only).
// Copies the static site (app/) and its screenshots into the grader's output
// directory and writes dossier.json with the kit's vendored library, so the
// judge reads exactly what the site ships. Run it as:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function fail(message) {
  console.error(`dealradar: ${message}`);
  process.exit(1);
}

if (!existsSync(join(repoRoot, "app", "index.html"))) fail("app/index.html is missing");
if (!existsSync(join(repoRoot, "vendor", "makefun-frontend.ts"))) fail("vendor/makefun-frontend.ts is missing");

const shots = existsSync(join(repoRoot, "screenshots"))
  ? readdirSync(join(repoRoot, "screenshots")).filter((f) => !f.startsWith(".") && statSync(join(repoRoot, "screenshots", f)).isFile())
  : [];
if (shots.length < 3 || shots.length > 4) fail(`expected 3 or 4 screenshots, found ${shots.length}`);

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });

writeFileSync(
  join(outDir, "dossier.json"),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

console.log(`dealradar: wrote ${shots.length} screenshots and dossier.json to ${outDir}`);
