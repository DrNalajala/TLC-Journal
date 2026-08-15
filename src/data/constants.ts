import type {
  ArticleStatus,
  ArticleType,
  ChamberCondition,
  PlateType,
  ReactionStatusOption,
  SampleType,
  SpotStrength,
} from "../types";

export const JOURNAL_NAME = "TLC Journal";
export const JOURNAL_SUBTITLE =
  "Thin-Layer Chromatography: A Basic Need in Every Chemist's Laboratory";
export const JOURNAL_MOTTO = "Small experiments. Clear observations. Useful chemistry.";
export const JOURNAL_ISSN = "ISSN 3041-8821 (Online) · Continuous publication";
export const CURRENT_VOLUME = 1;
export const CURRENT_YEAR = 2026;
export const ID_PREFIX = "TLCJ";

export const ARTICLE_TYPES: ArticleType[] = [
  "Reaction Monitoring",
  "Reaction Optimization",
  "Purification Monitoring",
  "Impurity Observation",
  "Degradation Study",
  "Work-up Monitoring",
  "Unexpected TLC Observation",
  "Method Development",
  "Other",
];

export const PLATE_TYPES: PlateType[] = [
  "Silica gel",
  "Silica gel F254",
  "Alumina",
  "Reverse phase (C18)",
  "Other",
];

export const CHAMBER_CONDITIONS: ChamberCondition[] = [
  "Saturated",
  "Unsaturated",
  "Pre-equilibrated",
];

export const SAMPLE_TYPES: SampleType[] = [
  "Starting material",
  "Reaction mixture",
  "Product",
  "Intermediate",
  "Co-spot",
  "Fraction",
  "Reference standard",
  "Other",
];

export const SPOT_STRENGTHS: SpotStrength[] = ["Present", "Absent", "Weak", "Strong"];

export const REACTION_STATUSES: ReactionStatusOption[] = [
  "Starting material remains",
  "Partial conversion",
  "Near complete conversion",
  "Complete conversion",
  "Multiple products",
  "Unexpected product/spot",
  "Decomposition suspected",
  "Cannot be concluded",
];

/** Preferred reporting order: UV first, then iodine, then other reagents. */
export const VISUALIZATION_METHODS = [
  "UV 254 nm",
  "UV 365 nm",
  "Iodine",
  "KMnO4",
  "Vanillin",
  "Anisaldehyde",
  "Ninhydrin",
  "CAM (ceric ammonium molybdate)",
  "PMA (phosphomolybdic acid)",
  "Dragendorff",
  "Ehrlich",
  "Bromocresol green",
  "Other",
] as const;

export const COMMON_SOLVENTS = [
  "Hexane",
  "Petroleum ether",
  "Ethyl acetate",
  "Dichloromethane",
  "Chloroform",
  "Diethyl ether",
  "Toluene",
  "Methanol",
  "Ethanol",
  "Isopropanol",
  "Acetone",
  "Acetonitrile",
  "Water",
  "Acetic acid",
  "Triethylamine",
  "Ammonia (aq.)",
  "n-Butanol",
  "THF",
  "1,4-Dioxane",
  "DMF",
];

export const RESEARCH_CONTEXTS = [
  "Academic research",
  "Public research",
  "Personal research",
  "Industrial research — authorized for publication",
] as const;

export const CHECKLIST_ITEMS: { key: string; label: string }[] = [
  { key: "photo", label: "Original TLC photograph provided" },
  { key: "scheme", label: "Reaction scheme provided" },
  { key: "description", label: "Reaction description is understandable" },
  { key: "phase", label: "TLC stationary phase reported" },
  { key: "mobile", label: "Mobile phase reported" },
  { key: "lanes", label: "Lane assignments provided" },
  { key: "viz", label: "Visualization method reported" },
  { key: "interpretation", label: "TLC interpretation scientifically reasonable" },
  { key: "quality", label: "Image quality acceptable" },
  { key: "claims", label: "No misleading claims" },
  { key: "onepage", label: "Article fits one-page format" },
  { key: "declaration", label: "Author declaration completed" },
  { key: "plagiarism", label: "No obvious plagiarism" },
  { key: "suitable", label: "Suitable for publication" },
];

export const STATUS_META: Record<
  ArticleStatus,
  { label: string; short: string; tone: "slate" | "blue" | "amber" | "red" | "green" | "navy" | "violet" }
> = {
  draft: { label: "Draft", short: "DRA", tone: "slate" },
  submitted: { label: "Submitted", short: "SUB", tone: "blue" },
  technical_check: { label: "Technical Check", short: "TEC", tone: "violet" },
  editorial_review: { label: "Editorial Review", short: "REV", tone: "amber" },
  revision_required: { label: "Revision Required", short: "MAJ", tone: "red" },
  resubmitted: { label: "Resubmitted", short: "RES", tone: "blue" },
  accepted: { label: "Accepted", short: "ACC", tone: "green" },
  rejected: { label: "Rejected", short: "REJ", tone: "red" },
  published: { label: "Published", short: "PUB", tone: "navy" },
};

export const STATUS_FLOW: ArticleStatus[] = [
  "draft",
  "submitted",
  "technical_check",
  "editorial_review",
  "revision_required",
  "resubmitted",
  "accepted",
  "rejected",
  "published",
];

export const COUNTRIES = [
  "Ghana",
  "Germany",
  "India",
  "Japan",
  "Nigeria",
  "Poland",
  "South Korea",
  "Spain",
  "Switzerland",
  "United Kingdom",
  "United States",
  "Other",
];

export const MAX_UPLOAD_MB = 12;
export const DESCRIPTION_LIMIT = 900; // characters — configurable editorial limit
export const STORY_LIMIT = 900;
export const INTERPRETATION_LIMIT = 1400; // ~200 words

export const SECTIONS = [
  { id: "article", code: "A", name: "Article Information" },
  { id: "authors", code: "B", name: "Authors" },
  { id: "scheme", code: "C", name: "Reaction Scheme" },
  { id: "reaction", code: "D", name: "Reaction Description" },
  { id: "tlc", code: "E", name: "TLC Conditions" },
  { id: "lanes", code: "F", name: "Lane Designer" },
  { id: "photo", code: "G", name: "Original TLC Photograph" },
  { id: "viz", code: "H", name: "Visualization Sequence" },
  { id: "interpret", code: "I", name: "Interpretation & Rf" },
  { id: "progress", code: "J", name: "Reaction Progress" },
  { id: "science", code: "K", name: "Scientific Interpretation" },
  { id: "story", code: "L", name: "The TLC Story" },
  { id: "ethics", code: "M", name: "Declarations & Ethics" },
  { id: "preview", code: "N", name: "One-Page Preview" },
] as const;

export const REVIEW_SECTIONS = [
  "General",
  "Article Information",
  "Reaction Scheme",
  "Reaction Description",
  "TLC Conditions",
  "Lanes",
  "TLC Photograph",
  "Visualization",
  "Interpretation",
  "Declarations",
];
