import type { AuthorInfo, Submission, User } from "../types";

/* Demo TLC photographs and schemes (synthetic images — clearly marked
   DEMO in the UI, never presented as authentic experimental data). */
const IMG = {
  tlcOxidation: "https://image.qwenlm.ai/generated-images/ce42cde4-1d5d-4183-8554-b5f3fdb8ae74/_result.png",
  tlcEster: "https://image.qwenlm.ai/generated-images/565df2b6-430a-4523-85cc-a867142dd0e1/_result.png",
  tlcReduction: "https://image.qwenlm.ai/generated-images/26d0b200-2267-411a-99b4-34479afba72f/_result.png",
  tlcIntermediate: "https://image.qwenlm.ai/generated-images/1d81c5bc-36a3-4dbf-831f-a10249a6b732/_result.png",
  tlcFractions: "https://image.qwenlm.ai/generated-images/4b61a34f-eed2-4952-86e4-d7f94900caf8/_result.png",
  schemeOxidation: "https://image.qwenlm.ai/generated-images/7d9de33d-1907-4491-9a80-4c0cfb680222/_result.png",
  schemeEster: "https://image.qwenlm.ai/generated-images/c6b74790-9b12-4665-bc09-6c92a51d12f7/_result.png",
  schemeReduction: "https://image.qwenlm.ai/generated-images/0cece944-dcfc-48c0-86f4-d1e4675c9290/_result.png",
  schemeNitro: "https://image.qwenlm.ai/generated-images/87fd9019-c320-40f4-b4ed-c9accd808dae/_result.png",
};

export const DEMO_USERS: User[] = [
  {
    id: "u-admin",
    name: "Dr. Elena Marsh",
    email: "admin@tlcjournal.org",
    password: "tlc-demo",
    role: "admin",
    affiliation: "TLC Journal Editorial Office",
    createdAt: "2025-11-01",
  },
  {
    id: "u-editor",
    name: "Prof. Tomás Richter",
    email: "editor@tlcjournal.org",
    password: "tlc-demo",
    role: "editor",
    affiliation: "Institute of Process Chemistry, Heidelberg",
    orcid: "0000-0002-1145-8832",
    createdAt: "2025-11-03",
  },
  {
    id: "u-reviewer",
    name: "Dr. Kenji Sato",
    email: "reviewer@tlcjournal.org",
    password: "tlc-demo",
    role: "reviewer",
    affiliation: "Kyoto Pharmaceutical University",
    createdAt: "2025-11-10",
  },
  {
    id: "u-author",
    name: "Dr. Amara Osei",
    email: "author@tlcjournal.org",
    password: "tlc-demo",
    role: "author",
    affiliation: "Department of Chemistry, University of Cape Coast",
    orcid: "0000-0003-4471-2209",
    createdAt: "2025-12-02",
  },
];

let n = 0;
const aid = () => `a${++n}`;
const cid = () => `c${++n}`;

const author = (p: Partial<AuthorInfo> & { fullName: string }): AuthorInfo => ({
  id: aid(),
  degree: "",
  affiliation: "",
  department: "",
  institution: "",
  city: "",
  country: "",
  email: "",
  orcid: "",
  corresponding: false,
  ...p,
});

const okDeclarations = {
  original: true,
  photo: true,
  accurate: true,
  permission: true,
  confidentiality: true,
  scheme: true,
};

const fullChecklist = Object.fromEntries(
  [
    "photo", "scheme", "description", "phase", "mobile", "lanes", "viz",
    "interpretation", "quality", "claims", "onepage", "declaration", "plagiarism", "suitable",
  ].map((k) => [k, true]),
);

function base(p: Partial<Submission>): Submission {
  return {
    id: `s-${++n}`,
    articleId: null,
    status: "draft",
    title: "",
    articleType: "",
    keywords: [],
    authors: [],
    schemeImage: "",
    schemeFileName: "",
    reactionDescription: "",
    plateType: "",
    plateManufacturer: "",
    plateDimensions: "",
    mobilePhase: [],
    chamberCondition: "",
    spottingNotes: "",
    lanes: [],
    tlcImage: "",
    tlcImageName: "",
    originalKept: true,
    rotate: 0,
    spots: [],
    interpretation: {
      smSpot: "",
      productSpot: "",
      additionalSpots: "",
      reactionStatus: "",
      rfValues: [],
      notes: "",
    },
    includeProgress: false,
    progressSM: 1,
    progressProduct: 1,
    progressNote: "",
    visualization: [],
    scientificInterpretation: "",
    keyObservation: "",
    tlcStory: "",
    researchContext: "",
    declarations: { ...okDeclarations, original: false, photo: false, accurate: false, permission: false, confidentiality: false, scheme: false },
    volume: 1,
    issue: 1,
    pageEstimate: 0,
    createdAt: "",
    updatedAt: "",
    submittedAt: "",
    publishedAt: "",
    history: [],
    checklist: {},
    comments: [],
    ...p,
  } as Submission;
}

/* ------------------------------------------------------------------ */
/* Published demo articles (Volume 1)                                  */
/* ------------------------------------------------------------------ */

