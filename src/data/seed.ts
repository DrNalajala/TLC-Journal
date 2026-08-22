/* ============================================================
   TLC Journal — demo content
   Every demo article is clearly marked (demo: true → "DEMO
   ARTICLE — NOT A REAL EXPERIMENT"). Plates & schemes are
   stylized inline SVG figures, never real laboratory data.
   ============================================================ */
import type {
  ArticleStatus, Declarations, Lane, ReviewComment, ReviewCriterionValue, ScientificReview,
  Submission, SpotMark, User, VisualizationStep,
} from "../types";

export const DEMO_USERS: User[] = [
  {
    id: "u-admin",
    name: "Dr. Elena Marsh",
    email: "admin@tlcjournal.org",
    password: "tlc-demo",
    role: "admin",
    affiliation: "Editorial Office, TLC Journal",
    createdAt: "2026-01-01",
  },
  {
    id: "u-editor",
    name: "Prof. Tomás Richter",
    email: "editor@tlcjournal.org",
    password: "tlc-demo",
    role: "editor",
    affiliation: "Editorial Office, TLC Journal",
    createdAt: "2026-01-01",
  },
  {
    id: "u-reviewer",
    name: "Dr. Kenji Sato",
    email: "reviewer@tlcjournal.org",
    password: "tlc-demo",
    role: "reviewer",
    affiliation: "Editorial Office, TLC Journal",
    createdAt: "2026-01-01",
  },
  {
    id: "u-author",
    name: "Dr. Amara Osei",
    email: "author@tlcjournal.org",
    password: "tlc-demo",
    role: "author",
    affiliation: "Department of Chemistry",
    createdAt: "2026-01-01",
  },
];

/* ---------------- stylized plate renderer (SVG data URL) ---------------- */

interface PlateSpotCfg { lane: number; rf: number; intensity: number; tint?: "uv" | "iodine" }
function plateSVG(opts: { lanes: string[]; spots: PlateSpotCfg[]; mode: "uv" | "iodine" }): string {
  const W = 420, H = 540, px = 30, py = 26, pw = W - 60, ph = 460;
  const base = py + ph - 46, front = py + 44;
  const laneW = pw / opts.lanes.length;
  const pal =
    opts.mode === "uv"
      ? { bg0: "#cdd9a1", bg1: "#adbb80", cab: "#0d1108", spot: "#1b2310", pencil: "#4d573f", label: "#d3dac2" }
      : { bg0: "#f0e7d0", bg1: "#e0d0ae", cab: "#39321f", spot: "#6b4418", pencil: "#8a7a5c", label: "#e8ddc4" };
  const spots = opts.spots
    .map((sp) => {
      const cx = px + (sp.lane - 0.5) * laneW;
      const cy = base - sp.rf * (base - front - 8);
      const r = 9 + sp.intensity * 3.4;
      const fill = sp.tint === "iodine" ? "#6b4418" : pal.spot;
      const o = 0.42 + sp.intensity * 0.16;
      return (
        `<ellipse cx="${cx}" cy="${cy}" rx="${r * 1.35}" ry="${r}" fill="${fill}" opacity="${o.toFixed(2)}" filter="url(#blur)"/>` +
        `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.66}" ry="${r * 0.52}" fill="${fill}" opacity="${Math.min(1, o + 0.3).toFixed(2)}" filter="url(#blur)"/>`
      );
    })
    .join("");
  const labels = opts.lanes
    .map((l, i) => `<text x="${px + (i + 0.5) * laneW}" y="${H - 22}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="14" font-weight="700" fill="${pal.label}">${i + 1}·${l}</text>`)
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.bg0}"/><stop offset="1" stop-color="${pal.bg1}"/></linearGradient>` +
    `<radialGradient id="vg" cx="0.5" cy="0.42" r="0.8"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>` +
    `<filter id="blur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3"/></filter>` +
    `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/></filter></defs>` +
    `<rect width="${W}" height="${H}" fill="${pal.cab}"/>` +
    `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="7" fill="url(#pg)"/>` +
    spots +
    `<line x1="${px + 12}" y1="${base}" x2="${px + pw - 12}" y2="${base}" stroke="${pal.pencil}" stroke-width="2" stroke-dasharray="7 6" opacity="0.9"/>` +
    `<line x1="${px + 12}" y1="${front}" x2="${px + pw - 12}" y2="${front}" stroke="${pal.pencil}" stroke-width="2" stroke-dasharray="5 6" opacity="0.7"/>` +
    `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="7" filter="url(#grain)"/>` +
    `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="7" fill="url(#vg)"/>` +
    labels +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* ---------------- stylized reaction scheme renderer (SVG data URL) ---------------- */

