// Asserts every carved-out mobile-line /store slug permanently redirects to
// its page on the mobile label site, against a local production server.
// Usage: npm run build && npm run start, then:
//   node scripts/check-mobile-redirects.mjs
const ORIGIN = "http://localhost:3000";
// lib/mobile.ts is the source of truth for these two constants; inlined here
// because importing the .ts from a plain .mjs script isn't reliable across
// Node versions. Keep in sync with lib/mobile.ts.
const MOBILE_ORIGIN = "https://mobile-chi-green.vercel.app";
const MOBILE_SLUGS = ["senses", "studytool", "vox-android", "juniper"];

let failed = 0;
for (const slug of MOBILE_SLUGS) {
  const res = await fetch(`${ORIGIN}/store/${slug}`, { redirect: "manual" });
  const loc = res.headers.get("location");
  const ok = (res.status === 301 || res.status === 308) && loc === `${MOBILE_ORIGIN}/${slug}`;
  if (!ok) {
    failed++;
    console.error(`FAIL /store/${slug} -> ${res.status} ${loc}`);
  } else {
    console.log(`ok   /store/${slug} -> ${loc} (${res.status})`);
  }
}
// process.exitCode (not process.exit()) — on this Node/Windows combo,
// process.exit() after a fetch() call crashes with a libuv assertion
// (`UV_HANDLE_CLOSING`, src/win/async.c) before the code takes effect.
// exitCode sets the same result without forcing an unclean shutdown.
process.exitCode = failed ? 1 : 0;