const art1 = base({
  id: "s-101",
  articleId: "TLCJ-2026-00001",
  status: "published",
  title: "Monitoring the Conversion of Benzyl Alcohol to Benzaldehyde by TLC",
  articleType: "Reaction Monitoring",
  keywords: ["TLC", "oxidation", "benzaldehyde", "PCC", "reaction monitoring", "KMnO4 stain"],
  authors: [
    author({ fullName: "Amara Osei", degree: "PhD", affiliation: "Department of Chemistry, University of Cape Coast", department: "Organic Chemistry", institution: "University of Cape Coast", city: "Cape Coast", country: "Ghana", email: "a.osei@ucc.example.edu", orcid: "0000-0003-4471-2209", corresponding: true }),
    author({ fullName: "Kwame Mensah", degree: "MPhil", affiliation: "Department of Chemistry, University of Cape Coast", department: "Organic Chemistry", institution: "University of Cape Coast", city: "Cape Coast", country: "Ghana", email: "k.mensah@ucc.example.edu" }),
  ],
  schemeImage: IMG.schemeOxidation,
  schemeFileName: "scheme-oxidation.png",
  reactionDescription:
    "Benzyl alcohol (1.0 equiv) was oxidized with pyridinium chlorochromate (PCC, 1.2 equiv) in anhydrous CH2Cl2 (0.2 M) at room temperature under nitrogen. Aliquots (≈0.1 mL) were withdrawn at 30 min and 2 h, quenched with sat. NaHCO3, extracted, and spotted alongside an authentic starting-material reference. Conversion was followed by the disappearance of the benzylic alcohol spot and growth of a new, less polar aldehyde spot.",
  plateType: "Silica gel F254",
  plateManufacturer: "Merck (TLC silica gel 60 F254)",
  plateDimensions: "5 × 10 cm, layer 0.25 mm",
  mobilePhase: [
    { id: cid(), solvent: "Ethyl acetate", parts: 30 },
    { id: cid(), solvent: "Hexane", parts: 70 },
  ],
  chamberCondition: "Saturated",
  spottingNotes: "Capillary spotting, ~1 µL per lane, lanes marked in pencil.",
  lanes: [
    { id: cid(), label: "SM", sampleType: "Starting material" },
    { id: cid(), label: "Co-spot", sampleType: "Co-spot" },
    { id: cid(), label: "Crude 2 h", sampleType: "Reaction mixture" },
  ],
  tlcImage: IMG.tlcOxidation,
  tlcImageName: "tlc-benzyl-oxidation-uv254.png",
  spots: [
    { lane: 1, rf: 0.36, intensity: 3 },
    { lane: 2, rf: 0.36, intensity: 2 },
    { lane: 2, rf: 0.58, intensity: 2 },
    { lane: 3, rf: 0.58, intensity: 3 },
    { lane: 3, rf: 0.36, intensity: 1 },
    { lane: 3, rf: 0.1, intensity: 1, tint: "stain" },
  ],
  interpretation: {
    smSpot: "Weak",
    productSpot: "Strong",
    additionalSpots: "One",
    reactionStatus: "Near complete conversion",
    rfValues: [
      { id: cid(), label: "Starting material (benzyl alcohol)", value: 0.36 },
      { id: cid(), label: "Product (benzaldehyde)", value: 0.58 },
      { id: cid(), label: "Over-oxidation impurity (benzoic acid, KMnO4 only)", value: 0.1 },
    ],
    notes: "A faint baseline spot appeared only after KMnO4 staining, consistent with trace benzoic acid.",
  },
  includeProgress: true,
  progressSM: 1,
  progressProduct: 4,
  progressNote: "Approximate visual assessment at 2 h.",
  visualization: [
    { id: cid(), method: "UV 254 nm", note: "Both starting material and aldehyde quench strongly; reaction lane dominated by product spot." },
    { id: cid(), method: "Iodine", note: "Confirmed the same two-spot pattern; no additional components." },
    { id: cid(), method: "KMnO4", note: "Aldehyde spot stained intense yellow-brown; trace baseline spot (acid) appeared only here." },
  ],
  scientificInterpretation:
    "The starting-material spot (Rf 0.36) nearly disappeared after 2 h while a new less-polar spot (Rf 0.58) grew in, matching co-spot behaviour of an authentic benzaldehyde reference. A faint baseline spot visible only after KMnO4 staining indicates trace over-oxidation to benzoic acid. The reaction was judged near-complete and was worked up; the trace acid was removed during the basic wash.",
  keyObservation: "KMnO4 staining exposed a trace over-oxidation impurity that UV 254 alone did not reveal — the work-up was adjusted accordingly.",
  tlcStory:
    "Under UV alone the plate looked clean and the reaction looked finished. It was only the KMnO4 dip that betrayed a whisper of benzoic acid pinned at the baseline — invisible at 254 nm because it co-elutes with polar material in this solvent system. That one faint yellow-brown spot changed the work-up: an extra NaHCO3 wash was added, and the isolated aldehyde came out acid-free. A small reminder that a plate is only as informative as the last stain you try.",
  researchContext: "Academic research",
  declarations: { ...okDeclarations },
  createdAt: "2026-01-05",
  updatedAt: "2026-01-16",
  submittedAt: "2026-01-06",
  publishedAt: "2026-01-18",
  history: [
    { status: "draft", date: "2026-01-05", by: "Amara Osei" },
    { status: "submitted", date: "2026-01-06", by: "Amara Osei" },
    { status: "technical_check", date: "2026-01-07", by: "Elena Marsh" },
    { status: "editorial_review", date: "2026-01-09", by: "Tomás Richter" },
    { status: "accepted", date: "2026-01-15", by: "Tomás Richter", note: "Concise, honest semi-quantitative reading." },
    { status: "published", date: "2026-01-18", by: "Elena Marsh" },
  ],
  checklist: { ...fullChecklist },
  comments: [],
  pageEstimate: 84,
  demo: true,
});

