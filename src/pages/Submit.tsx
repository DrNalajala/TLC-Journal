import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type {
  ArticleType, AuthorInfo, ChamberCondition, Lane, MobilePhaseEntry, PlateType,
  ReactionStatusOption, ResearchContext, SampleType, Submission, VisualizationStep,
} from "../types";
import { estimatePagePct, useStore } from "../store/AppStore";
import {
  Btn, Field, IAlert, ICheck, IChevron, IDownload, IPlus, IRotate, ITrash, IUpload,
  IX, Modal, PageGauge, DotScale, StatusBadge, Tag,
} from "../components/ui";
import {
  ARTICLE_TYPES, CHAMBER_CONDITIONS, COMMON_SOLVENTS, DESCRIPTION_LIMIT, FINAL_CHECKLIST,
  ID_PREFIX, INTERPRETATION_LIMIT, MAX_UPLOAD_MB, PLATE_TYPES, REACTION_STATUSES,
  RESEARCH_CONTEXTS, SAMPLE_TYPES, SECTIONS, SPOT_STRENGTHS, STORY_LIMIT, VISUALIZATION_METHODS,
} from "../data/constants";
import ArticleSheet from "../components/ArticleSheet";

const nid = () => `x-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;

function blankAuthor(corresponding = false): AuthorInfo {
  return {
    id: nid(), fullName: "", degree: "", affiliation: "", department: "", institution: "",
    city: "", country: "", email: "", orcid: "", corresponding,
  };
}

function blankSubmission(userName = "", userEmail = ""): Submission {
  const a = blankAuthor(true);
  a.fullName = userName;
  a.email = userEmail;
  return {
    id: `s-${Date.now()}`, submissionId: null, articleId: null, status: "draft",
    revisionNumber: 1, revisionType: "",
    assignedEditorId: null, assignedEditorName: "", assignedReviewerId: null, assignedReviewerName: "",
    title: "", articleType: "", keywords: [], authors: [a],
    schemeImage: "", schemeFileName: "", reactionDescription: "",
    plateType: "", plateManufacturer: "", plateDimensions: "",
    mobilePhase: [{ id: nid(), solvent: "Ethyl acetate", parts: 30 }, { id: nid(), solvent: "Hexane", parts: 70 }],
    chamberCondition: "Saturated", spottingNotes: "",
    lanes: [
      { id: nid(), label: "SM", sampleType: "Starting material" },
      { id: nid(), label: "Reaction", sampleType: "Reaction mixture" },
    ],
    tlcImage: "", tlcImageName: "", originalKept: true, rotate: 0, spots: [],
    interpretation: { smSpot: "", productSpot: "", additionalSpots: "", reactionStatus: "", rfValues: [{ id: nid(), label: "Starting material", value: null }, { id: nid(), label: "Product", value: null }], notes: "" },
    includeProgress: false, progressSM: 3, progressProduct: 3, progressNote: "",
    visualization: [{ id: nid(), method: "UV 254 nm", note: "" }],
    scientificInterpretation: "", keyObservation: "", tlcStory: "",
    researchContext: "",
    declarations: { original: false, photo: false, accurate: false, permission: false, confidentiality: false, scheme: false },
    volume: 1, issue: 1, pageEstimate: 0,
    createdAt: new Date().toISOString().slice(0, 10), updatedAt: "", submittedAt: "", publishedAt: "",
    history: [{ status: "draft", date: new Date().toISOString().slice(0, 10), by: userName || "Author" }],
    checklist: {}, comments: [],
    techCheck: {}, techReturnReason: "", reviews: [], decisionNote: "",
    productionChecklist: {}, proofRequested: false, authorProofApproved: false,
    withdrawn: null, corrections: [], correctedVersion: 1,
    fileVersions: { tlc: [], scheme: [] }, revisions: [],
  };
}

/** Rules-based clarity helper — presentation only, never touches observations. */
function improveClarity(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.:;])/g, "$1")
    .replace(/([.!?])\s*([a-zäöü])/g, (_, p, c) => `${p} ${c.toUpperCase()}`)
    .replace(/\b(very|really|just|basically|actually|in order to)\b\s*/gi, (m) => (m.toLowerCase() === "in order to" ? "to " : ""))
    .replace(/\bI think (that )?/gi, "")
    .trim();
}

export default function Submit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    submissions, currentUser, saveSubmission, toast,
    submitToJournal, resubmitRevision, addFileVersion, nextSubmissionId,
  } = useStore();

  const existing = useMemo(() => submissions.find((s) => s.id === id), [submissions, id]);

  const [form, setForm] = useState<Submission>(() =>
    existing ? { ...existing } : blankSubmission(currentUser?.name ?? "", currentUser?.email ?? ""),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [kwInput, setKwInput] = useState("");
  const [finalChecks, setFinalChecks] = useState<Record<number, boolean>>({});
  const [revisionSummary, setRevisionSummary] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ subId: string; revision: boolean } | null>(null);
  const saveTimer = useRef<number | null>(null);

  const inRevision = form.status === "revision_required" || form.status === "technical_revision";

  /* keep form in sync if the draft was edited elsewhere */
  useEffect(() => {
    if (existing && existing.updatedAt !== form.updatedAt && !dirty) {
      setForm({ ...existing });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const pct = useMemo(() => estimatePagePct(form), [form]);

  const up = useCallback((patch: Partial<Submission>) => {
    setForm((f) => {
      // locked while under editorial handling
      if (!["draft", "revision_required", "resubmitted"].includes(f.status)) return f;
      return { ...f, ...patch };
    });
    setDirty(true);
  }, []);

  /* autosave draft (debounced) */
  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveSubmission(form);
      setDirty(false);
    }, 900);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-navy">Author account required</p>
        <h1 className="mt-3 font-display text-3xl font-black text-ink">Sign in to submit your TLC</h1>
        <p className="mt-3 text-[0.9rem] text-inksoft">
          Submissions are tied to an author account so the editorial office can manage the review
          workflow. Registration takes under a minute.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/auth?next=/submit" className="border border-uvdeep bg-uvdeep px-6 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#f5f8ef] hover:bg-[#3a6b1f]">
            Sign in / Register
          </Link>
          <Link to="/guidelines" className="border border-navy px-6 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-navy hover:bg-navy hover:text-white">
            Read guidelines first
          </Link>
        </div>
      </div>
    );
  }

  const locked = !["draft", "revision_required", "technical_revision"].includes(form.status);

  /* -------- post-submission confirmation screen (§6) -------- */
  if (successInfo) {
    return (
      <div className="graph-paper min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="border-2 border-ink bg-sheet p-8 shadow-[10px_10px_0_rgba(16,35,59,0.12)] sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center border-2 border-uvdeep bg-uvglow/40 text-uvdeep">
                <ICheck size={24} strokeWidth={2.5} />
              </span>
              <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.2em] text-uvdeep">
                {successInfo.revision ? "Revision received successfully" : "Submission received successfully"}
              </p>
            </div>
            <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">{form.title}</h1>
            <dl className="mt-6 grid gap-x-8 gap-y-4 border-y-2 border-ink py-5 sm:grid-cols-2">
              <div>
                <dt className="field-label">Submission ID</dt>
                <dd className="mt-1 font-mono text-xl font-bold text-navy">{successInfo.subId}</dd>
              </div>
              <div>
                <dt className="field-label">Date</dt>
                <dd className="mt-1 text-[0.95rem] font-medium text-ink">{new Date().toISOString().slice(0, 10)}</dd>
              </div>
              <div>
                <dt className="field-label">Current status</dt>
                <dd className="mt-1.5"><StatusBadge status={successInfo.revision ? "resubmitted" : "submitted"} /></dd>
              </div>
              <div>
                <dt className="field-label">Publication ID</dt>
                <dd className="mt-1 text-[0.95rem] font-medium text-inksoft">Assigned on acceptance ({ID_PREFIX}-2026-00001…)</dd>
              </div>
            </dl>
            <div className="mt-5 border-l-2 border-navy bg-sky px-4 py-3">
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-navy">Expected next step</p>
              <p className="mt-1 text-[0.85rem] leading-relaxed text-navy">
                {successInfo.revision
                  ? "Your revised submission has been received by the TLC Journal editorial team and returned to scientific review."
                  : "Your submission has been received by the TLC Journal editorial team and is undergoing technical screening."}{" "}
                A confirmation email has been logged for the corresponding author and the editorial office.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => navigate(`/submission/${form.id}`)} className="border-2 border-navy bg-navy px-6 py-3 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-0.5">
                View submission
              </button>
              <button onClick={() => navigate("/dashboard")} className="border border-navy px-6 py-3 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-navy hover:bg-sky">
                Go to dashboard
              </button>
              <button onClick={() => { setSuccessInfo(null); navigate("/"); }} className="ml-auto px-4 py-3 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-inkfaint hover:text-navy">
                Back to journal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- validation ---------------- */
  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "A title is required.";
    if (!form.articleType) e.articleType = "Select the article type.";
    if (form.keywords.length === 0) e.keywords = "Add at least one keyword.";
    if (form.authors.length === 0) e.authors = "Add at least one author.";
    form.authors.forEach((a, i) => {
      if (!a.fullName.trim()) e[`author-name-${i}`] = "Full name required.";
      if (!a.email.trim() || !/^\S+@\S+\.\S+$/.test(a.email)) e[`author-email-${i}`] = "Valid email required.";
      if (!a.institution.trim()) e[`author-inst-${i}`] = "Institution required.";
    });
    if (!form.authors.some((a) => a.corresponding)) e.authors = "Mark one corresponding author.";
    if (!form.reactionDescription.trim()) e.reactionDescription = "Briefly describe the reaction.";
    if (!form.plateType) e.plateType = "Select the stationary phase.";
    if (form.mobilePhase.filter((m) => m.solvent.trim()).length === 0) e.mobilePhase = "Provide at least one solvent.";
    if (form.lanes.length === 0) e.lanes = "Define at least one lane.";
    if (!form.tlcImage) e.tlcImage = "The original TLC photograph is mandatory.";
    if (form.visualization.length === 0) e.viz = "Add at least one visualization method.";
    const it = form.interpretation;
    if (!it.smSpot) e.smSpot = "Required.";
    if (!it.productSpot) e.productSpot = "Required.";
    if (!it.additionalSpots) e.additionalSpots = "Required.";
    if (!it.reactionStatus) e.reactionStatus = "Select the reaction status.";
    if (!form.scientificInterpretation.trim()) e.scientificInterpretation = "Explain what the TLC tells us.";
    if (!form.keyObservation.trim()) e.keyObservation = "Summarize the key observation.";
    if (!form.researchContext) e.researchContext = "Select the research context.";
    (Object.keys(form.declarations) as (keyof typeof form.declarations)[]).forEach((k) => {
      if (!form.declarations[k]) e[`decl-${k}`] = "All declarations must be confirmed.";
    });
    return e;
  };

  const onSaveDraft = () => {
    saveSubmission(form);
    setDirty(false);
    toast("Draft saved. You can finish it any time.", "ok");
  };

  /** Final submission — generates the submission ID or records the revision (§4–§6). */
  const doSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast(`${Object.keys(e).length} issue(s) need attention before submission.`, "bad");
      setConfirmOpen(false);
      document.getElementById(Object.keys(e)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!FINAL_CHECKLIST.every((_, i) => finalChecks[i])) {
      toast("Please confirm all nine statements in the final checklist.", "bad");
      setConfirmOpen(false);
      document.getElementById("sec-final")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (inRevision && revisionSummary.trim().length < 5) {
      toast("Please summarise the changes made in this revision.", "bad");
      setConfirmOpen(false);
      return;
    }
    // stop any pending autosave so it cannot overwrite the submitted state
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setDirty(false);
    saveSubmission(form);
    if (inRevision) {
      resubmitRevision(form.id, revisionSummary.trim());
      setSuccessInfo({ subId: form.submissionId ?? "—", revision: true });
    } else {
      const subId = submitToJournal(form.id);
      setSuccessInfo({ subId, revision: false });
    }
    setConfirmOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Replacing a file on an existing submission archives it as a new version — originals are never overwritten (§12). */
  const versionedScheme = (data: string, name: string) => {
    const had = !!form.schemeImage || form.fileVersions.scheme.length > 0;
    up({ schemeImage: data, schemeFileName: name });
    if (data && had && submissions.some((x) => x.id === form.id)) {
      addFileVersion(form.id, "scheme", data, name, "Replaced in submission editor — previous original preserved.");
    }
  };
  const versionedTlc = (data: string, name: string) => {
    const had = !!form.tlcImage || form.fileVersions.tlc.length > 0;
    up({ tlcImage: data, tlcImageName: name, rotate: 0 });
    if (data && had && submissions.some((x) => x.id === form.id)) {
      addFileVersion(form.id, "tlc", data, name, "Replaced in submission editor — previous original preserved.");
    }
  };

  const sectionDone = (sid: string): boolean => {
    switch (sid) {
      case "article": return !!form.title && !!form.articleType && form.keywords.length > 0;
      case "authors": return form.authors.every((a) => a.fullName && a.email && a.institution) && form.authors.some((a) => a.corresponding);
      case "scheme": return !!form.schemeImage;
      case "reaction": return form.reactionDescription.trim().length > 20;
      case "tlc": return !!form.plateType && form.mobilePhase.some((m) => m.solvent);
      case "lanes": return form.lanes.length > 0;
      case "photo": return !!form.tlcImage;
      case "viz": return form.visualization.length > 0;
      case "interpret": return !!form.interpretation.reactionStatus;
      case "progress": return true;
      case "science": return !!form.scientificInterpretation && !!form.keyObservation;
      case "story": return true;
      case "ethics": return Object.values(form.declarations).every(Boolean) && !!form.researchContext;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-paper pb-28">
      {/* header strip */}
      <div className="border-b border-line bg-navydeep text-[#f2f4f0]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div>
            <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.22em] text-uv">Submission editor · Vol. 1</p>
            <h1 className="mt-1 font-display text-2xl font-black sm:text-3xl">Submit your TLC</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#9db1c7]">
              {dirty ? "Unsaved changes…" : form.status === "draft" ? "Draft autosaved" : `Status: ${form.status.replace("_", " ")}`}
            </span>
            <Btn variant="dark" size="sm" onClick={onSaveDraft}>Save draft</Btn>
            <Btn variant="accent" size="sm" onClick={() => setPreviewOpen(true)}>Live A4 preview</Btn>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[210px_1fr]">
        {/* section rail */}
        <aside className="hidden lg:block">
          <nav className="sticky top-28 space-y-0.5">
            {SECTIONS.map((s) => {
              const done = sectionDone(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() =>
                    document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className={`flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-left font-mono text-[0.64rem] font-semibold uppercase tracking-[0.1em] transition-colors ${
                    done ? "border-uvdeep text-ink" : "border-line text-inkfaint hover:text-ink"
                  }`}
                >
                  <span className={`grid h-4 w-4 place-items-center border ${done ? "border-uvdeep bg-uvdeep text-white" : "border-[#b9c4ce]"}`}>
                    {done && <ICheck size={9} strokeWidth={3} />}
                  </span>
                  {s.code} · {s.name}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* form */}
        <div className="min-w-0 space-y-8">
          {locked && (
            <div className="flex items-center gap-3 border border-[#e5d2a4] bg-[#faf3e0] px-4 py-3 text-[0.82rem] font-medium text-[#6d4a0d]">
              <IAlert size={16} /> This submission is under editorial handling and can no longer be edited until a revision is requested.
            </div>
          )}

          {/* A — Article */}
          <Section code="A" title="Article information" id="article">
            <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
              <Field label="Title of TLC contribution" required error={errors.title}>
                <input
                  id="title"
                  className={`field-input ${errors.title ? "input-error" : ""}`}
                  placeholder='e.g. "Monitoring the Conversion of Benzyl Alcohol to Benzaldehyde by TLC"'
                  value={form.title}
                  onChange={(e) => up({ title: e.target.value })}
                  maxLength={160}
                />
              </Field>
              <Field label="Article type" required error={errors.articleType}>
                <select id="articleType" className="field-input" value={form.articleType} onChange={(e) => up({ articleType: e.target.value as ArticleType })}>
                  <option value="">Select…</option>
                  {ARTICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Keywords" required error={errors.keywords} hint="Press Enter or comma to add. e.g. TLC, oxidation, benzaldehyde, reaction monitoring">
                <div id="keywords" className={`flex flex-wrap items-center gap-1.5 border border-line bg-white p-2 ${errors.keywords ? "border-[#a33327]" : ""}`}>
                  {form.keywords.map((k) => (
                    <span key={k} className="flex items-center gap-1 bg-sky px-2 py-0.5 font-mono text-[0.68rem] text-navy">
                      {k}
                      <button onClick={() => up({ keywords: form.keywords.filter((x) => x !== k) })} className="hover:text-[#a33327]"><IX size={11} /></button>
                    </span>
                  ))}
                  <input
                    className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-0.5 text-[0.85rem] outline-none"
                    placeholder={form.keywords.length ? "" : "Add keyword…"}
                    value={kwInput}
                    onChange={(e) => setKwInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === ",") && kwInput.trim()) {
                        e.preventDefault();
                        if (!form.keywords.includes(kwInput.trim())) up({ keywords: [...form.keywords, kwInput.trim()] });
                        setKwInput("");
                      }
                    }}
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* B — Authors */}
          <Section code="B" title="Authors" id="authors">
            <div className="space-y-4">
              {form.authors.map((a, i) => (
                <div key={a.id} className="border border-line bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.14em] text-navy">
                      Author {i + 1} {a.corresponding && <Tag tone="green">Corresponding</Tag>}
                    </span>
                    <div className="flex items-center gap-2">
                      {!a.corresponding && (
                        <button
                          className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy hover:underline"
                          onClick={() => up({ authors: form.authors.map((x) => ({ ...x, corresponding: x.id === a.id })) })}
                        >
                          Make corresponding
                        </button>
                      )}
                      {form.authors.length > 1 && (
                        <button onClick={() => up({ authors: form.authors.filter((x) => x.id !== a.id) })} className="text-[#a33327] hover:opacity-70"><ITrash size={15} /></button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Full name" required error={errors[`author-name-${i}`]}>
                      <input id={`author-name-${i}`} className="field-input" value={a.fullName} onChange={(e) => upAuthor(a.id, { fullName: e.target.value })} placeholder="Dr. Jane Doe" />
                    </Field>
                    <Field label="Degree / title"><input className="field-input" value={a.degree} onChange={(e) => upAuthor(a.id, { degree: e.target.value })} placeholder="PhD" /></Field>
                    <Field label="ORCID (optional)"><input className="field-input" value={a.orcid} onChange={(e) => upAuthor(a.id, { orcid: e.target.value })} placeholder="0000-0000-0000-0000" /></Field>
                    <Field label="Institution" required error={errors[`author-inst-${i}`]}>
                      <input id={`author-inst-${i}`} className="field-input" value={a.institution} onChange={(e) => upAuthor(a.id, { institution: e.target.value })} placeholder="University / Company" />
                    </Field>
                    <Field label="Department"><input className="field-input" value={a.department} onChange={(e) => upAuthor(a.id, { department: e.target.value })} /></Field>
                    <Field label="Affiliation line"><input className="field-input" value={a.affiliation} onChange={(e) => upAuthor(a.id, { affiliation: e.target.value })} placeholder="Faculty of Chemistry, …" /></Field>
                    <Field label="City"><input className="field-input" value={a.city} onChange={(e) => upAuthor(a.id, { city: e.target.value })} /></Field>
                    <Field label="Country"><input className="field-input" value={a.country} onChange={(e) => upAuthor(a.id, { country: e.target.value })} /></Field>
                    <Field label="Email" required error={errors[`author-email-${i}`]}>
                      <input id={`author-email-${i}`} className="field-input" value={a.email} onChange={(e) => upAuthor(a.id, { email: e.target.value })} placeholder="jane@lab.org" />
                    </Field>
                  </div>
                </div>
              ))}
              <Btn variant="ghost" size="sm" onClick={() => up({ authors: [...form.authors, blankAuthor()] })}>
                <IPlus size={14} /> Add author
              </Btn>
            </div>
          </Section>

          {/* C — Scheme */}
          <Section code="C" title="Reaction scheme" id="scheme">
            <p className="mb-3 border-l-2 border-blue bg-sky px-3 py-2 text-[0.78rem] leading-relaxed text-navy">
              Please provide a chemically accurate reaction scheme showing starting material, reagents,
              solvent, temperature, reaction time and product wherever applicable.
            </p>
            <ImageDrop
              value={form.schemeImage}
              fileName={form.schemeFileName}
              onChange={versionedScheme}
              accept="image/png,image/jpeg,image/svg+xml"
              formats="PNG · JPG · SVG · PDF export"
              tall={false}
            />
          </Section>

          {/* D — Reaction description */}
          <Section code="D" title="Reaction description" id="reaction">
            <p className="mb-3 text-[0.8rem] italic text-inksoft">
              Briefly describe what was done and what the TLC showed. Avoid unnecessary experimental detail.
            </p>
            <Field label="Describe the reaction briefly" required error={errors.reactionDescription}
              hint={`What reaction? Which starting material, reagent/catalyst, solvent, temperature, time — and how did the TLC progress? ${form.reactionDescription.length}/${DESCRIPTION_LIMIT}`}>
              <textarea
                id="reactionDescription"
                rows={5}
                maxLength={DESCRIPTION_LIMIT}
                className={`field-input resize-y ${errors.reactionDescription ? "input-error" : ""}`}
                value={form.reactionDescription}
                onChange={(e) => up({ reactionDescription: e.target.value })}
              />
            </Field>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                className="inline-flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] text-navy hover:border-navy"
                onClick={() => {
                  up({ reactionDescription: improveClarity(form.reactionDescription) });
                  toast("Clarity pass applied — presentation only, observations untouched.", "ok");
                }}
              >
                ✦ AI clarity helper
              </button>
              <span className="text-[0.64rem] italic text-inkfaint">
                AI assistance may improve presentation, but all scientific observations must originate from the author's actual experiment.
              </span>
            </div>
          </Section>

          {/* E — TLC conditions */}
          <Section code="E" title="TLC conditions" id="tlc">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="TLC plate" required error={errors.plateType}>
                <select id="plateType" className="field-input" value={form.plateType} onChange={(e) => up({ plateType: e.target.value as PlateType })}>
                  <option value="">Select…</option>
                  {PLATE_TYPES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Plate manufacturer (optional)"><input className="field-input" value={form.plateManufacturer} onChange={(e) => up({ plateManufacturer: e.target.value })} placeholder="e.g. Merck" /></Field>
              <Field label="Plate dimensions (optional)"><input className="field-input" value={form.plateDimensions} onChange={(e) => up({ plateDimensions: e.target.value })} placeholder="5 × 10 cm" /></Field>
            </div>

            <div className="mt-5">
              <Field label="Mobile phase (structured)" required error={errors.mobilePhase} hint="e.g. Ethyl acetate : Hexane = 30 : 70">
                <div id="mobilePhase" className="space-y-2">
                  {form.mobilePhase.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <input
                        list="solvent-list"
                        className="field-input flex-1"
                        placeholder="Solvent"
                        value={m.solvent}
                        onChange={(e) => upMobile(m.id, { solvent: e.target.value })}
                      />
                      <input
                        type="number" min={1} max={99}
                        className="field-input w-24 text-center"
                        value={m.parts}
                        onChange={(e) => upMobile(m.id, { parts: Number(e.target.value) || 0 })}
                      />
                      <button onClick={() => up({ mobilePhase: form.mobilePhase.filter((x) => x.id !== m.id) })} className="text-[#a33327] hover:opacity-70"><ITrash size={15} /></button>
                    </div>
                  ))}
                  <datalist id="solvent-list">
                    {COMMON_SOLVENTS.map((s) => <option key={s} value={s} />)}
                  </datalist>
                  <div className="flex flex-wrap items-center gap-3">
                    <Btn variant="ghost" size="sm" onClick={() => up({ mobilePhase: [...form.mobilePhase, { id: nid(), solvent: "", parts: 10 }] })}>
                      <IPlus size={13} /> Add solvent
                    </Btn>
                    {form.mobilePhase.length > 1 && (
                      <span className="font-mono text-[0.72rem] text-navy">
                        = {form.mobilePhase.map((m) => `${m.solvent || "?"} ${m.parts}`).join(" : ")}
                      </span>
                    )}
                  </div>
                </div>
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Chamber condition (optional)">
                <select className="field-input" value={form.chamberCondition} onChange={(e) => up({ chamberCondition: e.target.value as ChamberCondition })}>
                  <option value="">—</option>
                  {CHAMBER_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Sample spotting notes (optional)">
                <input className="field-input" value={form.spottingNotes} onChange={(e) => up({ spottingNotes: e.target.value })} placeholder="Capillary volume, dilution, marking…" />
              </Field>
            </div>
          </Section>

          {/* F — Lane designer */}
          <Section code="F" title="Lane designer" id="lanes">
            <p className="mb-3 text-[0.8rem] italic text-inksoft">
              These labels are printed beneath your TLC photograph in the final article. Reorder to match the plate.
            </p>
            <div id="lanes" className="space-y-2">
              {form.lanes.map((l, i) => (
                <div key={l.id} className="flex flex-wrap items-center gap-2 border border-line bg-white p-2.5">
                  <span className="grid h-8 w-8 place-items-center bg-navy font-mono text-[0.72rem] font-bold text-white">{i + 1}</span>
                  <input className="field-input w-40 flex-1" value={l.label} placeholder="Lane label" onChange={(e) => upLane(l.id, { label: e.target.value })} />
                  <select className="field-input w-48" value={l.sampleType} onChange={(e) => upLane(l.id, { sampleType: e.target.value as SampleType })}>
                    <option value="">Sample type…</option>
                    {SAMPLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <IconBtn disabled={i === 0} onClick={() => moveLane(i, -1)} title="Move up">↑</IconBtn>
                    <IconBtn disabled={i === form.lanes.length - 1} onClick={() => moveLane(i, 1)} title="Move down">↓</IconBtn>
                    <IconBtn onClick={() => up({ lanes: form.lanes.filter((x) => x.id !== l.id) })} title="Remove" danger>✕</IconBtn>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Btn variant="ghost" size="sm" onClick={() => up({ lanes: [...form.lanes, { id: nid(), label: `Lane ${form.lanes.length + 1}`, sampleType: "" }] })}>
                <IPlus size={13} /> Add lane
              </Btn>
              {["Starting material", "Reaction mixture", "Product", "Intermediate", "Co-spot"].map((t) => (
                <button
                  key={t}
                  className="border border-dashed border-[#b9c4ce] px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-inksoft hover:border-navy hover:text-navy"
                  onClick={() => up({ lanes: [...form.lanes, { id: nid(), label: t.split(" ").map((w) => w[0]).join(""), sampleType: t as SampleType }] })}
                >
                  + {t}
                </button>
              ))}
            </div>
          </Section>

          {/* G — Original photograph */}
          <Section code="G" title="Original TLC photograph" id="photo">
            <div className="mb-3 border-l-2 border-[#b45309] bg-[#faf3e0] px-3 py-2 text-[0.78rem] leading-relaxed text-[#6d4a0d]">
              <strong>Original photograph required.</strong> Screenshots downloaded from other websites are not
              accepted as the primary TLC image. The original file is preserved untouched; crop/rotate affect the
              display copy only.
            </div>
            <Field label="TLC photograph" required error={errors.tlcImage}>
              <ImageDrop
                id="tlcImage"
                value={form.tlcImage}
                fileName={form.tlcImageName}
                onChange={versionedTlc}
                accept="image/png,image/jpeg,image/webp"
                formats="PNG · JPG · WEBP"
                tall
                rotate={form.rotate}
                onRotate={(r) => up({ rotate: r })}
              />
            </Field>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5">
              <input type="checkbox" className="mt-1 accent-[#467f26]" checked={form.originalKept} onChange={(e) => up({ originalKept: e.target.checked })} />
              <span className="text-[0.8rem] text-inksoft">
                I understand the journal stores the <strong className="text-ink">original image</strong>, a display
                copy and a thumbnail, and retains metadata where technically possible.
              </span>
            </label>
          </Section>

          {/* H — Visualization */}
          <Section code="H" title="Visualization sequence" id="viz">
            <p className="mb-3 text-[0.8rem] italic text-inksoft">
              Report in the preferred order: <strong className="text-navy">1. UV → 2. Iodine → 3. Other reagents</strong>.
              The article displays methods exactly in the order below.
            </p>
            <div id="viz" className="space-y-2.5">
              {form.visualization.map((v, i) => (
                <div key={v.id} className="border border-line bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center bg-uvdeep font-mono text-[0.72rem] font-bold text-white">{i + 1}</span>
                    <select className="field-input w-64" value={v.method} onChange={(e) => upViz(v.id, { method: e.target.value })}>
                      {VISUALIZATION_METHODS.map((m) => <option key={m}>{m}</option>)}
                      {!VISUALIZATION_METHODS.includes(v.method as never) && <option>{v.method}</option>}
                    </select>
                    <div className="ml-auto flex items-center gap-1">
                      <IconBtn disabled={i === 0} onClick={() => moveViz(i, -1)} title="Earlier">↑</IconBtn>
                      <IconBtn disabled={i === form.visualization.length - 1} onClick={() => moveViz(i, 1)} title="Later">↓</IconBtn>
                      <IconBtn onClick={() => up({ visualization: form.visualization.filter((x) => x.id !== v.id) })} title="Remove" danger>✕</IconBtn>
                    </div>
                  </div>
                  <input
                    className="field-input mt-2"
                    placeholder="What did this visualization show? e.g. 'Product spot strongly visualized'"
                    value={v.note}
                    onChange={(e) => upViz(v.id, { note: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Btn variant="ghost" size="sm" onClick={() => up({ visualization: [...form.visualization, { id: nid(), method: "Iodine", note: "" }] })}>
                <IPlus size={13} /> Add method
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => {
                const rank = (m: string) => (m.startsWith("UV") ? 0 : m === "Iodine" ? 1 : 2);
                up({ visualization: [...form.visualization].sort((a, b) => rank(a.method) - rank(b.method)) });
                toast("Sequence sorted to the UV → Iodine → Stain standard.", "ok");
              }}>
                Sort to standard order
              </Btn>
            </div>
          </Section>

          {/* I — Interpretation */}
          <Section code="I" title="TLC interpretation & Rf" id="interpret">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starting material spot" required error={errors.smSpot}>
                <SelectPills id="smSpot" options={SPOT_STRENGTHS} value={form.interpretation.smSpot} onChange={(v) => upInterpretation({ smSpot: v as never })} />
              </Field>
              <Field label="Product spot" required error={errors.productSpot}>
                <SelectPills id="productSpot" options={SPOT_STRENGTHS} value={form.interpretation.productSpot} onChange={(v) => upInterpretation({ productSpot: v as never })} />
              </Field>
              <Field label="Additional spots" required error={errors.additionalSpots}>
                <SelectPills id="additionalSpots" options={["None", "One", "Multiple"]} value={form.interpretation.additionalSpots} onChange={(v) => upInterpretation({ additionalSpots: v as never })} />
              </Field>
              <Field label="Reaction status" required error={errors.reactionStatus}>
                <select id="reactionStatus" className="field-input" value={form.interpretation.reactionStatus} onChange={(e) => upInterpretation({ reactionStatus: e.target.value as ReactionStatusOption })}>
                  <option value="">Select…</option>
                  {REACTION_STATUSES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
              <div>
                <Field label="Approximate Rf values" hint="Multiple entries allowed — one per spot.">
                  <div className="space-y-2">
                    {form.interpretation.rfValues.map((r) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <input className="field-input flex-1" placeholder="Spot label (e.g. Product)" value={r.label} onChange={(e) => upRf(r.id, { label: e.target.value })} />
                        <span className="font-mono text-[0.7rem] font-bold text-navy">Rf</span>
                        <input
                          type="number" step="0.01" min={0} max={1}
                          className="field-input w-24 text-center font-mono"
                          value={r.value ?? ""}
                          placeholder="0.00"
                          onChange={(e) => upRf(r.id, { value: e.target.value === "" ? null : Math.min(1, Math.max(0, Number(e.target.value))) })}
                        />
                        <button onClick={() => upInterpretation({ rfValues: form.interpretation.rfValues.filter((x) => x.id !== r.id) })} className="text-[#a33327] hover:opacity-70"><ITrash size={15} /></button>
                      </div>
                    ))}
                    <Btn variant="ghost" size="sm" onClick={() => upInterpretation({ rfValues: [...form.interpretation.rfValues, { id: nid(), label: "", value: null }] })}>
                      <IPlus size={13} /> Add Rf entry
                    </Btn>
                  </div>
                </Field>
                <Field label="Interpretation notes (optional)">
                  <textarea rows={2} className="field-input resize-y mt-2" value={form.interpretation.notes} onChange={(e) => upInterpretation({ notes: e.target.value })} placeholder="Tailing, streaking, chamber effects…" />
                </Field>
              </div>
              <RfCalculator onApply={(label, rf) => {
                upInterpretation({ rfValues: [...form.interpretation.rfValues.filter((r) => r.label.trim() || r.value !== null), { id: nid(), label, value: rf }] });
                toast(`Rf ${rf.toFixed(2)} added to the table.`, "ok");
              }} />
            </div>
          </Section>

          {/* J — Progress */}
          <Section code="J" title="Reaction progress (optional)" id="progress">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input type="checkbox" className="mt-1 accent-[#467f26]" checked={form.includeProgress} onChange={(e) => up({ includeProgress: e.target.checked })} />
              <span className="text-[0.82rem] text-inksoft">Include a graphical (dot-scale) reaction progress summary.</span>
            </label>
            {form.includeProgress && (
              <div className="mt-4 border border-line bg-white p-4">
                <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-32 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-inksoft">Starting material</span>
                    <DotScale value={form.progressSM} onChange={(v) => up({ progressSM: v })} />
                  </div>
                  <span className="font-display text-2xl font-bold text-navy">↓</span>
                  <div className="flex items-center gap-3">
                    <span className="w-32 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-inksoft">Product</span>
                    <DotScale value={form.progressProduct} onChange={(v) => up({ progressProduct: v })} />
                  </div>
                </div>
                <input className="field-input mt-3" placeholder="Note, e.g. 'Approximate visual assessment at 2 h.'" value={form.progressNote} onChange={(e) => up({ progressNote: e.target.value })} />
                <p className="mt-3 border-l-2 border-[#b45309] bg-[#faf3e0] px-3 py-2 text-[0.72rem] italic leading-relaxed text-[#6d4a0d]">
                  TLC intensity is generally qualitative or semi-quantitative and should not automatically be
                  interpreted as a quantitative measure of reaction conversion.
                </p>
              </div>
            )}
          </Section>

          {/* K — Scientific interpretation */}
          <Section code="K" title="Scientific interpretation" id="science">
            <Field label="What does the TLC tell us?" required error={errors.scientificInterpretation}
              hint={`Disappearance of SM, appearance of product, intermediates, impurities, completion, decomposition… ≈100–200 words. ${form.scientificInterpretation.length}/${INTERPRETATION_LIMIT}`}>
              <textarea
                id="scientificInterpretation" rows={5} maxLength={INTERPRETATION_LIMIT}
                className={`field-input resize-y ${errors.scientificInterpretation ? "input-error" : ""}`}
                value={form.scientificInterpretation}
                onChange={(e) => up({ scientificInterpretation: e.target.value })}
              />
            </Field>
            <div className="mt-4">
              <Field label="Key observation (one-sentence conclusion)" required error={errors.keyObservation}>
                <input id="keyObservation" className={`field-input ${errors.keyObservation ? "input-error" : ""}`} value={form.keyObservation} onChange={(e) => up({ keyObservation: e.target.value })} maxLength={220} placeholder="The single most useful thing this plate told you." />
              </Field>
            </div>
          </Section>

          {/* L — Story */}
          <Section code="L" title="The TLC story (optional)" id="story">
            <p className="mb-2 text-[0.8rem] italic text-inksoft">
              What was interesting, unusual, useful, or practically important about this TLC? A hidden
              intermediate? A stain that revealed what UV could not? This section makes the journal worth reading.
            </p>
            <textarea
              rows={4} maxLength={STORY_LIMIT}
              className="field-input resize-y font-display text-[0.95rem] italic"
              placeholder="Tell the story of the plate…"
              value={form.tlcStory}
              onChange={(e) => up({ tlcStory: e.target.value })}
            />
            <p className="mt-1 text-right font-mono text-[0.62rem] text-inkfaint">{form.tlcStory.length}/{STORY_LIMIT}</p>
          </Section>

          {/* M — Ethics */}
          <Section code="M" title="Declarations & ethics" id="ethics">
            <div className="border-l-2 border-[#a33327] bg-[#faece9] px-3 py-2.5 text-[0.78rem] font-medium leading-relaxed text-[#7c2b22]">
              Authors must not upload confidential, proprietary, unpublished company information, trade secrets,
              regulated information, or data that they are not authorized to disclose.
            </div>
            <div className="mt-4">
              <Field label="Research context" required error={errors.researchContext}>
                <div id="researchContext" className="grid gap-1.5 sm:grid-cols-2">
                  {RESEARCH_CONTEXTS.map((c) => (
                    <label key={c} className={`flex cursor-pointer items-center gap-2 border px-3 py-2 text-[0.8rem] transition-colors ${form.researchContext === c ? "border-uvdeep bg-uvglow/40 text-ink" : "border-line bg-white text-inksoft hover:border-navy"}`}>
                      <input type="radio" name="researchContext" checked={form.researchContext === c} onChange={() => up({ researchContext: c as ResearchContext })} className="accent-[#467f26]" />
                      {c}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { k: "original" as const, t: "This work is original." },
                { k: "photo" as const, t: "I confirm that this TLC image is an original photograph obtained from my laboratory work and that I have the right to submit it for publication." },
                { k: "accurate" as const, t: "The information submitted is accurate to the best of my knowledge." },
                { k: "permission" as const, t: "I have permission to submit this work." },
                { k: "confidentiality" as const, t: "The submission does not knowingly contain confidential proprietary information." },
                { k: "scheme" as const, t: "The reaction scheme and description are my own or appropriately cited." },
              ].map((d) => (
                <label key={d.k} className={`flex cursor-pointer items-start gap-2.5 border px-3 py-2.5 ${errors[`decl-${d.k}`] ? "border-[#ecc4be] bg-[#faece9]" : "border-line bg-white"}`}>
                  <input type="checkbox" className="mt-0.5 accent-[#467f26]" checked={form.declarations[d.k]} onChange={(e) => up({ declarations: { ...form.declarations, [d.k]: e.target.checked } })} />
                  <span className="text-[0.8rem] leading-relaxed text-ink">{d.t}</span>
                </label>
              ))}
              {errors["decl-original"] && <p className="text-[0.72rem] font-medium text-[#a33327]">All six declarations must be confirmed to submit.</p>}
            </div>
          </Section>

          {/* N — Preview */}
          <Section code="N" title="One-page preview" id="preview">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <PageGauge pct={pct} />
              <div className="flex gap-2">
                <Btn variant="outline" onClick={() => setPreviewOpen(true)}>Open full preview</Btn>
              </div>
            </div>
            {pct > 100 && (
              <div className="mt-3 flex items-start gap-2.5 border border-[#ecc4be] bg-[#faece9] px-3.5 py-2.5 text-[0.78rem] font-medium text-[#7c2b22]">
                <IAlert size={15} className="mt-0.5 shrink-0" />
                Content exceeds one-page limit. Editors may override this only if scientifically justified — consider shortening the reaction description or story.
              </div>
            )}
          </Section>

          {/* O — Final submission */}
          {!locked && (
            <section id="sec-final" className="scroll-mt-28 border-2 border-ink bg-navydeep p-6 text-[#f2f4f0] shadow-[8px_8px_0_rgba(16,35,59,0.15)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
                <div>
                  <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.22em] text-uv">Final step</p>
                  <h2 className="mt-1 font-display text-2xl font-black">Submit to TLC Journal</h2>
                </div>
                <span className="border border-uv/50 bg-uv/10 px-3 py-1.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.12em] text-uv">
                  {inRevision ? `Will record revision R${form.revisionNumber + 1}` : `ID on submit: ${form.submissionId ?? nextSubmissionId()}`}
                </span>
              </div>

              {inRevision && (
                <div className="mt-5">
                  <label className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9db1c7]">Summary of changes in this revision *</label>
                  <textarea
                    rows={2}
                    className="mt-2 w-full resize-y rounded-[4px] border border-white/20 bg-white/10 px-3 py-2.5 text-[0.9rem] text-white placeholder:text-[#7a90a8] focus:border-uv focus:outline-none"
                    placeholder="e.g. Clarified the mobile phase composition; identified Lane 4 as the co-spot."
                    value={revisionSummary}
                    onChange={(e) => setRevisionSummary(e.target.value)}
                  />
                </div>
              )}

              <div className="mt-5">
                <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9db1c7]">Confirmation checklist — all nine required</p>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {FINAL_CHECKLIST.map((c, i) => (
                    <label key={i} className={`flex cursor-pointer items-start gap-2.5 border px-3 py-2.5 transition-colors ${finalChecks[i] ? "border-uv/60 bg-uv/10" : "border-white/15 bg-white/5 hover:border-white/40"}`}>
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-[#7cc24a]"
                        checked={!!finalChecks[i]}
                        onChange={(e) => setFinalChecks((f) => ({ ...f, [i]: e.target.checked }))}
                      />
                      <span className="text-[0.78rem] leading-relaxed text-[#dbe4ee]">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col items-stretch gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center">
                <p className="flex-1 text-[0.75rem] leading-relaxed text-[#9db1c7]">
                  On submission, the editorial office is notified immediately. Your submission enters
                  <strong className="text-white"> technical screening</strong>; you will receive email updates for every decision.
                </p>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="border-2 border-uv bg-uv px-8 py-4 font-mono text-[0.8rem] font-bold uppercase tracking-[0.16em] text-navydeep transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(124,194,74,0.8)]"
                >
                  {inRevision ? "Resubmit revision" : "Submit to TLC Journal"}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* sticky submit bar */}
      {locked ? (
        <div className="fixed inset-x-0 bottom-0 z-[50] border-t-2 border-ink bg-sheet/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-inksoft">
              Read-only — status: <strong className="text-navy">{form.status.replace("_", " ")}</strong>
            </span>
            <div className="ml-auto flex gap-2">
              <Btn variant="ghost" onClick={() => navigate("/dashboard")}>Back to dashboard</Btn>
              <Btn variant="outline" onClick={() => setPreviewOpen(true)}>View A4 preview</Btn>
            </div>
          </div>
        </div>
      ) : (
      <div className="fixed inset-x-0 bottom-0 z-[50] border-t-2 border-ink bg-sheet/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="w-44"><PageGauge pct={pct} compact /></div>
          <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.1em] text-inkfaint md:block">
            {Object.keys(errors).length > 0 ? `${Object.keys(errors).length} issue(s) flagged` : "Form looks complete"}
          </span>
          <div className="ml-auto flex gap-2">
            <Btn variant="ghost" onClick={onSaveDraft}><IDownload size={14} className="rotate-180" /> Save draft</Btn>
            <Btn variant="accent" size="lg" onClick={() => {
              const e = validate();
              setErrors(e);
              if (Object.keys(e).length > 0) {
                toast(`${Object.keys(e).length} issue(s) need attention — see highlighted fields.`, "bad");
                document.getElementById(Object.keys(e)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
              }
              setConfirmOpen(true);
            }}>
              {inRevision ? "Resubmit revision" : "Submit for review"} <IChevron size={14} />
            </Btn>
          </div>
        </div>
      </div>
      )}

      {/* preview modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} wide>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">One-A4-page preview</h3>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-inkfaint">
              Exactly the layout editors and readers will see
            </p>
          </div>
          <div className="w-52"><PageGauge pct={pct} compact /></div>
        </div>
        <div className="max-h-[72vh] overflow-y-auto bg-[#dfe3e8] p-5 scrollbar-slim">
          <div className="mx-auto max-w-[794px] border border-line shadow-xl">
            <ArticleSheet s={{ ...form, pageEstimate: pct }} compact />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <Btn variant="ghost" onClick={() => setPreviewOpen(false)}>Close</Btn>
          <Btn onClick={onSaveDraft}>Save draft</Btn>
        </div>
      </Modal>

      {/* confirm modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="px-6 py-5">
          <h3 className="font-display text-xl font-bold text-ink">
            {inRevision ? "Resubmit this revised contribution for editorial review?" : "Are you ready to submit this TLC contribution for editorial review?"}
          </h3>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-inksoft">
            {inRevision
              ? `Your revision will be recorded as Version R${form.revisionNumber + 1} and returned to the editorial queue. Previous versions and the original files are preserved.`
              : <>Your submission enters the editorial workflow: <strong className="text-ink">Technical Check → Scientific Review → Decision</strong>. You will be notified by email at every stage. The submission identifier <strong className="font-mono text-navy">{form.submissionId ?? nextSubmissionId()}</strong> is generated immediately; the article identifier ({ID_PREFIX}-2026-xxxxx) is assigned upon acceptance.</>}
          </p>
          <ul className="mt-4 space-y-1.5 text-[0.8rem] text-ink">
            {["Original TLC photograph attached", "Lane assignments defined", "Visualization sequence reported", "All declarations confirmed", "Final nine-point checklist confirmed"].map((t) => (
              <li key={t} className="flex items-center gap-2"><ICheck size={14} className="text-uvdeep" /> {t}</li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Btn>
            <Btn variant="accent" onClick={doSubmit}>{inRevision ? "Resubmit revision" : "Submit"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );

  /* ---------------- field helpers ---------------- */
  function upAuthor(id: string, patch: Partial<AuthorInfo>) {
    up({ authors: form.authors.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  }
  function upMobile(id: string, patch: Partial<MobilePhaseEntry>) {
    up({ mobilePhase: form.mobilePhase.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  }
  function upLane(id: string, patch: Partial<Lane>) {
    up({ lanes: form.lanes.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  }
  function moveLane(i: number, dir: -1 | 1) {
    const arr = [...form.lanes];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    up({ lanes: arr });
  }
  function upViz(id: string, patch: Partial<VisualizationStep>) {
    up({ visualization: form.visualization.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
  }
  function moveViz(i: number, dir: -1 | 1) {
    const arr = [...form.visualization];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    up({ visualization: arr });
  }
  function upInterpretation(patch: Partial<Submission["interpretation"]>) {
    up({ interpretation: { ...form.interpretation, ...patch } });
  }
  function upRf(id: string, patch: Partial<{ label: string; value: number | null }>) {
    upInterpretation({ rfValues: form.interpretation.rfValues.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  }
}

/* ============================ sub-components ============================ */

function Section({ code, title, id, children }: { code: string; title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={`sec-${id}`} className="scroll-mt-28 border border-line bg-sheet p-5 shadow-[0_10px_30px_-24px_rgba(16,35,59,0.5)] sm:p-6">
      <div className="mb-4 flex items-center gap-3 border-b border-line pb-3">
        <span className="grid h-8 w-8 place-items-center bg-ink font-mono text-[0.8rem] font-bold text-uvglow">{code}</span>
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function IconBtn({ children, onClick, disabled, title, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center border text-[0.8rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? "border-[#ecc4be] text-[#a33327] hover:bg-[#faece9]" : "border-line text-navy hover:bg-sky"
      }`}
    >
      {children}
    </button>
  );
}

