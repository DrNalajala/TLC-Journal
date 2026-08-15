/* ============================================================
   TLC Journal — relational data model (frontend mirror of the
   backend schema: Users, Authors, Submissions, Articles,
   Reactions, TLC Conditions, Lanes, Images, Visualization
   Methods, Reviews, Comments, Versions, Keywords, Categories,
   Editorial Decisions, Audit Logs)
   ============================================================ */

export type Role = "admin" | "editor" | "reviewer" | "author" | "reader";

export type ArticleStatus =
  | "draft"
  | "submitted"
  | "technical_check"
  | "editorial_review"
  | "revision_required"
  | "resubmitted"
  | "accepted"
  | "rejected"
  | "published";

export type ArticleType =
  | "Reaction Monitoring"
  | "Reaction Optimization"
  | "Purification Monitoring"
  | "Impurity Observation"
  | "Degradation Study"
  | "Work-up Monitoring"
  | "Unexpected TLC Observation"
  | "Method Development"
  | "Other";

export type PlateType =
  | "Silica gel"
  | "Silica gel F254"
  | "Alumina"
  | "Reverse phase (C18)"
  | "Other";

export type ChamberCondition = "Saturated" | "Unsaturated" | "Pre-equilibrated" | "";

export type SampleType =
  | "Starting material"
  | "Reaction mixture"
  | "Product"
  | "Intermediate"
  | "Co-spot"
  | "Fraction"
  | "Reference standard"
  | "Other";

export type SpotStrength = "Present" | "Absent" | "Weak" | "Strong" | "";

export type ReactionStatusOption =
  | "Starting material remains"
  | "Partial conversion"
  | "Near complete conversion"
  | "Complete conversion"
  | "Multiple products"
  | "Unexpected product/spot"
  | "Decomposition suspected"
  | "Cannot be concluded"
  | "";

export type ResearchContext =
  | "Academic research"
  | "Public research"
  | "Personal research"
  | "Industrial research — authorized for publication"
  | "";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo credentials only — replace with a real auth service
  role: Role;
  affiliation?: string;
  orcid?: string;
  createdAt: string;
}

export interface AuthorInfo {
  id: string;
  fullName: string;
  degree: string;
  affiliation: string;
  department: string;
  institution: string;
  city: string;
  country: string;
  email: string;
  orcid: string;
  corresponding: boolean;
}

export interface MobilePhaseEntry {
  id: string;
  solvent: string;
  parts: number;
}

export interface Lane {
  id: string;
  label: string;
  sampleType: SampleType | "";
}

export interface VisualizationStep {
  id: string;
  method: string; // from VISUALIZATION_METHODS or "Other: …"
  note: string;
}

export interface RfEntry {
  id: string;
  label: string;
  value: number | null;
}

export interface Interpretation {
  smSpot: SpotStrength;
  productSpot: SpotStrength;
  additionalSpots: "None" | "One" | "Multiple" | "";
  reactionStatus: ReactionStatusOption;
  rfValues: RfEntry[];
  notes: string;
}

/** Spot marks used to render the schematic plate (display layer). */
export interface SpotMark {
  lane: number; // 1-based lane index
  rf: number; // 0..1
  intensity: number; // 1..3
  tint?: "uv" | "iodine" | "stain";
}

export interface ReviewComment {
  id: string;
  byName: string;
  byRole: Role;
  section: string; // "General" or a section name
  text: string;
  date: string;
  authorResponse?: string;
}

export interface StatusEvent {
  status: ArticleStatus;
  date: string;
  by: string;
  note?: string;
}

export interface Declarations {
  original: boolean;
  photo: boolean;
  accurate: boolean;
  permission: boolean;
  confidentiality: boolean;
  scheme: boolean;
}

export interface Submission {
  id: string;
  /** TLCJ-YYYY-NNNNN — assigned on acceptance. Null until then. */
  articleId: string | null;
  status: ArticleStatus;
  title: string;
  articleType: ArticleType | "";
  keywords: string[];
  authors: AuthorInfo[];
  /* reaction */
  schemeImage: string; // dataURL or asset path
  schemeFileName: string;
  reactionDescription: string;
  /* TLC conditions */
  plateType: PlateType | "";
  plateManufacturer: string;
  plateDimensions: string;
  mobilePhase: MobilePhaseEntry[];
  chamberCondition: ChamberCondition;
  spottingNotes: string;
  lanes: Lane[];
  /* original TLC photograph */
  tlcImage: string; // dataURL or asset path
  tlcImageName: string;
  originalKept: boolean;
  rotate: number; // display-only rotation, original preserved
  spots: SpotMark[]; // schematic plate data
  /* interpretation */
  interpretation: Interpretation;
  includeProgress: boolean;
  progressSM: number; // 0..5 dot scale (visual estimate)
  progressProduct: number;
  progressNote: string;
  /* visualization sequence */
  visualization: VisualizationStep[];
  /* texts */
  scientificInterpretation: string; // "What does the TLC tell us?"
  keyObservation: string;
  tlcStory: string;
  /* ethics */
  researchContext: ResearchContext;
  declarations: Declarations;
  /* publication */
  volume: number;
  issue: number;
  pageEstimate: number; // % of one A4 page (live estimate)
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  publishedAt: string;
  history: StatusEvent[];
  checklist: Record<string, boolean>;
  comments: ReviewComment[];
  demo?: boolean;
}

export interface EditorialStats {
  total: number;
  drafts: number;
  underReview: number;
  revisionRequired: number;
  accepted: number;
  rejected: number;
  published: number;
  publishedThisMonth: number;
  avgReviewDays: number;
  authorCount: number;
  countries: string[];
  categoryCounts: { label: string; count: number }[];
  vizCounts: { label: string; count: number }[];
}