const art2 = base({
  id: "s-102",
  articleId: "TLCJ-2026-00002",
  status: "published",
  title: "Following a Fischer Esterification: When UV Alone Cannot Decide Completion",
  articleType: "Reaction Monitoring",
  keywords: ["TLC", "esterification", "Fischer", "methyl benzoate", "iodine", "UV ambiguity"],
  authors: [
    author({ fullName: "Marta Kowalska", degree: "PhD", affiliation: "Faculty of Chemistry, Gdańsk University of Technology", department: "Organic Chemistry", institution: "Gdańsk University of Technology", city: "Gdańsk", country: "Poland", email: "m.kowalska@pg.example.edu", corresponding: true }),
    author({ fullName: "Piotr Nowak", degree: "MSc", affiliation: "Faculty of Chemistry, Gdańsk University of Technology", department: "Organic Chemistry", institution: "Gdańsk University of Technology", city: "Gdańsk", country: "Poland", email: "p.nowak@pg.example.edu" }),
  ],
  schemeImage: IMG.schemeEster,
  schemeFileName: "scheme-esterification.png",
  reactionDescription:
    "Benzoic acid (1.0 equiv) was refluxed in dry methanol (solvent and reagent, 0.5 M) with catalytic conc. H2SO4 (0.1 equiv). Aliquots were taken at 1 h and 3 h, neutralized with NaHCO3, and analysed against starting material. Both acid and ester are UV-active aromatics with close Rf values in this system, so iodine was used as the deciding second visualization.",
  plateType: "Silica gel F254",
  plateManufacturer: "Merck",
  plateDimensions: "5 × 10 cm",
  mobilePhase: [
    { id: cid(), solvent: "Ethyl acetate", parts: 10 },
    { id: cid(), solvent: "Hexane", parts: 90 },
  ],
  chamberCondition: "Pre-equilibrated",
  spottingNotes: "Aliquots diluted 1:10 in DCM before spotting to avoid overload.",
  lanes: [
    { id: cid(), label: "SM", sampleType: "Starting material" },
    { id: cid(), label: "1 h", sampleType: "Reaction mixture" },
    { id: cid(), label: "3 h", sampleType: "Reaction mixture" },
  ],
  tlcImage: IMG.tlcEster,
  tlcImageName: "tlc-fischer-ester-uv254.png",
  spots: [
    { lane: 1, rf: 0.12, intensity: 3 },
    { lane: 2, rf: 0.12, intensity: 2 },
    { lane: 2, rf: 0.55, intensity: 2 },
    { lane: 3, rf: 0.12, intensity: 1 },
    { lane: 3, rf: 0.55, intensity: 3 },
  ],
  interpretation: {
    smSpot: "Weak",
    productSpot: "Strong",
    additionalSpots: "None",
    reactionStatus: "Complete conversion",
    rfValues: [
      { id: cid(), label: "Benzoic acid", value: 0.12 },
      { id: cid(), label: "Methyl benzoate", value: 0.55 },
    ],
    notes: "Acid tailing in the 1 h lane resolved cleanly in 10% EtOAc/hexane.",
  },
  includeProgress: true,
  progressSM: 1,
  progressProduct: 5,
  progressNote: "Visual estimate after 3 h reflux.",
  visualization: [
    { id: cid(), method: "UV 254 nm", note: "Acid and ester both quench; 3 h lane shows a weak residual baseline spot — ambiguous alone." },
    { id: cid(), method: "Iodine", note: "Ester stains far more intensely than the acid; baseline spot confirmed as residual acid, judged <5% visually." },
  ],
  scientificInterpretation:
    "At 1 h the plate shows comparable acid and ester spots. By 3 h the ester dominates and the acid spot is faint. Because both compounds quench UV differently, iodine staining was used to weight the comparison: the ester stains strongly while the acid stains weakly, supporting near-quantitative conversion. No side products were detected in either visualization.",
  keyObservation: "Equal-looking UV spots were not equal in mass — iodine revealed the 3 h lane was effectively complete.",
  tlcStory:
    "The trap here was symmetry: two neat dark spots, one above the other, and a tempting conclusion at hour one. Iodine broke the tie. The ester drank the iodine vapour while the acid barely responded, so the 'equal' UV comparison was an illusion of 50% conversion when the molar picture was already much further along. We now keep an iodine chamber next to the UV box for every esterification in the group.",
  researchContext: "Academic research",
  declarations: { ...okDeclarations },
  createdAt: "2026-01-14",
  updatedAt: "2026-01-25",
  submittedAt: "2026-01-15",
  publishedAt: "2026-01-27",
  history: [
    { status: "draft", date: "2026-01-14", by: "Marta Kowalska" },
    { status: "submitted", date: "2026-01-15", by: "Marta Kowalska" },
    { status: "technical_check", date: "2026-01-16", by: "Elena Marsh" },
    { status: "editorial_review", date: "2026-01-19", by: "Tomás Richter" },
    { status: "accepted", date: "2026-01-24", by: "Tomás Richter" },
    { status: "published", date: "2026-01-27", by: "Elena Marsh" },
  ],
  checklist: { ...fullChecklist },
  comments: [],
  pageEstimate: 79,
  demo: true,
});