function hexPoints(cx: number, cy: number, r: number): string {
  return [0, 60, 120, 180, 240, 300]
    .map((a) => `${(cx + r * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(cy - r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`)
    .join(" ");
}
function bond(cx: number, cy: number, r: number, angleDeg: number, len: number): { x1: number; y1: number; x2: number; y2: number } {
  const a = (angleDeg * Math.PI) / 180;
  return {
    x1: cx + r * Math.cos(a), y1: cy - r * Math.sin(a),
    x2: cx + (r + len) * Math.cos(a), y2: cy - (r + len) * Math.sin(a),
  };
}
function schemeSVG(o: {
  leftSubs: { angle: number; text: string }[];
  rightSubs: { angle: number; text: string }[];
  reagent: string; condition: string; caption: string;
}): string {
  const ink = "#16233a", blue = "#1d5c9c";
  const ring = (cx: number, cy: number, subs: { angle: number; text: string }[], inward: boolean) => {
    let s = `<polygon points="${hexPoints(cx, cy, 78)}" fill="none" stroke="${ink}" stroke-width="5"/>` +
      `<circle cx="${cx}" cy="${cy}" r="46" fill="none" stroke="${ink}" stroke-width="3.5" opacity="0.55"/>`;
    subs.forEach((sub) => {
      const b = bond(cx, cy, 78, sub.angle, 30);
      s += `<line x1="${b.x1.toFixed(1)}" y1="${b.y1.toFixed(1)}" x2="${b.x2.toFixed(1)}" y2="${b.y2.toFixed(1)}" stroke="${ink}" stroke-width="5"/>`;
      const lx = b.x2 + (inward && sub.angle === 180 ? -14 : 14);
      const anchor = inward && sub.angle === 180 ? "end" : sub.angle === 180 ? "end" : "start";
      const dy = sub.angle === 300 ? 26 : sub.angle === 60 ? -16 : 8;
      s += `<text x="${lx.toFixed(1)}" y="${(b.y2 + dy).toFixed(1)}" text-anchor="${anchor}" font-family="IBM Plex Sans,sans-serif" font-size="30" font-weight="700" fill="${ink}">${sub.text}</text>`;
    });
    return s;
  };
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="430" viewBox="0 0 1200 430">` +
    `<rect width="1200" height="430" fill="#ffffff"/>` +
    ring(240, 185, o.leftSubs, false) +
    `<line x1="470" y1="185" x2="706" y2="185" stroke="${ink}" stroke-width="5"/>` +
    `<polygon points="726,185 700,172 700,198" fill="${ink}"/>` +
    `<text x="598" y="158" text-anchor="middle" font-family="IBM Plex Sans,sans-serif" font-size="27" font-weight="600" fill="${blue}">${o.reagent}</text>` +
    `<text x="598" y="228" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="23" fill="#5b6b7e">${o.condition}</text>` +
    ring(940, 185, o.rightSubs, true) +
    `<text x="600" y="392" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="21" fill="#7a8ba0">${o.caption}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* ---------------- helpers for full Submission records ---------------- */

const ALL_TRUE = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, true])) as Record<string, boolean>;

const TECH_KEYS = ["imageReadable", "declaration", "schemePresent", "mobilePhase", "plate", "lanes", "visualization", "description", "onePage", "noConfidential"];
const CHECK_KEYS = ["photo", "scheme", "description", "phase", "mobile", "lanes", "viz", "interpretation", "quality", "claims", "onepage", "declaration", "plagiarism", "suitable"];
const PROD_KEYS = ["names", "affiliation", "scheme", "photo", "conditions", "viz", "proofread", "layout", "pdf", "metadata", "authorProof"];

interface DemoArticleCfg {
  n: number;
  title: string;
  articleType: Submission["articleType"];
  keywords: string[];
  authors: Submission["authors"];
  scheme: string;
  reactionDescription: string;
  plateType: Submission["plateType"];
  plateManufacturer: string;
  plateDimensions: string;
  mobilePhase: { solvent: string; parts: number }[];
  lanes: [string, string][];
  plate: string;
  plateFile: string;
  visualization: [string, string][];
  interpretation: Submission["interpretation"];
  progressSM: number;
  progressProduct: number;
  progressNote: string;
  scientificInterpretation: string;
  keyObservation: string;
  tlcStory: string;
  spots: SpotMark[];
  submitted: string;
  accepted: string;
  published: string;
  review: { clarity: ReviewCriterionValue; comment: string };
  comment: { text: string; response: string };
}

