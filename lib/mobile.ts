// The mobile label's production origin. The single place the portfolio knows
// where the label lives — redirects and outbound links read it, so a future
// custom-domain switch is a one-line edit.
export const MOBILE_ORIGIN = "https://mobile-chi-green.vercel.app";

export const MOBILE_SLUGS = [
  "senses",
  "studytool",
  "vox-android",
  "juniper",
] as const;