const art3 = base({
  id: "s-103",
  articleId: "TLCJ-2026-00003",
  status: "published",
  title: "Rapid and Complete: NaBH4 Reduction of Acetophenone Watched Lane by Lane",
  articleType: "Reaction Monitoring",
  keywords: ["TLC", "reduction", "NaBH4", "1-phenylethanol", "co-spot", "fast reactions"],
  authors: [
    author({ fullName: "Kenji Sato", degree: "PhD", affiliation: "Faculty of Pharmaceutical Sciences, Kyoto Pharmaceutical University", department: "Synthetic Organic Chemistry", institution: "Kyoto Pharmaceutical University", city: "Kyoto", country: "Japan", email: "k.sato@kyoto-pharm.example.ac.jp", orcid: "0000-0002-7731-0045", corresponding: true }),
    author({ fullName: "Yuki Tanaka", degree: "BSc", affiliation: "Faculty of Pharmaceutical Sciences, Kyoto Pharmaceutical University", department: "Synthetic Organic Chemistry", institution: "Kyoto Pharmaceutical University", city: "Kyoto", country: "Japan", email: "y.tanaka@kyoto-pharm.example.ac.jp" }),
  ],
  schemeImage: IMG.schemeReduction,
  schemeFileName: "scheme-nabh4-reduction.png",
  reactionDescription:
    "Acetophenone (1.0 equiv) was treated with NaBH4 (1.1 equiv) in MeOH (0.3 M) at 0 °C, then allowed to warm to room temperature. Aliquots were quenched with water at 10 and 30 min and spotted with a co-spot of ketone plus alcohol standards. The reduction was essentially complete within 30 min.",
  plateType: "Silica gel F254",
  plateManufacturer: "Merck",
  plateDimensions: "5 × 10 cm",
  mobilePhase: [
    { id: cid(), solvent: "Ethyl acetate", parts: 25 },
    { id: cid(), solvent: "Hexane", parts: 75 },
  ],
  chamberCondition: "Saturated",
  spottingNotes: "Quenched aliquots extracted into EtOAc before spotting.",
  lanes: [
    { id: cid(), label: "SM", sampleType: "Starting material" },
    { id: cid(), label: "Co-spot", sampleType: "Co-spot" },
    { id: cid(), label: "30 min", sampleType: "Reaction mixture" },
    { id: cid(), label: "Product ref.", sampleType: "Reference standard" },
  ],
  tlcImage: IMG.tlcReduction,
  tlcImageName: "tlc-nabh4-reduction-uv254.png",
  spots: [
    { lane: 1, rf: 0.62, intensity: 3 },
    { lane: 2, rf: 0.62, intensity: 2 },
    { lane: 2, rf: 0.38, intensity: 2 },
    { lane: 3, rf: 0.38, intensity: 3 },
    { lane: 3, rf: 0.62, intensity: 1 },
    { lane: 4, rf: 0.38, intensity: 3 },
  ],
  interpretation: {
    smSpot: "Weak",
    productSpot: "Strong",
    additionalSpots: "None",
    reactionStatus: "Complete conversion",
    rfValues: [
      { id: cid(), label: "Acetophenone", value: 0.62 },
      { id: cid(), label: "1-Phenylethanol", value: 0.38 },
    ],
    notes: "Trace ketone at the limit of visual detection in the 30 min lane.",
  },
  includeProgress: true,
  progressSM: 1,
  progressProduct: 5,
  progressNote: "Estimated at 30 min.",
  visualization: [
    { id: cid(), method: "UV 254 nm", note: "Both aromatic compounds quench cleanly; baseline resolution of ketone and alcohol." },
    { id: cid(), method: "KMnO4", note: "Alcohol spot stains darker than ketone, confirming product identity." },
  ],
  scientificInterpretation:
    "The ketone spot (Rf 0.62) collapses rapidly while a single new spot (Rf 0.38) grows in, co-eluting with an authentic 1-phenylethanol reference. No intermediate or over-reduction products were observed. By 30 min the reaction lane is essentially a single spot and the reaction was stopped to avoid prolonged exposure of the borate intermediate to protic solvent.",
  keyObservation: "A clean two-spot system with full conversion in 30 min — ideal teaching plate for fast borohydride reductions.",
  tlcStory:
    "We expected to chase this reaction for an hour; the plate said thirty minutes. The co-spot lane was the hero — without it, the faint residual ketone could have been read as a second product. For fast reductions, our advice: take the first aliquot earlier than feels necessary, or the interesting part of the reaction happens between two plates you never ran.",
  researchContext: "Academic research",
  declarations: { ...okDeclarations },
  createdAt: "2026-01-28",
  updatedAt: "2026-02-05",
  submittedAt: "2026-01-29",
  publishedAt: "2026-02-06",
  history: [
    { status: "draft", date: "2026-01-28", by: "Kenji Sato" },
    { status: "submitted", date: "2026-01-29", by: "Kenji Sato" },
    { status: "technical_check", date: "2026-01-30", by: "Elena Marsh" },
    { status: "editorial_review", date: "2026-02-02", by: "Tomás Richter" },
    { status: "accepted", date: "2026-02-04", by: "Tomás Richter" },
    { status: "published", date: "2026-02-06", by: "Elena Marsh" },
  ],
  checklist: { ...fullChecklist },
  comments: [],
  pageEstimate: 81,
  demo: true,
});