function demoArticle(c: DemoArticleCfg): Submission {
  const id = `demo-art-${c.n}`;
  const submissionId = `TLC-SUB-2026-${String(c.n).padStart(5, "0")}`;
  const articleId = `TLCJ-2026-${String(c.n).padStart(5, "0")}`;
  const authorName = c.authors.find((a) => a.corresponding)?.fullName ?? c.authors[0].fullName;
  const lanes: Lane[] = c.lanes.map(([label, sampleType], i) => ({ id: `${id}-l${i}`, label, sampleType: sampleType as Lane["sampleType"] }));
  const visualization: VisualizationStep[] = c.visualization.map(([method, note], i) => ({ id: `${id}-v${i}`, method, note }));
  const flow: [ArticleStatus, string, string][] = [
    ["draft", c.submitted.slice(0, 10), authorName],
    ["submitted", c.submitted, authorName],
    ["technical_check", c.submitted, "Prof. Tomás Richter"],
    ["editorial_review", c.submitted, "Prof. Tomás Richter"],
    ["accepted", c.accepted, "Prof. Tomás Richter"],
    ["production", c.accepted, "Editorial Office"],
    ["proof_ready", c.accepted, "Editorial Office"],
    ["published", c.published, "Prof. Tomás Richter"],
  ];
  const review: ScientificReview = {
    id: `${id}-rev1`,
    reviewerName: "Dr. Kenji Sato",
    reviewerRole: "reviewer",
    date: c.accepted,
    scientificClarity: "Excellent",
    tlcDocumentation: "Excellent",
    reactionDescription: c.review.clarity,
    interpretation: "Scientifically reasonable",
    imageQuality: "Acceptable",
    originality: "Acceptable",
    practicalValue: "High",
    recommendation: "Accept",
    comments: c.review.comment,
  };
  const comment: ReviewComment = {
    id: `${id}-c1`,
    byName: "Prof. Tomás Richter",
    byRole: "editor",
    section: "TLC Conditions",
    text: c.comment.text,
    date: c.submitted,
    authorResponse: c.comment.response,
    resolved: true,
  };
  return {
    id,
    submissionId,
    articleId,
    status: "published",
    revisionNumber: 1,
    revisionType: "",
    assignedEditorId: "u-editor",
    assignedEditorName: "Prof. Tomás Richter",
    assignedReviewerId: "u-reviewer",
    assignedReviewerName: "Dr. Kenji Sato",
    title: c.title,
    articleType: c.articleType,
    keywords: c.keywords,
    authors: c.authors,
    schemeImage: c.scheme,
    schemeFileName: "reaction-scheme.svg",
    reactionDescription: c.reactionDescription,
    plateType: c.plateType,
    plateManufacturer: c.plateManufacturer,
    plateDimensions: c.plateDimensions,
    mobilePhase: c.mobilePhase.map((m, i) => ({ id: `${id}-m${i}`, ...m })),
    chamberCondition: "Saturated",
    spottingNotes: "0.5 µL capillary spotting, pencil-marked baseline.",
    lanes,
    tlcImage: c.plate,
    tlcImageName: c.plateFile,
    originalKept: true,
    rotate: 0,
    spots: c.spots,
    interpretation: c.interpretation,
    includeProgress: true,
    progressSM: c.progressSM,
    progressProduct: c.progressProduct,
    progressNote: c.progressNote,
    visualization,
    scientificInterpretation: c.scientificInterpretation,
    keyObservation: c.keyObservation,
    tlcStory: c.tlcStory,
    researchContext: "Academic research",
    declarations: {
      original: true, photo: true, accurate: true, permission: true, confidentiality: true, scheme: true,
    } as Declarations,
    techCheck: ALL_TRUE(TECH_KEYS),
    techReturnReason: "",
    reviews: [review],
    decisionNote: "Accepted — a clear, honestly reported plate that other laboratories can reuse.",
    productionChecklist: ALL_TRUE(PROD_KEYS),
    proofRequested: true,
    authorProofApproved: true,
    withdrawn: null,
    corrections: [],
    correctedVersion: 1,
    fileVersions: {
      tlc: [{ version: 1, data: c.plate, fileName: c.plateFile, uploadedBy: authorName, date: c.submitted, note: "Original camera file (demo figure)." }],
      scheme: [{ version: 1, data: c.scheme, fileName: "reaction-scheme.svg", uploadedBy: authorName, date: c.submitted, note: "Original drawing (demo figure)." }],
    },
    revisions: [],
    volume: 1,
    issue: 1,
    pageEstimate: 84 + c.n,
    createdAt: c.submitted,
    updatedAt: c.published,
    submittedAt: c.submitted,
    publishedAt: c.published,
    history: flow.map(([status, date, by]) => ({
      status, date, by,
      note:
        status === "accepted" ? `Article identifier ${articleId} assigned.` :
        status === "published" ? "Published in Volume 1 (continuous publication)." :
        status === "proof_ready" ? "Final proof generated; author approved the proof." : undefined,
    })),
    checklist: ALL_TRUE(CHECK_KEYS),
    comments: [comment],
    demo: true,
  };
}

const au = (fullName: string, degree: string, institution: string, department: string, city: string, country: string, email: string, corresponding = false): Submission["authors"][number] => ({
  id: `au-${fullName.replace(/\W+/g, "-").toLowerCase()}`,
  fullName, degree, affiliation: `${department}, ${institution}`, department, institution, city, country, email, orcid: "", corresponding,
});

const rf = (id: string, label: string, value: number | null) => ({ id, label, value });

/* ---------------- the five demo communications ---------------- */

