// Single source of truth for the store. Adding a product or filling in a
// Gumroad URL / YouTube ID / Buttondown username is a config change here —
// no component edits.

export interface StoreProduct {
  id: string;
  title: string;
  hook: string;
  tags: string[];
  githubUrl: string;
  screenshot?: string;   // path under /public
  videoId?: string;      // YouTube ID; when set, replaces the screenshot
  gumroadUrl?: string;   // when unset, card shows a non-broken "soon" state
  status: "live" | "waitlist";
}

// Buttondown username for the beta waitlist. Empty string = form renders
// disabled with a "soon" hint.
export const BUTTONDOWN_USERNAME = "";

export const PRODUCTS: StoreProduct[] = [
  {
    id: "smear",
    title: "Smear",
    hook: "Spectral blur — magnitudes smear through time along a phase-coherence axis, from intact pitch to Paulstretch wash. Freeze holds the spectrum forever.",
    tags: ["Windows", "VST3", "source on GitHub"],
    githubUrl: "https://github.com/hadencain/smear",
    status: "live",
  },
  {
    id: "gravity-well",
    title: "Gravity Well",
    hook: "Spectral black hole — audio redshifts toward a floor frequency, pools into the sub-bass, and time dilates as mass accumulates.",
    tags: ["Windows", "VST3", "source on GitHub"],
    githubUrl: "https://github.com/hadencain/gravityWell",
    screenshot: "/store/gravity-well.png",
    status: "live",
  },
  {
    id: "white-hole",
    title: "White Hole",
    hook: "Anti-mass spectral leveler — a repulsion field lifts buried content into audibility and flattens peaks toward the floor. The black hole's opposite.",
    tags: ["Windows", "VST3", "source on GitHub"],
    githubUrl: "https://github.com/hadencain/whiteHole",
    screenshot: "/store/white-hole.png",
    status: "live",
  },
  {
    id: "fracture",
    title: "Fracture",
    hook: "Granular reverb — a feedback-delay-network tail fragmented by a grain engine into disintegrating, crystalline decays.",
    tags: ["Windows", "VST3", "source on GitHub"],
    githubUrl: "https://github.com/hadencain/fracturedReverb",
    status: "live",
  },
  {
    id: "sample-viewer",
    title: "sampleViewer",
    hook: "See your sample library — tempo, key, and semantic similarity projected into a navigable map. Drag straight into your DAW. In development.",
    tags: ["Windows", "desktop", "beta"],
    githubUrl: "https://github.com/hadencain/sampleViewer",
    status: "waitlist",
  },
];
