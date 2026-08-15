/* ============================================================
   TLC Journal — relational data model (frontend mirror of the
   backend schema: Users, Author Profiles, Submissions,
   Submission Versions, Submission Files, Reviews, Review
   Comments, Author Responses, Editorial Decisions, Publications,
   Publication Proofs, Publication Events, Notifications,
   Email Logs, Audit Logs)
   ============================================================ */

export type Role = "admin" | "editor" | "reviewer" | "author" | "reader";

export type ArticleStatus =
  | "draft"
  | "submitted"
  | "technical_check"
  | "technical_revision"
  | "editorial_review" // displayed as "Under Review"
  | "revision_required"
  | "resubmitted"
  | "accepted"
  | "production"
  | "proof_ready"
  | "published"
  | "rejected"
  | "withdrawn";

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

export type RevisionType = "minor" | "major" | "";

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
  editorResponse?: string;
  resolved?: boolean;
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

/* ------------------ new workflow entities ------------------ */

export type ReviewCriterionValue = "" | "Excellent" | "Acceptable" | "Needs improvement";

/** TLC Journal Scientific Review (§16) */
export interface ScientificReview {
  id: string;
  reviewerName: string;
  reviewerRole: Role;
  date: string;
  scientificClarity: ReviewCriterionValue;
  tlcDocumentation: ReviewCriterionValue;
  reactionDescription: ReviewCriterionValue;
  interpretation: "" | "Scientifically reasonable" | "Needs clarification";
  imageQuality: "" | "Acceptable" | "Unacceptable";
  originality: "" | "Acceptable" | "Concern";
  practicalValue: "" | "High" | "Moderate" | "Low";
  recommendation: "" | "Accept" | "Minor Revision" | "Major Revision" | "Reject";
  comments: string;
}

/** Versioned original file — originals are never overwritten (§12). */
export interface FileVersion {
  version: number;
  data: string; // dataURL or asset path
  fileName: string;
  uploadedBy: string;
  date: string;
  note: string;
}

/** Revision history record (§20). */
export interface RevisionRecord {
  version: number;
  date: string;
  by: string;
  changes: string;
  files: string[];
  decision?: string;
}

export interface Correction {
  id: string;
  requestedBy: string;
  date: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  editorNote?: string;
  approvedDate?: string;
}

export interface WithdrawalInfo {
  by: string;
  date: string;
  reason: string;
}

export interface Submission {
  id: string;
  /** TLC-SUB-YYYY-NNNNN — generated at submission time. Never reused. */
  submissionId: string | null;
  /** TLCJ-YYYY-NNNNN — assigned on acceptance. Null until then. */
  articleId: string | null;
  status: ArticleStatus;
  revisionNumber: number; // 1 = original submission
  revisionType: RevisionType; // set with the latest revision decision
  title: string;
  articleType: ArticleType | "";
  keywords: string[];
  authors: AuthorInfo[];
  /* assignments */
  assignedEditorId: string | null;
  assignedEditorName: string;
  assignedReviewerId: string | null;
  assignedReviewerName: string;
  /* reaction */
  schemeImage: string; // dataURL or asset path (latest display copy)
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
  tlcImage: string; // latest display copy — originals kept in fileVersions
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
  /* editorial workflow */
  techCheck: Record<string, boolean>; // technical screening (§13)
  techReturnReason: string;
  reviews: ScientificReview[];
  decisionNote: string; // latest editorial decision comment
  productionChecklist: Record<string, boolean>; // production (§22)
  proofRequested: boolean; // author proof requested
  authorProofApproved: boolean;
  withdrawn: WithdrawalInfo | null;
  corrections: Correction[];
  correctedVersion: number; // 1 = original published version
  fileVersions: { tlc: FileVersion[]; scheme: FileVersion[] };
  revisions: RevisionRecord[];
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

/* ------------------ platform entities ------------------ */

export interface Notification {
  id: string;
  audience: string; // user id, or "staff" for all editorial roles
  text: string;
  date: string;
  read: boolean;
  link?: string; // route, e.g. /submission/<id>
}

export interface EmailLogEntry {
  id: string;
  to: string;
  subject: string;
  body: string;
  provider: string;
  date: string; // ISO timestamp
}

export interface AuditEvent {
  id: string;
  user: string;
  date: string; // ISO timestamp
  action: string;
  submissionId?: string; // internal id
  ref?: string; // TLC-SUB-… or TLCJ-…
  prevStatus?: ArticleStatus;
  newStatus?: ArticleStatus;
  comment?: string;
}

export interface JournalSettings {
  journalEmail: string; // configurable editorial office address (§37)
  emailProvider: "log-only" | "smtp" | "resend" | "sendgrid" | "ses";
  anonymousReview: boolean;
  emailTemplates: Record<string, string>; // editable by admin (§35)
}