const plateA = plateSVG({
  mode: "uv",
  lanes: ["SM", "Co", "RM", "Prod"],
  spots: [
    { lane: 1, rf: 0.72, intensity: 3 },
    { lane: 2, rf: 0.72, intensity: 3 }, { lane: 2, rf: 0.38, intensity: 2 },
    { lane: 3, rf: 0.72, intensity: 1 }, { lane: 3, rf: 0.38, intensity: 3 },
    { lane: 4, rf: 0.38, intensity: 3 },
  ],
});
const plateB = plateSVG({
  mode: "uv",
  lanes: ["Crude", "Fr 1", "Fr 2", "Fr 3", "Fr 4", "Prod"],
  spots: [
    { lane: 1, rf: 0.66, intensity: 3 }, { lane: 1, rf: 0.42, intensity: 2 }, { lane: 1, rf: 0.2, intensity: 1 },
    { lane: 2, rf: 0.66, intensity: 2 }, { lane: 2, rf: 0.42, intensity: 1 },
    { lane: 3, rf: 0.42, intensity: 3 },
    { lane: 4, rf: 0.42, intensity: 3 },
    { lane: 5, rf: 0.42, intensity: 1 },
    { lane: 6, rf: 0.42, intensity: 3 },
  ],
});
const plateC = plateSVG({
  mode: "iodine",
  lanes: ["SM", "RM", "Wash", "Prod"],
  spots: [
    { lane: 1, rf: 0.78, intensity: 3, tint: "iodine" },
    { lane: 2, rf: 0.78, intensity: 1, tint: "iodine" }, { lane: 2, rf: 0.52, intensity: 2, tint: "iodine" }, { lane: 2, rf: 0.21, intensity: 2, tint: "iodine" },
    { lane: 3, rf: 0.78, intensity: 2, tint: "iodine" }, { lane: 3, rf: 0.12, intensity: 2, tint: "iodine" },
    { lane: 4, rf: 0.21, intensity: 3, tint: "iodine" },
  ],
});

const schemeOxidation = schemeSVG({
  leftSubs: [{ angle: 0, text: "CH₂OH" }],
  rightSubs: [{ angle: 180, text: "CHO" }],
  reagent: "PCC (1.2 equiv), CH₂Cl₂",
  condition: "rt, 2 h",
  caption: "Isolated yield 78% — demo scheme, not real experimental data",
});
const schemeEster = schemeSVG({
  leftSubs: [{ angle: 0, text: "COOH" }],
  rightSubs: [{ angle: 180, text: "COOMe" }],
  reagent: "conc. H₂SO₄ (cat.), MeOH",
  condition: "reflux, 3 h",
  caption: "+ H₂O · isolated yield 84% — demo scheme, not real experimental data",
});
const schemeReduction = schemeSVG({
  leftSubs: [{ angle: 0, text: "COCH₃" }, { angle: 300, text: "NO₂" }],
  rightSubs: [{ angle: 180, text: "CH(OH)CH₃" }, { angle: 300, text: "NO₂" }],
  reagent: "NaBH₄, MeOH",
  condition: "0 °C → rt, 45 min",
  caption: "Isolated yield 81% — demo scheme, not real experimental data",
});
const schemeNitro = schemeSVG({
  leftSubs: [{ angle: 0, text: "NO₂" }, { angle: 300, text: "COCH₃" }],
  rightSubs: [{ angle: 180, text: "NH₂" }, { angle: 300, text: "COCH₃" }],
  reagent: "Zn, NH₄Cl, MeOH–H₂O",
  condition: "50 °C, 2 h",
  caption: "Hydroxylamine intermediate observed at Rf 0.52 — demo scheme, not real experimental data",
});
const schemeAlkylation = schemeSVG({
  leftSubs: [{ angle: 0, text: "NH₂" }],
  rightSubs: [{ angle: 180, text: "NHBn" }],
  reagent: "BnBr, K₂CO₃, MeCN",
  condition: "reflux, 4 h",
  caption: "Dialkylated by-product detected by iodine only — demo scheme, not real experimental data",
});

