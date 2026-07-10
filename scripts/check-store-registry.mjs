// Prebuild drift check for the /store registry. Bespoke page files can drift
// from registry data (a templated [slug] route couldn't); this check is the
// price of bespoke. Runs offline against repo state only.
//
// Asserts, bidirectionally:
//   - every status:"page" slug has app/store/<slug>/page.tsx
//   - every directory under app/store/ has a registry entry with status "page"
// Plus registry shape: required nonempty string fields, tag === slug,
// niche resolves, no duplicate slugs, status in the allowed set.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(
  readFileSync(path.join(repo, "components/store/registry-data.json"), "utf8")
);

const errors = [];
const nicheIds = new Set(data.niches.map((n) => n.id));
const seen = new Set();
const REQUIRED = ["slug", "title", "niche", "pitch", "audience", "tag", "status", "capturePrompt", "captureCta"];
const STATUSES = new Set(["page", "listed", "retired"]);

for (const t of data.tools) {
  const id = t.slug ?? "(missing slug)";
  for (const f of REQUIRED) {
    if (typeof t[f] !== "string" || t[f].length === 0) {
      errors.push(`${id}: missing or empty "${f}"`);
    }
  }
  if (t.tag !== t.slug) errors.push(`${id}: tag ("${t.tag}") must equal slug`);
  if (!nicheIds.has(t.niche)) errors.push(`${id}: unknown niche "${t.niche}"`);
  if (!STATUSES.has(t.status)) errors.push(`${id}: invalid status "${t.status}"`);
  if (seen.has(t.slug)) errors.push(`duplicate slug "${t.slug}"`);
  seen.add(t.slug);
  if (t.status === "page" && !existsSync(path.join(repo, "app/store", t.slug, "page.tsx"))) {
    errors.push(`${id}: status "page" but app/store/${t.slug}/page.tsx does not exist`);
  }
}

const storeDir = path.join(repo, "app/store");
const dirs = existsSync(storeDir)
  ? readdirSync(storeDir, { withFileTypes: true }).filter((d) => d.isDirectory())
  : [];
for (const d of dirs) {
  const t = data.tools.find((x) => x.slug === d.name);
  if (!t) errors.push(`app/store/${d.name}/ exists but has no registry entry`);
  else if (t.status !== "page")
    errors.push(`app/store/${d.name}/ exists but registry status is "${t.status}" (expected "page")`);
}

if (errors.length > 0) {
  console.error("store registry check FAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`store registry check OK — ${data.tools.length} tools, ${dirs.length} built pages`);