const art4 = base({
  id: "s-104",
  articleId: "TLCJ-2026-00004",
  status: "published",
  title: "A Hidden Intermediate: Zn/NH4Cl Reduction of 4-Nitroacetophenone Caught Mid-Flight",
  articleType: "Unexpected TLC Observation",
  keywords: ["TLC", "nitro reduction", "intermediate", "hydroxylamine", "iodine", "ninhydrin"],
  authors: [
    author({ fullName: "Chidera Eze", degree: "PhD", affiliation: "Department of Pure & Industrial Chemistry, University of Nigeria", department: "Organic Chemistry", institution: "University of Nigeria, Nsukka", city: "Nsukka", country: "Nigeria", email: "c.eze@unn.example.edu.ng", corresponding: true }),
    author({ fullName: "Ada Obi", degree: "MSc", affiliation: "Department of Pure & Industrial Chemistry, University of Nigeria", department: "Organic Chemistry", institution: "University of Nigeria, Nsukka", city: "Nsukka", country: "Nigeria", email: "a.obi@unn.example.edu.ng" }),
  ],
  schemeImage: IMG.schemeNitro,
  schemeFileName: "scheme-nitro-reduction.png",
  reactionDescription:
    "4-Nitroacetophenone was reduced with Zn dust and NH4Cl in MeOH–H2O (4:1) at 50 °C. Aliquots were withdrawn at 1 h and 3 h. A persistent mid-Rf spot at 1 h — stronger than expected for simple incomplete conversion — matched the behaviour of a hydroxylamine intermediate, visible by UV, iodine and ninhydrin.",
  plateType: "Silica gel F254",
  plateManufacturer: "Sigma-Aldrich",
  plateDimensions: "5 × 10 cm",
  mobilePhase: [
    { id: cid(), solvent: "Ethyl acetate", parts: 40 },
    { id: cid(), solvent: "Hexane", parts: 60 },
  ],
  chamberCondition: "Saturated",
  spottingNotes: "Hot aliquots cooled and filtered before spotting.",
  lanes: [
    { id: cid(), label: "SM", sampleType: "Starting material" },
    { id: cid(), label: "1 h", sampleType: "Reaction mixture" },
    { id: cid(), label: "3 h", sampleType: "Reaction mixture" },
  ],
  tlcImage: IMG.tlcIntermediate,
  tlcImageName: "tlc-nitro-intermediate-uv254.png",
  spots: [
    { lane: 1, rf: 0.68, intensity: 3 },
    { lane: 2, rf: 0.68, intensity: 2 },
    { lane: 2, rf: 0.45, intensity: 2, tint: "iodine" },
    { lane: 2, rf: 0.22, intensity: 1 },
    { lane: 3, rf: 0.68, intensity: 1 },
    { lane: 3, rf: 0.45, intensity: 2, tint: "iodine" },
    { lane: 3, rf: 0.22, intensity: 3, tint: "stain" },
  ],
  interpretation: {
    smSpot: "Present",
    productSpot: "Strong",
    additionalSpots: "One",
    reactionStatus: "Multiple products",
    rfValues: [
      { id: cid(), label: "4-Nitroacetophenone (SM)", value: 0.68 },
      { id: cid(), label: "Hydroxylamine intermediate", value: 0.45 },
      { id: cid(), label: "4-Aminoacetophenone (product)", value: 0.22 },
    ],
    notes: "Mid-Rf spot stains brown with iodine and orange with ninhydrin, consistent with the NHOH intermediate.",
  },
  includeProgress: true,
  progressSM: 2,
  progressProduct: 4,
  progressNote: "At 3 h; intermediate still detectable.",
  visualization: [
    { id: cid(), method: "UV 254 nm", note: "All three species UV-active; intermediate spot weaker than its true abundance suggests." },
    { id: cid(), method: "Iodine", note: "Intermediate spot stains disproportionately strongly — first clue it was not ordinary starting material." },
    { id: cid(), method: "Ninhydrin", note: "Product amine spot develops orange; intermediate gives a faint brown-orange, supporting N–O functionality." },
  ],
  scientificInterpretation:
    "The 1 h lane shows three spots. The middle spot (Rf 0.45) persists longer than a simple kinetic mixture would suggest and stains anomalously strongly with iodine, consistent with the expected 4-hydroxylaminoacetophenone intermediate. By 3 h the amine (Rf 0.22) dominates while the intermediate remains visible, indicating that the NHOH → NH2 step is rate-limiting under these conditions.",
  keyObservation: "Iodine over-stained a mid-Rf spot that UV understated — the signature of the hydroxylamine intermediate.",
  tlcStory:
    "UV told a tidy story: starting material fading, product rising. Iodine told a messier one — a stubborn middle spot that refused to behave like either. That mismatch between visualizations is exactly where the chemistry was hiding. We slowed the second reduction step by lowering the temperature and watched the intermediate pool even further. Sometimes the plate disagrees with itself; that disagreement is the finding.",
  researchContext: "Academic research",
  declarations: { ...okDeclarations },
  createdAt: "2026-02-02",
  updatedAt: "2026-02-12",
  submittedAt: "2026-02-03",
  publishedAt: "2026-02-14",
  history: [
    { status: "draft", date: "2026-02-02", by: "Chidera Eze" },
    { status: "submitted", date: "2026-02-03", by: "Chidera Eze" },
    { status: "technical_check", date: "2026-02-04", by: "Elena Marsh" },
    { status: "editorial_review", date: "2026-02-06", by: "Tomás Richter" },
    { status: "revision_required", date: "2026-02-08", by: "Tomás Richter", note: "Please justify the intermediate assignment more explicitly." },
    { status: "resubmitted", date: "2026-02-10", by: "Chidera Eze" },
    { status: "accepted", date: "2026-02-12", by: "Tomás Richter" },
    { status: "published", date: "2026-02-14", by: "Elena Marsh" },
  ],
  checklist: { ...fullChecklist },
  comments: [
    {
      id: cid(), byName: "Tomás Richter", byRole: "editor", section: "Interpretation",
      text: "Please explain the additional spot and justify the hydroxylamine assignment beyond Rf alone.",
      date: "2026-02-08",
      authorResponse: "Added ninhydrin behaviour and literature Rf comparison; assignment stated as 'consistent with' rather than proven.",
    },
  ],
  pageEstimate: 90,
  demo: true,
});

