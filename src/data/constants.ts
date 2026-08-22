import type {
  ArticleStatus,
  ArticleType,
  ChamberCondition,
  PlateType,
  ReactionStatusOption,
  SampleType,
  SpotStrength,
} from "../types";

export const SUB_PREFIX = "TLC-SUB";
export const JOURNAL_NAME = "TLC Journal";
export const JOURNAL_SUBTITLE =
  "Thin-Layer Chromatography: A Basic Need in Every Chemist's Laboratory";
export const JOURNAL_MOTTO = "Small experiments. Clear observations. Useful chemistry.";
export const EDITORIAL_EMAIL = "drnalajala@gmail.com";
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
  technical_revision: { label: "Technical Revision", short: "TRV", tone: "red" },
  editorial_review: { label: "Under Review", short: "REV", tone: "amber" },
  revision_required: { label: "Revision Required", short: "MAJ", tone: "red" },
  resubmitted: { label: "Revision Submitted", short: "RES", tone: "blue" },
  accepted: { label: "Accepted", short: "ACC", tone: "green" },
  production: { label: "Production", short: "PRD", tone: "amber" },
  proof_ready: { label: "Proof Ready", short: "PRF", tone: "violet" },
  published: { label: "Published", short: "PUB", tone: "navy" },
  rejected: { label: "Rejected", short: "REJ", tone: "red" },
  withdrawn: { label: "Withdrawn", short: "WDR", tone: "slate" },
};

export const STATUS_FLOW: ArticleStatus[] = [
  "draft",
  "submitted",
  "technical_check",
  "technical_revision",
  "editorial_review",
  "revision_required",
  "resubmitted",
  "accepted",
  "production",
  "proof_ready",
  "published",
  "rejected",
  "withdrawn",
];

/* ------------------ editorial workflow ------------------ */

/** Technical screening checklist (§13) */
export const TECH_SCREEN_ITEMS: { key: string; label: string }[] = [
  { key: "imageReadable", label: "TLC image readable" },
  { key: "declaration", label: "Original image declaration completed" },
  { key: "schemePresent", label: "Reaction scheme present" },
  { key: "mobilePhase", label: "Mobile phase reported" },
  { key: "plate", label: "TLC plate reported" },
  { key: "lanes", label: "Sample lanes identified" },
  { key: "visualization", label: "Visualization method reported" },
  { key: "description", label: "Reaction description understandable" },
  { key: "onePage", label: "Article within one-page requirement" },
  { key: "noConfidential", label: "No obvious confidential information" },
];

export const TECH_RETURN_REASONS = [
  "Missing TLC conditions",
  "Poor image quality",
  "Missing reaction scheme",
  "Unclear lane labels",
  "Missing visualization details",
  "Insufficient reaction description",
  "Other",
];

/** Production checklist (§22) */
export const PRODUCTION_ITEMS: { key: string; label: string }[] = [
  { key: "names", label: "Author names verified" },
  { key: "affiliation", label: "Affiliation verified" },
  { key: "scheme", label: "Reaction scheme verified" },
  { key: "photo", label: "TLC photograph verified" },
  { key: "conditions", label: "TLC conditions verified" },
  { key: "viz", label: "Visualization sequence verified" },
  { key: "proofread", label: "Article text proofread" },
  { key: "layout", label: "One-page layout generated" },
  { key: "pdf", label: "PDF generated" },
  { key: "metadata", label: "Article metadata generated" },
  { key: "authorProof", label: "Final author proof approved" },
];

/** Scientific review form criteria (§16) */
export const REVIEW_CRITERIA = [
  { key: "scientificClarity", label: "Scientific clarity", options: ["Excellent", "Acceptable", "Needs improvement"] },
  { key: "tlcDocumentation", label: "TLC documentation", options: ["Excellent", "Acceptable", "Needs improvement"] },
  { key: "reactionDescription", label: "Reaction description", options: ["Excellent", "Acceptable", "Needs improvement"] },
  { key: "interpretation", label: "TLC interpretation", options: ["Scientifically reasonable", "Needs clarification"] },
  { key: "imageQuality", label: "Image quality", options: ["Acceptable", "Unacceptable"] },
  { key: "originality", label: "Originality", options: ["Acceptable", "Concern"] },
  { key: "practicalValue", label: "Practical value", options: ["High", "Moderate", "Low"] },
] as const;

