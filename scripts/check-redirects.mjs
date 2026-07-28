// Asserts every carved-out /store slug permanently redirects to its Arsenic
// page against a local production server.
// Usage: npm run build && npx next start -p 3199, then:
//   node scripts/check-redirects.mjs
const ORIGIN = "http://localhost:3199";
const ARSENIC = "https://arsenic-pi.vercel.app"; // keep in sync with lib/arsenic.ts
const SLUGS = [
  "smear",
  "gravity-well",
  "white-hole",
  "fracture",
  "spectral-shuffler",
  "tc-tools",
  "sample-viewer",
  "audio-sort",
];

let failed = 0;
for (const slug of SLUGS) {
  const res = await fetch(`${ORIGIN}/store/${slug}`, { redirect: "manual" });
  const loc = res.headers.get("location");
  const ok = res.status === 308 && loc === `${ARSENIC}/${slug}`;
  if (!ok) {
    failed++;
    console.error(`FAIL /store/${slug} -> ${res.status} ${loc}`);
  } else {
    console.log(`ok   /store/${slug} -> ${loc}`);
  }
}
process.exit(failed ? 1 : 0);