const art5 = base({
  id: "s-105",
  articleId: "TLCJ-2026-00005",
  status: "published",
  title: "Pooling by Plate: Six-Lane TLC Screening of Flash Column Fractions",
  articleType: "Purification Monitoring",
  keywords: ["TLC", "flash chromatography", "fractions", "pooling", "methyl benzoate", "purification"],
  authors: [
    author({ fullName: "Amara Osei", degree: "PhD", affiliation: "Department of Chemistry, University of Cape Coast", department: "Organic Chemistry", institution: "University of Cape Coast", city: "Cape Coast", country: "Ghana", email: "a.osei@ucc.example.edu", corresponding: true }),
    author({ fullName: "Lena Fischer", degree: "MSc", affiliation: "Institute of Organic Chemistry, Heidelberg University", department: "Process Chemistry", institution: "Heidelberg University", city: "Heidelberg", country: "Germany", email: "l.fischer@heidelberg.example.de" }),
  ],
  schemeImage: IMG.schemeEster,
  schemeFileName: "scheme-esterification.png",
  reactionDescription:
    "The crude methyl benzoate reaction mixture (from a Fischer esterification) was purified by flash chromatography on silica (gradient 2→10% EtOAc in hexane, 12 fractions). Fractions were screened on a single six-lane plate against the crude mixture and a product reference to decide pooling ranges before solvent removal.",
  plateType: "Silica gel F254",
  plateManufacturer: "Merck",
  plateDimensions: "10 × 10 cm",
  mobilePhase: [
    { id: cid(), solvent: "Ethyl acetate", parts: 10 },
    { id: cid(), solvent: "Hexane", parts: 90 },
  ],
  chamberCondition: "Pre-equilibrated",
  spottingNotes: "Fractions spotted directly, undiluted; crude diluted 1:20.",
  lanes: [
    { id: cid(), label: "Crude", sampleType: "Reaction mixture" },
    { id: cid(), label: "F1–2", sampleType: "Fraction" },
    { id: cid(), label: "F3–5", sampleType: "Fraction" },
    { id: cid(), label: "F6–8", sampleType: "Fraction" },
    { id: cid(), label: "F9–12", sampleType: "Fraction" },
    { id: cid(), label: "Std", sampleType: "Reference standard" },
  ],
  tlcImage: IMG.tlcFractions,
  tlcImageName: "tlc-fractions-screening-uv254.png",
  spots: [
    { lane: 1, rf: 0.55, intensity: 2 },
    { lane: 1, rf: 0.2, intensity: 1 },
    { lane: 1, rf: 0.8, intensity: 1 },
    { lane: 2, rf: 0.8, intensity: 1 },
    { lane: 2, rf: 0.55, intensity: 1 },
    { lane: 3, rf: 0.55, intensity: 3 },
    { lane: 4, rf: 0.55, intensity: 3 },
    { lane: 5, rf: 0.55, intensity: 1 },
    { lane: 6, rf: 0.55, intensity: 3 },
  ],
  interpretation: {
    smSpot: "Absent",
    productSpot: "Strong",
    additionalSpots: "Multiple",
    reactionStatus: "Complete conversion",
    rfValues: [
      { id: cid(), label: "Methyl benzoate", value: 0.55 },
      { id: cid(), label: "Non-polar impurity (F1–2)", value: 0.8 },
      { id: cid(), label: "Polar impurity (crude only)", value: 0.2 },
    ],
    notes: "F3–5 and F6–8 pool cleanly; F1–2 carries a non-polar by-product; F9–12 trails the product.",
  },
  includeProgress: false,
  visualization: [
    { id: cid(), method: "UV 254 nm", note: "Product and both impurities UV-active; single visualization sufficient for pooling decision." },
    { id: cid(), method: "Iodine", note: "Confirmed the weak trailing material in F9–12 was product, not a new component." },
  ],
  scientificInterpretation:
    "The plate separates the mixture into three UV-active components. The product band (Rf 0.55) concentrates in fractions 3–8, matching the reference lane. Early fractions carry a more non-polar impurity (Rf 0.80) and only the crude shows a polar baseline component (Rf 0.20). Pooling F3–8 gave material homogeneous by TLC; late fractions were re-run.",
  keyObservation: "One six-lane plate replaced twelve individual checks and fixed the pooling window in a single development.",
  tlcStory:
    "The plate quietly vetoed our first pooling plan. We had intended to combine F2–9, but the non-polar streak in F1–2 and the trailing whisper in F9–12 said otherwise. Cutting at F3–8 cost a little yield and bought a lot of purity. Fraction screening is where TLC earns its keep: no instrument, five minutes, and the column's entire history on one sheet of silica.",
  researchContext: "Academic research",
  declarations: { ...okDeclarations },
  createdAt: "2026-02-10",
  updatedAt: "2026-02-19",
  submittedAt: "2026-02-11",
  publishedAt: "2026-02-21",
  history: [
    { status: "draft", date: "2026-02-10", by: "Amara Osei" },
    { status: "submitted", date: "2026-02-11", by: "Amara Osei" },
    { status: "technical_check", date: "2026-02-12", by: "Elena Marsh" },
    { status: "editorial_review", date: "2026-02-14", by: "Tomás Richter" },
    { status: "accepted", date: "2026-02-18", by: "Tomás Richter" },
    { status: "published", date: "2026-02-21", by: "Elena Marsh" },
  ],
  checklist: { ...fullChecklist },
  comments: [],
  pageEstimate: 86,
  demo: true,
});

/* ------------------------------------------------------------------ */
/* In-progress submissions                                             */
/* ------------------------------------------------------------------ */