function SelectPills({ id, options, value, onChange }: { id: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div id={id} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`border px-3 py-1.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] transition-colors ${
            value === o ? "border-navy bg-navy text-[#f2f4f0]" : "border-line bg-white text-inksoft hover:border-navy hover:text-navy"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function RfCalculator({ onApply }: { onApply: (label: string, rf: number) => void }) {
  const [spot, setSpot] = useState("");
  const [front, setFront] = useState("");
  const [label, setLabel] = useState("Product");
  const s = parseFloat(spot);
  const f = parseFloat(front);
  const valid = !Number.isNaN(s) && !Number.isNaN(f) && f > 0 && s >= 0 && s <= f;
  const rf = valid ? s / f : null;
  return (
    <div className="h-fit border-2 border-dashed border-[#b9c4ce] bg-paper p-4">
      <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-navy">Rf calculator</p>
      <p className="mt-1 font-mono text-[0.62rem] text-inkfaint">Rf = distance of spot ÷ distance of solvent front</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input className="field-input" placeholder="Spot (cm)" inputMode="decimal" value={spot} onChange={(e) => setSpot(e.target.value)} />
        <input className="field-input" placeholder="Front (cm)" inputMode="decimal" value={front} onChange={(e) => setFront(e.target.value)} />
      </div>
      <input className="field-input mt-2" placeholder="Spot label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <div className="mt-3 flex items-center justify-between">
        <span className="font-display text-2xl font-black tabular text-navy">Rf = {rf !== null ? rf.toFixed(2) : "—"}</span>
        <Btn size="sm" variant="outline" disabled={rf === null} onClick={() => rf !== null && onApply(label || "Spot", Number(rf.toFixed(2)))}>
          Add to table
        </Btn>
      </div>
    </div>
  );
}

/* ============================ image dropzone ============================ */

function ImageDrop({
  value, fileName, onChange, accept, formats, tall, rotate = 0, onRotate, id,
}: {
  value: string;
  fileName: string;
  onChange: (dataUrl: string, name: string) => void;
  accept: string;
  formats: string;
  tall?: boolean;
  rotate?: number;
  onRotate?: (deg: number) => void;
  id?: string;
}) {
  const { toast } = useStore();
  const [drag, setDrag] = useState(false);
  const [meta, setMeta] = useState<{ w: number; h: number; kb: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast("Only image files are accepted (executable and other uploads are blocked).", "bad");
        return;
      }
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        toast(`File exceeds the ${MAX_UPLOAD_MB} MB limit.`, "bad");
        return;
      }
      const fr = new FileReader();
      fr.onload = () => {
        const data = String(fr.result);
        const kb = Math.round(file.size / 1024);
        const img = new Image();
        img.onload = () => setMeta({ w: img.naturalWidth, h: img.naturalHeight, kb });
        img.src = data;
        onChange(data, file.name);
        toast(`Original preserved — ${file.name} (${kb} KB).`, "ok");
      };
      fr.readAsDataURL(file);
    },
    [onChange, toast],
  );

  return (
    <div id={id}>
      {!value ? (
        <div
          className={`grid cursor-pointer place-items-center border-2 border-dashed px-6 text-center transition-colors ${tall ? "py-12" : "py-9"} ${
            drag ? "border-uvdeep bg-uvglow/40" : "border-[#b9c4ce] bg-white hover:border-navy"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onPaste={(e) => {
            const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
            const f = item?.getAsFile();
            if (f) handleFile(f);
          }}
          tabIndex={0}
        >
          <IUpload size={26} className="text-inkfaint" />
          <p className="mt-2 text-[0.85rem] font-semibold text-ink">Drag & drop, click to browse, or paste an image</p>
          <p className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-inkfaint">{formats} · max {MAX_UPLOAD_MB} MB</p>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }} />
        </div>
      ) : (
        <div className="border border-line bg-white p-3">
          <div className={`flex items-start justify-center overflow-hidden bg-[#101608] ${tall ? "max-h-[420px]" : "max-h-64"}`}>
            <img
              src={value}
              alt="Uploaded preview"
              className="max-h-[400px] object-contain transition-transform duration-300"
              style={{ transform: `rotate(${rotate}deg)`, maxHeight: tall ? 396 : 240 }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="mr-auto font-mono text-[0.66rem] text-inksoft">
              {fileName || "image"}{meta ? ` · ${meta.w}×${meta.h}px · ${meta.kb} KB` : ""}
            </span>
            {onRotate && (
              <Btn variant="ghost" size="sm" onClick={() => onRotate((rotate + 90) % 360)}><IRotate size={13} /> Rotate</Btn>
            )}
            <Btn variant="ghost" size="sm" onClick={() => inputRef.current?.click()}><IUpload size={13} /> Replace</Btn>
            <Btn variant="danger" size="sm" onClick={() => { onChange("", ""); setMeta(null); }}><ITrash size={13} /> Remove</Btn>
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }} />
          </div>
          {meta && (meta.w < 500 || meta.w / meta.h > 4) && (
            <p className="mt-2 flex items-center gap-1.5 text-[0.7rem] font-medium text-[#8a5a12]">
              <IAlert size={12} /> Quality check: resolution looks low for publication — consider re-photographing closer to the plate.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