export const REVIEW_RECOMMENDATIONS = ["Accept", "Minor Revision", "Major Revision", "Reject"];

export const WITHDRAW_REASONS = [
  "Duplicate submission",
  "Error discovered in the observation",
  "Data no longer authorized for publication",
  "Author request",
  "Editorial decision",
  "Other",
];

/** Configurable email templates (§35). Placeholders: {{id}} {{title}} {{author}} {{date}} {{link}} {{journalEmail}} */
export const EMAIL_TEMPLATE_KEYS = [
  "submissionReceived",
  "technicalRevision",
  "reviewDecision",
  "revisionReceived",
  "acceptance",
  "proofReady",
  "publication",
  "withdrawal",
] as const;

export const DEFAULT_EMAIL_TEMPLATES: Record<(typeof EMAIL_TEMPLATE_KEYS)[number], string> = {
  submissionReceived:
    "Dear {{author}},\n\nYour TLC contribution \"{{title}}\" has been received by the TLC Journal editorial team and is undergoing technical screening.\n\nSubmission ID: {{id}}\nDate: {{date}}\n\nYou can track the status at any time by signing in to your dashboard.\n\nWith best regards,\nTLC Journal Editorial Office ({{journalEmail}})",
  technicalRevision:
    "Dear {{author}},\n\nYour submission {{id}} requires technical correction before scientific review. Please log in to view the editorial comments and upload the corrected material.\n\nWith best regards,\nTLC Journal Editorial Office",
  reviewDecision:
    "Dear {{author}},\n\nAn editorial decision has been made on your submission {{id}} (\"{{title}}\"). Please log in to your dashboard to read the decision and the editor's comments.\n\nWith best regards,\nTLC Journal Editorial Office",
  revisionReceived:
    "Dear {{author}},\n\nYour revised submission {{id}} has been received and returned to the editorial workflow. Thank you for addressing the reviewers' comments.\n\nWith best regards,\nTLC Journal Editorial Office",
  acceptance:
    "Dear {{author}},\n\nCongratulations — your submission {{id}} (\"{{title}}\") has been accepted for publication in TLC Journal. The article will now enter production; you will be asked to approve the final proof before publication.\n\nWith best regards,\nTLC Journal Editorial Office",
  proofReady:
    "Dear {{author}},\n\nYour TLC Journal article has been accepted and is ready for final proof approval. Please log in, review the final one-page proof and approve it for publication or request a correction.\n\nWith best regards,\nTLC Journal Editorial Office",
  publication:
    "Dear {{author}},\n\nYour article \"{{title}}\" is now published in TLC Journal. The permanent page, one-page PDF and citation are available from your dashboard and the public journal.\n\nWith best regards,\nTLC Journal Editorial Office",
  withdrawal:
    "Dear {{author}},\n\nYour submission {{id}} has been withdrawn from the TLC Journal workflow. The scientific record is retained in the archive; please contact the editorial office with any questions.\n\nWith best regards,\nTLC Journal Editorial Office",
};

/** The nine confirmations shown before final submission (§5). */
export const FINAL_CHECKLIST: string[] = [
  "I have provided an original TLC photograph.",
  "The TLC photograph represents my actual experimental observation.",
  "I have provided an accurate reaction scheme.",
  "I have accurately described the TLC conditions.",
  "The information submitted is accurate.",
  "I am authorized to submit this material.",
  "The submission does not contain confidential/proprietary information that I am not authorized to disclose.",
  "I understand that the submission will undergo editorial review.",
  "I understand that acceptance does not guarantee publication until the final proof is approved.",
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