const inReview = base({
  id: "s-201",
  articleId: null,
  status: "editorial_review",
  title: "TLC Monitoring of a Suzuki–Miyaura Coupling: Spot Tailing Across Solvent Systems",
  articleType: "Reaction Optimization",
  keywords: ["TLC", "Suzuki coupling", "palladium", "tailing", "method development"],
  authors: [
    author({ fullName: "Amara Osei", degree: "PhD", affiliation: "Department of Chemistry, University of Cape Coast", department: "Organic Chemistry", institution: "University of Cape Coast", city: "Cape Coast", country: "Ghana", email: "author@tlcjournal.org", corresponding: true }),
  ],
  schemeImage: IMG.schemeReduction,
  schemeFileName: "scheme-suzuki.png",
  reactionDescription:
    "A model Suzuki–Miyaura coupling of 4-bromoacetophenone with phenylboronic acid (Pd(PPh3)4, K2CO3, toluene/EtOH/H2O, 80 °C) was monitored by TLC. The biaryl product tails badly in pure hexane systems; addition of 1% Et3N to EtOAc/hexane sharpened the product spot dramatically.",
  plateType: "Silica gel F254",
  plateManufacturer: "Merck",
  plateDimensions: "5 × 10 cm",
  mobilePhase: [
    { id: cid(), solvent: "Ethyl acetate", parts: 20 },
    { id: cid(), solvent: "Hexane", parts: 80 },
  ],
  chamberCondition: "Saturated",
  lanes: [
    { id: cid(), label: "SM", sampleType: "Starting material" },
    { id: cid(), label: "Crude 4 h", sampleType: "Reaction mixture" },
  ],
  tlcImage: IMG.tlcReduction,
  tlcImageName: "tlc-suzuki-uv254.png",
  spots: [
    { lane: 1, rf: 0.6, intensity: 3 },
    { lane: 2, rf: 0.6, intensity: 1 },
    { lane: 2, rf: 0.35, intensity: 2, tint: "iodine" },
    { lane: 2, rf: 0.15, intensity: 1 },
  ],
  interpretation: {
    smSpot: "Weak",
    productSpot: "Present",
    additionalSpots: "One",
    reactionStatus: "Partial conversion",
    rfValues: [
      { id: cid(), label: "4-Bromoacetophenone", value: 0.6 },
      { id: cid(), label: "Biaryl product", value: 0.35 },
      { id: cid(), label: "Debrominated by-product (suspected)", value: 0.15 },
    ],
    notes: "",
  },
  visualization: [
    { id: cid(), method: "UV 254 nm", note: "All aromatic species visible." },
    { id: cid(), method: "Iodine", note: "Product spot clearer after iodine than UV due to tailing." },
  ],
  scientificInterpretation:
    "Conversion is partial at 4 h with residual aryl bromide and a growing product spot. A faint low-Rf spot may arise from protodeboronation. Product tailing complicated intensity judgment until triethylamine was added to the eluent.",
  keyObservation: "1% Et3N in the eluent turned a smear into a countable spot.",
  tlcStory:
    "The product smeared like a comet in every neutral eluent we tried. A drop of triethylamine in the mobile phase — a trick borrowed from amine chemistry — collapsed the tail into a compact spot and made the plate finally readable.",
  researchContext: "Academic research",
  declarations: { ...okDeclarations },
  createdAt: "2026-02-24",
  updatedAt: "2026-02-27",
  submittedAt: "2026-02-26",
  history: [
    { status: "draft", date: "2026-02-24", by: "Amara Osei" },
    { status: "submitted", date: "2026-02-26", by: "Amara Osei" },
    { status: "technical_check", date: "2026-02-27", by: "Elena Marsh" },
    { status: "editorial_review", date: "2026-02-27", by: "Tomás Richter" },
  ],
  checklist: {
    photo: true, scheme: true, description: true, phase: true, mobile: false,
    lanes: true, viz: true, interpretation: false, quality: true, claims: true,
    onepage: true, declaration: true, plagiarism: true, suitable: false,
  },
  comments: [
    {
      id: cid(), byName: "Tomás Richter", byRole: "editor", section: "TLC Conditions",
      text: "Please clarify the mobile-phase ratio and state whether the 1% Et3N system is the one shown in the photograph.",
      date: "2026-02-27",
    },
    {
      id: cid(), byName: "Elena Marsh", byRole: "admin", section: "TLC Photograph",
      text: "Please upload a higher-resolution original TLC photograph; the current file is near the minimum acceptable quality.",
      date: "2026-02-27",
    },
  ],
  pageEstimate: 74,
});