const ARTICLES: DemoArticleCfg[] = [
  {
    n: 1,
    title: "Monitoring the Oxidation of Benzyl Alcohol to Benzaldehyde by TLC",
    articleType: "Reaction Monitoring",
    keywords: ["TLC", "oxidation", "benzaldehyde", "PCC", "reaction monitoring"],
    authors: [
      au("Amara Osei", "PhD", "University of Cape Coast", "Department of Chemistry", "Cape Coast", "Ghana", "author@tlcjournal.org", true),
      au("Kwame Mensah", "MSc", "University of Cape Coast", "Department of Chemistry", "Cape Coast", "Ghana", "k.mensah@ucc.edu.gh"),
    ],
    scheme: schemeOxidation,
    reactionDescription:
      "Benzyl alcohol (1.0 mmol) was oxidized with PCC (1.2 equiv) in anhydrous CH₂Cl₂ (10 mL) at room temperature under nitrogen. Aliquots were withdrawn at 0, 60 and 120 min, diluted in CH₂Cl₂ and spotted alongside a starting-material reference and a co-spot. The transformation expected was the clean formation of benzaldehyde without over-oxidation to benzoic acid.",
    plateType: "Silica gel F254",
    plateManufacturer: "Merck",
    plateDimensions: "5 × 10 cm",
    mobilePhase: [{ solvent: "Ethyl acetate", parts: 30 }, { solvent: "Hexane", parts: 70 }],
    lanes: [["SM", "Starting material"], ["Co", "Co-spot"], ["RM", "Reaction mixture"], ["Prod", "Product"]],
    plate: plateA,
    plateFile: "oxidation-uv254-plate.svg",
    visualization: [
      ["UV 254 nm", "Both starting material and product quench fluorescence — two well-separated dark zones."],
      ["Iodine", "Confirmed the product zone and showed no additional iodine-active material."],
    ],
    interpretation: {
      smSpot: "Absent", productSpot: "Strong", additionalSpots: "None", reactionStatus: "Complete conversion",
      rfValues: [rf("a1-r1", "Starting material", 0.72), rf("a1-r2", "Product", 0.38), rf("a1-r3", "Co-spot", 0.72)],
      notes: "A faint trail below the product zone at 60 min disappeared by 120 min.",
    },
    progressSM: 0,
    progressProduct: 5,
    progressNote: "Approximate visual assessment at 2 h — semi-quantitative only.",
    scientificInterpretation:
      "At t = 0 only the starting-material spot (Rf 0.72) is visible. By 60 min a strong new zone appears at Rf 0.38 while the benzyl alcohol spot weakens; the co-spot lane shows both zones separated, ruling out overlap. At 120 min the Rf 0.72 spot has disappeared entirely and no new zones are detectable, indicating complete conversion to benzaldehyde without accumulation of an over-oxidation product (benzoic acid would remain at the baseline in this system). The brief trailing observed mid-reaction is consistent with the aldehyde hydrate in the slightly acidic PCC medium and does not represent a side product.",
    keyObservation: "Disappearance of the Rf 0.72 spot, confirmed against the co-spot lane, gave an unambiguous endpoint at 2 h.",
    tlcStory:
      "On UV alone the product zone tails slightly toward the baseline, which briefly made the plate look like an incomplete conversion. Running the co-spot lane settled it in seconds: two resolved zones, no third component. It is a small reminder that a co-spot costs one capillary and saves an evening of doubt.",
    spots: [
      { lane: 1, rf: 0.72, intensity: 3 },
      { lane: 2, rf: 0.72, intensity: 3 }, { lane: 2, rf: 0.38, intensity: 2 },
      { lane: 3, rf: 0.72, intensity: 1 }, { lane: 3, rf: 0.38, intensity: 3 },
      { lane: 4, rf: 0.38, intensity: 3 },
    ],
    submitted: "2026-01-05",
    accepted: "2026-01-12",
    published: "2026-01-14",
    review: { clarity: "Excellent", comment: "A textbook monitoring plate with an exemplary co-spot control. Documentation complete; recommend acceptance." },
    comment: { text: "Please confirm the mobile-phase ratio and chamber saturation time.", response: "Ethyl acetate : hexane 30 : 70 (v/v), chamber saturated for 20 min with filter paper." },
  },
  {
    n: 2,
    title: "Fischer Esterification of Benzoic Acid: When the Baseline Spot Lies",
    articleType: "Reaction Optimization",
    keywords: ["TLC", "esterification", "methyl benzoate", "KMnO4", "reaction optimization"],
    authors: [
      au("Lena Hoffmann", "PhD", "Heidelberg University", "Institute of Organic Chemistry", "Heidelberg", "Germany", "l.hoffmann@uni-heidelberg.de", true),
    ],
    scheme: schemeEster,
    reactionDescription:
      "Benzoic acid (5.0 mmol) was refluxed in methanol (20 mL) with catalytic concentrated H₂SO₄ (0.3 mL). Aliquots at 1, 2 and 3 h were neutralized with sat. NaHCO₃, extracted into EtOAc and spotted. The target was methyl benzoate; conversion was judged against the starting acid and a co-spot.",
    plateType: "Silica gel F254",
    plateManufacturer: "Merck",
    plateDimensions: "5 × 10 cm",
    mobilePhase: [{ solvent: "Ethyl acetate", parts: 15 }, { solvent: "Hexane", parts: 85 }],
    lanes: [["SM", "Starting material"], ["RM", "Reaction mixture"], ["Prod", "Product"], ["Co", "Co-spot"]],
    plate: plateA,
    plateFile: "esterification-uv254-plate.svg",
    visualization: [
      ["UV 254 nm", "Starting acid quenches strongly; the ester zone is only faintly visible — UV alone understates conversion."],
      ["KMnO4", "The ester zone stains intense yellow-brown; a faint high-Rf zone (diester trace) also appears."],
    ],
    interpretation: {
      smSpot: "Weak", productSpot: "Strong", additionalSpots: "One", reactionStatus: "Near complete conversion",
      rfValues: [rf("a2-r1", "Benzoic acid", 0.28), rf("a2-r2", "Methyl benzoate", 0.71)],
      notes: "KMnO4 staining overestimated the ester slightly — the acid stains too; comparison with the co-spot was essential.",
    },
    progressSM: 1,
    progressProduct: 4,
    progressNote: "Approximate visual assessment at 3 h.",
    scientificInterpretation:
      "In this solvent system the acid stays low (Rf 0.28) while the ester runs high (Rf 0.71). Under UV 254 the product zone is weak because the ester absorbs less efficiently than the acid, so the 1 h plate falsely suggests little reaction. KMnO4 staining reverses the impression: the ester stains intensely, and by 3 h the acid zone is faint with one strong ester zone plus a trace high-Rf impurity consistent with a dialkyl side product. Conversion is therefore near-complete, not stalled. The plate also shows why two visualizations disagree — each reports a different physical property, and neither is wrong.",
    keyObservation: "UV 254 understated and KMnO4 overstated conversion; only the two together bracketed the true ~90% conversion at 3 h.",
    tlcStory:
      "After 2 h the UV plate looked discouraging — almost all the intensity still sat in the acid lane. I nearly added more catalyst and pushed the reflux harder. One dip in KMnO₄ later, the real picture appeared: the reaction had been nearly done for an hour. The plate taught me to distrust a single visualization when chromophores change during the reaction.",
    spots: [
      { lane: 1, rf: 0.28, intensity: 3 },
      { lane: 2, rf: 0.28, intensity: 1 }, { lane: 2, rf: 0.71, intensity: 3 }, { lane: 2, rf: 0.9, intensity: 1 },
      { lane: 3, rf: 0.71, intensity: 3 },
      { lane: 4, rf: 0.28, intensity: 2 }, { lane: 4, rf: 0.71, intensity: 3 },
    ],
    submitted: "2026-01-24",
    accepted: "2026-01-31",
    published: "2026-02-02",
    review: { clarity: "Acceptable", comment: "The UV-versus-stain comparison is the valuable part of this communication. Recommend acceptance." },
    comment: { text: "Please identify the faint high-Rf zone seen under KMnO₄.", response: "We attribute it to trace dimethyl terephthalate from partial dialkylation; it did not co-elute with product by ¹H NMR of the isolated material." },
  },
  {
    n: 3,
    title: "Six Lanes, One Reduction: Monitoring Column Fractions after a NaBH₄ Reduction",
    articleType: "Purification Monitoring",
    keywords: ["TLC", "reduction", "NaBH4", "column fractions", "purification monitoring", "vanillin"],
    authors: [
      au("Rajesh Iyer", "PhD", "IIT Madras", "Department of Chemistry", "Chennai", "India", "r.iyer@iitm.ac.in", true),
      au("Divya Nair", "MSc", "IIT Madras", "Department of Chemistry", "Chennai", "India", "divya.nair@iitm.ac.in"),
    ],
    scheme: schemeReduction,
    reactionDescription:
      "4-Nitroacetophenone (2.0 mmol) was reduced with NaBH₄ (1.5 equiv) in MeOH at 0 °C warming to room temperature over 45 min. The crude was loaded on silica and eluted with an EtOAc/hexane gradient; fractions 1–4 were spotted beside the crude and an authentic product reference to decide pooling.",
    plateType: "Silica gel F254",
    plateManufacturer: "SRL",
    plateDimensions: "10 × 10 cm",
    mobilePhase: [{ solvent: "Ethyl acetate", parts: 40 }, { solvent: "Hexane", parts: 60 }],
    lanes: [["Crude", "Reaction mixture"], ["Fr 1", "Fraction"], ["Fr 2", "Fraction"], ["Fr 3", "Fraction"], ["Fr 4", "Fraction"], ["Prod", "Product"]],
    plate: plateB,
    plateFile: "reduction-fractions-uv254-plate.svg",
    visualization: [
      ["UV 254 nm", "Fractions 2–4 carry a single zone matching the product reference (Rf 0.42)."],
      ["Vanillin", "Charring reveals a non-UV-active zone in fraction 2 at Rf ≈ 0.55 — fractions 3–4 pooled instead."],
    ],
    interpretation: {
      smSpot: "Weak", productSpot: "Strong", additionalSpots: "One", reactionStatus: "Complete conversion",
      rfValues: [rf("a3-r1", "Starting ketone", 0.66), rf("a3-r2", "Alcohol product", 0.42), rf("a3-r3", "Impurity (vanillin only)", 0.55)],
      notes: "The crude lane shows the expected ketone/alcohol pair; no borate complex remained at the baseline after work-up.",
    },
    progressSM: 0,
    progressProduct: 5,
    progressNote: "Approximate visual assessment of pooled fractions 3–4.",
    scientificInterpretation:
      "The reduction itself is clean: the crude lane shows ketone consumed and the alcohol product dominant. The plate's real job was pooling. Under UV, fractions 2–4 look identical and pure, inviting a wide pool. Vanillin charring disagrees — fraction 2 carries a second, UV-silent zone (Rf ≈ 0.55) consistent with a partially reduced or dehydrated side compound. Pooling fractions 3–4 only gave material clean by NMR, while including fraction 2 would have cost a second column. The six-lane layout turned a pooling guess into a documented decision.",
    keyObservation: "Vanillin exposed a UV-silent impurity in fraction 2, narrowing the pool to fractions 3–4 and saving a repeat column.",
    tlcStory:
      "Everyone in the lab pools by UV. This plate is the reason our group now chars one analytical TLC of every pool candidate: fraction 2 was indistinguishable from fraction 3 under the lamp, and it quietly carried 8% of an impurity that only vanillin could see. The plate now hangs above the fume hood as a warning.",
    spots: [
      { lane: 1, rf: 0.66, intensity: 3 }, { lane: 1, rf: 0.42, intensity: 2 }, { lane: 1, rf: 0.2, intensity: 1 },
      { lane: 2, rf: 0.66, intensity: 2 }, { lane: 2, rf: 0.42, intensity: 1 }, { lane: 2, rf: 0.55, intensity: 2, tint: "stain" },
      { lane: 3, rf: 0.42, intensity: 3 },
      { lane: 4, rf: 0.42, intensity: 3 },
      { lane: 5, rf: 0.42, intensity: 1 },
      { lane: 6, rf: 0.42, intensity: 3 },
    ],
    submitted: "2026-02-09",
    accepted: "2026-02-16",
    published: "2026-02-18",
    review: { clarity: "Excellent", comment: "A genuinely useful pooling plate with an honest stain-versus-UV mismatch. Recommend acceptance." },
    comment: { text: "Please state how the vanillin-only zone was identified as impurity rather than product decomposition.", response: "The zone does not grow on standing, and ¹H NMR of fraction 2 alone shows extra aliphatic signals absent in fractions 3–4." },
  },
  {
    n: 4,
    title: "Catching a Hydroxylamine Intermediate in a Zn-Mediated Nitro Reduction",
    articleType: "Unexpected TLC Observation",
    keywords: ["TLC", "nitro reduction", "hydroxylamine", "intermediate", "reaction monitoring"],
    authors: [
      au("Yuki Tanaka", "PhD", "Kyoto University", "Graduate School of Engineering", "Kyoto", "Japan", "tanaka.yuki.42x@kyoto-u.ac.jp", true),
    ],
    scheme: schemeNitro,
    reactionDescription:
      "4-Nitroacetophenone (1.0 mmol) was reduced with Zn powder (3 equiv) and NH₄Cl in MeOH–H₂O (4:1) at 50 °C. Aliquots at 15, 30, 60 and 120 min were filtered, diluted and spotted beside the starting material and an authentic aniline reference to follow the expected nitro → hydroxylamine → amine sequence.",
    plateType: "Silica gel F254",
    plateManufacturer: "Merck",
    plateDimensions: "5 × 10 cm",
    mobilePhase: [{ solvent: "Ethyl acetate", parts: 50 }, { solvent: "Hexane", parts: 50 }],
    lanes: [["SM", "Starting material"], ["30 min", "Reaction mixture"], ["2 h", "Reaction mixture"], ["Prod", "Product"]],
    plate: plateC,
    plateFile: "nitro-reduction-intermediate-plate.svg",
    visualization: [
      ["UV 254 nm", "Nitro and amine zones visible; the intermediate zone is faint under UV."],
      ["KMnO4", "The intermediate at Rf 0.52 stains strongly — the easiest way to follow its rise and fall."],
    ],
    interpretation: {
      smSpot: "Absent", productSpot: "Strong", additionalSpots: "One", reactionStatus: "Complete conversion",
      rfValues: [rf("a4-r1", "Nitro starting material", 0.78), rf("a4-r2", "Hydroxylamine intermediate", 0.52), rf("a4-r3", "Amino product", 0.21)],
      notes: "The Rf 0.52 zone is transient: maximal at 30 min, absent at 2 h.",
    },
    progressSM: 0,
    progressProduct: 5,
    progressNote: "Approximate visual assessment at 2 h; the intermediate had fully collapsed.",
    scientificInterpretation:
      "The plate resolves all three oxidation states of the nitrogen. At 30 min three zones coexist: residual nitro compound (Rf 0.78), a transient middle zone (Rf 0.52) and the amine (Rf 0.21). The middle zone peaks in intensity around 30 min and vanishes by 2 h while the amine strengthens — the classic kinetic profile of a consecutive reaction, made visible on one sheet of silica. Under UV the intermediate is easy to miss; KMnO₄ stains it intensely because the N-hydroxylamine is a good reductant. A chemist sampling only at 15 min (one zone, mostly starting material) or only at 2 h (clean conversion) would never have suspected the intermediate.",
    keyObservation: "A transient Rf 0.52 zone peaked at 30 min and disappeared by 2 h — direct TLC evidence of the hydroxylamine intermediate.",
    tlcStory:
      "I almost threw the 30-minute plate away because it looked messy — three spots where the literature promised two. Charring with KMnO₄ made the middle spot glow, and the time series turned 'messy' into a mechanism. It is the plate I now show students when they ask whether TLC can do kinetics. Approximately, it can.",
    spots: [
      { lane: 1, rf: 0.78, intensity: 3 },
      { lane: 2, rf: 0.78, intensity: 1 }, { lane: 2, rf: 0.52, intensity: 2 }, { lane: 2, rf: 0.21, intensity: 2 },
      { lane: 3, rf: 0.21, intensity: 3 },
      { lane: 4, rf: 0.21, intensity: 3 },
    ],
    submitted: "2026-02-25",
    accepted: "2026-03-03",
    published: "2026-03-05",
    review: { clarity: "Excellent", comment: "The transient intermediate is documented convincingly with two visualizations. Strong pedagogical value; accept." },
    comment: { text: "Please explain why the intermediate is faint under UV but strong under KMnO₄.", response: "The hydroxylamine has a weaker chromophore than the nitro or amino compounds but reduces permanganate rapidly, so staining amplifies it selectively." },
  },
  {
    n: 5,
    title: "Iodine Reveals a Non-UV-Active By-product in an Amine Alkylation Work-up",
    articleType: "Work-up Monitoring",
    keywords: ["TLC", "alkylation", "iodine visualization", "work-up monitoring", "impurity"],
    authors: [
      au("Ngozi Eze", "PhD", "University of Nigeria", "Department of Pure and Industrial Chemistry", "Nsukka", "Nigeria", "ngozi.eze@unn.edu.ng", true),
    ],
    scheme: schemeAlkylation,
    reactionDescription:
      "Aniline (2.0 mmol) was benzylated with benzyl bromide (1.1 equiv) and K₂CO₃ in refluxing MeCN for 4 h. After cooling, the mixture was partitioned between EtOAc and water. Both phases, the crude and a product reference were spotted to check where the product and any by-products had gone during work-up.",
    plateType: "Silica gel F254",
    plateManufacturer: "Merck",
    plateDimensions: "5 × 10 cm",
    mobilePhase: [{ solvent: "Dichloromethane", parts: 95 }, { solvent: "Methanol", parts: 5 }],
    lanes: [["SM", "Starting material"], ["RM", "Reaction mixture"], ["Wash", "Other"], ["Prod", "Product"]],
    plate: plateC,
    plateFile: "alkylation-workup-iodine-plate.svg",
    visualization: [
      ["UV 254 nm", "Aniline and product zones visible; the work-up looks clean — no third component on UV."],
      ["Iodine", "A strongly iodine-active polar zone (Rf 0.12) appears in the aqueous wash lane and faintly in the crude."],
    ],
    interpretation: {
      smSpot: "Absent", productSpot: "Strong", additionalSpots: "One", reactionStatus: "Complete conversion",
      rfValues: [rf("a5-r1", "Aniline", 0.31), rf("a5-r2", "N-benzylaniline", 0.68), rf("a5-r3", "Polar by-product (iodine only)", 0.12)],
      notes: "The Rf 0.12 zone partitions into the aqueous phase; one extra brine wash removed its trace from the organic layer.",
    },
    progressSM: 0,
    progressProduct: 5,
    progressNote: "Approximate visual assessment of the washed organic layer.",
    scientificInterpretation:
      "On UV the reaction appears textbook-clean: aniline consumed, a single product zone at Rf 0.68. Iodine tells a different story. A polar, UV-silent zone (Rf 0.12) sits at the baseline region and tracks into the aqueous wash lane — consistent with a dialkylated ammonium salt or over-alkylated polar by-product that escapes UV detection. Because it partitions into water, a single additional wash cleaned the organic phase, confirmed by the washed-lane lane showing only the product zone after staining. Skipping iodine would have carried the impurity into the column and eluted it in the product fractions.",
    keyObservation: "UV declared the work-up clean; iodine exposed a polar by-product hiding at Rf 0.12 that one extra wash removed.",
    tlcStory:
      "The UV plate was so clean I had already written 'work-up complete' in the notebook. The iodine jar — used out of habit, not suspicion — produced a brown baseline spot in the wash lane that was not supposed to exist. Ten extra millilitres of brine later, it was gone. Habit beats brilliance, but only if you actually look at the second plate.",
    spots: [
      { lane: 1, rf: 0.31, intensity: 3, tint: "iodine" },
      { lane: 2, rf: 0.68, intensity: 3, tint: "iodine" }, { lane: 2, rf: 0.12, intensity: 1, tint: "iodine" },
      { lane: 3, rf: 0.12, intensity: 2, tint: "iodine" }, { lane: 3, rf: 0.68, intensity: 1, tint: "iodine" },
      { lane: 4, rf: 0.68, intensity: 3, tint: "iodine" },
    ],
    submitted: "2026-03-12",
    accepted: "2026-03-19",
    published: "2026-03-21",
    review: { clarity: "Excellent", comment: "A compelling case for routine iodine screening during work-ups. Recommend acceptance." },
    comment: { text: "Please clarify what the 'Wash' lane contains.", response: "The 'Wash' lane is an aliquot of the first aqueous wash, spotted directly after phase separation." },
  },
];

export const SEED_SUBMISSIONS: Submission[] = ARTICLES.map(demoArticle);