const needsRevision = base({
  id: "s-202",
  articleId: null,
  status: "revision_required",
  title: "Observation of Salicylic Acid in Aged Aspirin Samples by TLC",
  articleType: "Degradation Study",
  keywords: ["TLC", "aspirin", "salicylic acid", "degradation", "stability", "iodine"],
  authors: [
    author({ fullName: "Marta Kowalska", degree: "PhD", affiliation: "Faculty of Chemistry, Gdańsk University of Technology", department: "Organic Chemistry", institution: "Gdańsk University of Technology", city: "Gdańsk", country: "Poland", email: "m.kowalska@pg.example.edu", corresponding: true }),
  ],
  schemeImage: IMG.schemeEster,
  schemeFileName: "scheme-aspirin-hydrolysis.png",
  reactionDescription:
    "Commercial acetylsalicylic acid tablets stored for three months at 40 °C / 75% RH were compared with freshly opened material. Samples were dissolved in ethanol, spotted, and developed to reveal hydrolysis to salicylic acid. A ferric chloride dip was used as an orthogonal check on the phenolic spot.",
  plateType: "Silica gel F254",
  plateManufacturer: "Merck",
  plateDimensions: "5 × 10 cm",
  mobilePhase: [
    { id: cid(), solvent: "Ethyl acetate", parts: 40 },
    { id: cid(), solvent: "Hexane", parts: 40 },
    { id: cid(), solvent: "Acetic acid", parts: 20 },
  ],
  chamberCondition: "Saturated",
  lanes: [
    { id: cid(), label: "Fresh", sampleType: "Reference standard" },
    { id: cid(), label: "Aged 3 mo", sampleType: "Reaction mixture" },
    { id: cid(), label: "SA std", sampleType: "Reference standard" },
  ],
  tlcImage: IMG.tlcEster,
  tlcImageName: "tlc-aspirin-degradation-uv254.png",
  spots: [
    { lane: 1, rf: 0.55, intensity: 3 },
    { lane: 2, rf: 0.55, intensity: 2 },
    { lane: 2, rf: 0.3, intensity: 2, tint: "stain" },
    { lane: 3, rf: 0.3, intensity: 3 },
  ],
  interpretation: {
    smSpot: "Strong",
    productSpot: "Present",
    additionalSpots: "One",
    reactionStatus: "Unexpected product/spot",
    rfValues: [
      { id: cid(), label: "Acetylsalicylic acid", value: 0.55 },
      { id: cid(), label: "Salicylic acid", value: 0.3 },
    ],
    notes: "Aged sample shows a phenolic spot co-eluting with salicylic acid standard.",
  },
  visualization: [
    { id: cid(), method: "UV 254 nm", note: "Both compounds quench; aged lane shows a clear second spot." },
    { id: cid(), method: "Iodine", note: "Confirmed relative abundances." },
    { id: cid(), method: "Other", note: "FeCl3 dip — violet colour confirms phenolic (salicylic) character." },
  ],
  scientificInterpretation:
    "The aged tablet sample shows a second UV-active spot co-eluting with a salicylic acid standard, absent in fresh material. FeCl3 staining gives the expected violet phenolate colour, supporting ester hydrolysis during storage under humid heat.",
  keyObservation: "Humid storage converts a one-spot plate into a two-spot plate within three months.",
  tlcStory:
    "A pharmacy shelf in a hot summer is an uncontrolled reactor. The plate turned a vague stability worry into a visible spot — and the FeCl3 dip turned that spot into a functional-group identification, all before lunch.",
  researchContext: "Public research",
  declarations: { ...okDeclarations },
  createdAt: "2026-02-15",
  updatedAt: "2026-02-24",
  submittedAt: "2026-02-16",
  history: [
    { status: "draft", date: "2026-02-15", by: "Marta Kowalska" },
    { status: "submitted", date: "2026-02-16", by: "Marta Kowalska" },
    { status: "technical_check", date: "2026-02-17", by: "Elena Marsh" },
    { status: "editorial_review", date: "2026-02-19", by: "Tomás Richter" },
    { status: "revision_required", date: "2026-02-24", by: "Tomás Richter", note: "Lane 3 identification and storage conditions need clarification." },
  ],
  checklist: {
    photo: true, scheme: true, description: true, phase: true, mobile: true,
    lanes: false, viz: true, interpretation: true, quality: true, claims: true,
    onepage: true, declaration: true, plagiarism: true, suitable: false,
  },
  comments: [
    {
      id: cid(), byName: "Tomás Richter", byRole: "editor", section: "Lanes",
      text: "Please identify Lane 3 explicitly and confirm it is a purchased salicylic acid reference, not a co-spot of the aged sample.",
      date: "2026-02-24",
      authorResponse: "Lane 3 is a commercially purchased salicylic acid standard (≥99%), freshly prepared at 1 mg/mL in ethanol.",
    },
    {
      id: cid(), byName: "Tomás Richter", byRole: "editor", section: "Reaction Description",
      text: "Please state the exact storage conditions and tablet batch age; 'three months' alone is not reproducible.",
      date: "2026-02-24",
    },
  ],
  pageEstimate: 82,
});

const draftSub = base({
  id: "s-203",
  articleId: null,
  status: "draft",
  title: "Work-up Monitoring of an Amide Coupling: Watching the Urea By-product Disappear",
  articleType: "Work-up Monitoring",
  keywords: ["TLC", "amide coupling", "work-up", "EDC"],
  authors: [
    author({ fullName: "Amara Osei", degree: "PhD", affiliation: "Department of Chemistry, University of Cape Coast", department: "Organic Chemistry", institution: "University of Cape Coast", city: "Cape Coast", country: "Ghana", email: "author@tlcjournal.org", corresponding: true }),
  ],
  schemeImage: IMG.schemeOxidation,
  schemeFileName: "",
  reactionDescription: "Draft in progress — EDC·HCl coupling of benzoic acid with benzylamine in DCM; monitoring wash efficiency of the urea by-product.",
  plateType: "Silica gel F254",
  mobilePhase: [
    { id: cid(), solvent: "Ethyl acetate", parts: 50 },
    { id: cid(), solvent: "Hexane", parts: 50 },
  ],
  lanes: [
    { id: cid(), label: "SM", sampleType: "Starting material" },
    { id: cid(), label: "Crude", sampleType: "Reaction mixture" },
  ],
  tlcImage: IMG.tlcOxidation,
  tlcImageName: "tlc-amide-workup.png",
  spots: [
    { lane: 1, rf: 0.7, intensity: 2 },
    { lane: 2, rf: 0.7, intensity: 2 },
    { lane: 2, rf: 0.4, intensity: 1 },
  ],
  interpretation: {
    smSpot: "Present",
    productSpot: "Weak",
    additionalSpots: "One",
    reactionStatus: "Partial conversion",
    rfValues: [{ id: cid(), label: "Benzoic acid", value: 0.7 }],
    notes: "",
  },
  visualization: [{ id: cid(), method: "UV 254 nm", note: "" }],
  researchContext: "Academic research",
  createdAt: "2026-03-01",
  updatedAt: "2026-03-01",
  history: [{ status: "draft", date: "2026-03-01", by: "Amara Osei" }],
  pageEstimate: 38,
});

export const SEED_SUBMISSIONS: Submission[] = [
  art1, art2, art3, art4, art5, inReview, needsRevision, draftSub,
];

export const IMG_ASSETS = IMG;
