import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ArticleStatus, ReviewCriterionValue, Submission } from "../types";
import { canSeeSubmission, hasRole, isAuthorOf, useStore } from "../store/AppStore";
import ArticleSheet from "../components/ArticleSheet";
import {
  Btn, EmptyState, IAlert, ICheck, IChevron, IDownload, IEdit, IUpload, IX, Modal,
  StatusBadge, Tag,
} from "../components/ui";
import {
  MAX_UPLOAD_MB, PRODUCTION_ITEMS, REVIEW_CRITERIA, REVIEW_RECOMMENDATIONS,
  TECH_RETURN_REASONS, TECH_SCREEN_ITEMS, WITHDRAW_REASONS,
} from "../data/constants";

export default function SubmissionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { submissions, currentUser } = store;
  const s = submissions.find((x) => x.id === id);

  const [tab, setTab] = useState<"manuscript" | "files" | "review" | "history">("manuscript");
  const [sheetView, setSheetView] = useState(false);

  if (!currentUser || !s) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-black text-ink">Submission not available</h1>
        <p className="mt-3 text-[0.9rem] text-inksoft">Sign in to open this submission, or check that the link is correct.</p>
        <Link to="/auth?next=/dashboard" className="mt-6 inline-block border border-uvdeep bg-uvdeep px-6 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#f5f8ef]">Sign in</Link>
      </div>
    );
  }

  if (!canSeeSubmission(currentUser, s)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#a33327]">Access restricted</p>
        <h1 className="mt-3 font-display text-3xl font-black text-ink">This manuscript is not assigned to you</h1>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-inksoft">
          Authors can only view their own submissions; reviewers can only view manuscripts assigned to them.
          Contact the editorial office if you believe this is an error.
        </p>
        <button onClick={() => navigate("/dashboard")} className="mt-6 border border-navy px-6 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-navy hover:bg-navy hover:text-white">
          Back to dashboard
        </button>
      </div>
    );
  }

  const isStaff = hasRole(currentUser.role, ["admin", "editor"]);
  const isReviewer = currentUser.role === "reviewer";
  const isAuthor = isAuthorOf(currentUser, s);
  const ref = s.submissionId ?? s.articleId ?? s.id.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* header */}
      <div className="border-b-2 border-ink bg-sheet">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.7rem] font-bold tracking-[0.08em] text-uvdeep">{ref}</span>
                <StatusBadge status={s.status} pulse={["submitted", "editorial_review", "resubmitted"].includes(s.status)} />
                <Tag>R{s.revisionNumber}</Tag>
                {s.revisionType && s.status === "revision_required" && (
                  <Tag tone={s.revisionType === "minor" ? "amber" : "red"}>{s.revisionType} revision</Tag>
                )}
                {s.articleId && <Tag tone="navy">{s.articleId}</Tag>}
              </div>
              <h1 className="mt-1.5 font-display text-2xl font-black tracking-tight text-ink sm:text-3xl">{s.title || "Untitled submission"}</h1>
              <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-inkfaint">
                {s.authors.map((a) => a.fullName).join(", ")} · submitted {s.submittedAt || "—"} · updated {s.updatedAt || s.createdAt}
              </p>
            </div>
            <div className="flex gap-2">
              {isAuthor && s.status === "draft" && (
                <Link to={`/submit/${s.id}`} className="border border-navy px-4 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-navy hover:bg-navy hover:text-white"><span className="flex items-center gap-1.5"><IEdit size={13} /> Edit draft</span></Link>
              )}
              {s.articleId && ["accepted", "production", "proof_ready", "published"].includes(s.status) && (
                <Link to={`/article/${s.articleId}`} className="border border-navy px-4 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-navy hover:bg-navy hover:text-white">Article page</Link>
              )}
              <button onClick={() => navigate("/dashboard")} className="border border-line px-4 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-inksoft hover:border-navy hover:text-navy">Dashboard</button>
            </div>
          </div>
        </div>
      </div>

      {/* context banners */}
      <div className="mx-auto max-w-7xl space-y-4 px-4 pt-6 sm:px-6">
        {s.withdrawn && (
          <div className="border-2 border-[#a33327] bg-[#faece9] px-4 py-3">
            <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#7c2b22]">Article withdrawn</p>
            <p className="mt-1 text-[0.82rem] text-[#7c2b22]">
              {s.withdrawn.reason} — withdrawn by {s.withdrawn.by} on {s.withdrawn.date}. The scientific record is retained in the archive and is never erased.
            </p>
          </div>
        )}
        {(isAuthor || isReviewer) && (s.status === "revision_required" || s.status === "technical_revision") && (
          <RevisionRequestPanel s={s} />
        )}
        {isAuthor && s.status === "proof_ready" && s.proofRequested && !s.authorProofApproved && (
          <AuthorProofPanel s={s} />
        )}
      </div>

      {/* tabs */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap gap-1 border-b border-line">
          {(
            [
              ["manuscript", "Manuscript"],
              ["files", "Original Files"],
              ["review", isStaff || isReviewer ? "Review & Comments" : "Comments"],
              ["history", "History & Audit"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`border border-b-0 px-4 py-2.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] transition-colors ${
                tab === k ? "border-line bg-sheet text-navy" : "border-transparent text-inkfaint hover:text-navy"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* body */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {tab === "manuscript" && <ManuscriptTab s={s} sheetView={sheetView} setSheetView={setSheetView} />}
          {tab === "files" && <FilesTab s={s} canUpload={isAuthor && ["revision_required", "technical_revision", "draft"].includes(s.status)} />}
          {tab === "review" && <ReviewTab s={s} isStaff={isStaff} isReviewer={isReviewer} isAuthor={isAuthor} />}
          {tab === "history" && <HistoryTab s={s} isStaff={isStaff} />}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <InfoCard s={s} isStaff={isStaff} />
          <ActionPanel s={s} isStaff={isStaff} isAuthor={isAuthor} />
        </aside>
      </div>
    </div>
  );
}

/* ============================ manuscript tab ============================ */

function ManuscriptTab({ s, sheetView, setSheetView }: { s: Submission; sheetView: boolean; setSheetView: (v: boolean) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border border-line bg-sheet px-4 py-2.5">
        <span className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.14em] text-navy">Scientific manuscript — full detail</span>
        <button onClick={() => setSheetView(!sheetView)} className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] text-navy underline underline-offset-2 hover:text-uvdeep">
          {sheetView ? "Show detailed view" : "Show one-page layout"}
        </button>
      </div>

      {sheetView ? (
        <div className="border border-line shadow-lg"><ArticleSheet s={s} compact /></div>
      ) : (
        <>
          <Block title="Reaction scheme">
            {s.schemeImage ? (
              <img src={s.schemeImage} alt="Reaction scheme" className="max-h-64 border border-line bg-white object-contain p-2" />
            ) : (
              <p className="italic text-inkfaint">No reaction scheme provided.</p>
            )}
          </Block>

          <Block title="Reaction description">
            <p className="whitespace-pre-wrap text-[0.88rem] leading-relaxed text-ink">{s.reactionDescription || "—"}</p>
          </Block>

          <Block title="TLC conditions">
            <dl className="grid gap-x-8 gap-y-2 text-[0.85rem] sm:grid-cols-2">
              <Row k="Stationary phase" v={s.plateType || "—"} />
              <Row k="Manufacturer" v={s.plateManufacturer || "—"} />
              <Row k="Dimensions" v={s.plateDimensions || "—"} />
              <Row k="Mobile phase" v={s.mobilePhase.length ? s.mobilePhase.map((m) => `${m.solvent} ${m.parts}`).join(" : ") : "—"} />
              <Row k="Chamber" v={s.chamberCondition || "—"} />
              <Row k="Spotting" v={s.spottingNotes || "—"} />
            </dl>
          </Block>

          <Block title="Original TLC photograph">
            {s.tlcImage ? (
              <div className="border border-line bg-white p-3">
                <img src={s.tlcImage} alt="Original TLC photograph" className="mx-auto max-h-[430px] object-contain" style={{ transform: `rotate(${s.rotate}deg)` }} />
                <div className="mt-3 grid gap-1 border-t border-line pt-2 sm:grid-cols-2">
                  {s.lanes.map((l, i) => (
                    <p key={l.id} className="font-mono text-[0.66rem] text-inksoft">
                      <span className="mr-1.5 inline-grid h-4 w-4 place-items-center bg-navy text-[0.58rem] font-bold text-white">{i + 1}</span>
                      {l.label}{l.sampleType ? ` — ${l.sampleType}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="italic text-inkfaint">No TLC photograph uploaded.</p>
            )}
          </Block>

          <Block title="Visualization sequence">
            {s.visualization.length === 0 ? (
              <p className="italic text-inkfaint">No visualization reported.</p>
            ) : (
              <ol className="space-y-2">
                {s.visualization.map((v, i) => (
                  <li key={v.id} className="flex gap-3 border border-line bg-white px-3 py-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center bg-uvdeep font-mono text-[0.66rem] font-bold text-white">{i + 1}</span>
                    <div>
                      <p className="text-[0.85rem] font-semibold text-ink">{v.method}</p>
                      {v.note && <p className="text-[0.78rem] text-inksoft">{v.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Block>

          <Block title="TLC interpretation">
            <dl className="grid gap-x-8 gap-y-2 text-[0.85rem] sm:grid-cols-2">
              <Row k="Starting material spot" v={s.interpretation.smSpot || "—"} />
              <Row k="Product spot" v={s.interpretation.productSpot || "—"} />
              <Row k="Additional spots" v={s.interpretation.additionalSpots || "—"} />
              <Row k="Reaction status" v={s.interpretation.reactionStatus || "—"} />
            </dl>
            {s.interpretation.rfValues.filter((r) => r.value !== null || r.label).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {s.interpretation.rfValues.filter((r) => r.value !== null || r.label).map((r) => (
                  <span key={r.id} className="border border-line bg-white px-2.5 py-1 font-mono text-[0.7rem] text-navy">
                    {r.label || "Spot"} · Rf {r.value !== null ? r.value.toFixed(2) : "—"}
                  </span>
                ))}
              </div>
            )}
            {s.interpretation.notes && <p className="mt-3 text-[0.82rem] italic text-inksoft">{s.interpretation.notes}</p>}
          </Block>

          <Block title="Scientific interpretation — what does the TLC tell us?">
            <p className="whitespace-pre-wrap text-[0.88rem] leading-relaxed text-ink">{s.scientificInterpretation || "—"}</p>
          </Block>

          <Block title="Key observation">
            <p className="border-l-2 border-uvdeep bg-uvglow/30 px-3 py-2 font-display text-[0.95rem] font-semibold italic text-ink">{s.keyObservation || "—"}</p>
          </Block>

          {s.tlcStory && (
            <Block title="The TLC story">
              <p className="whitespace-pre-wrap font-display text-[0.92rem] italic leading-relaxed text-inksoft">{s.tlcStory}</p>
            </Block>
          )}

          <Block title="Author information">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.78rem]">
                <thead>
                  <tr className="border-b border-line font-mono text-[0.6rem] uppercase tracking-[0.1em] text-inkfaint">
                    <th className="py-1.5 pr-3">Name</th><th className="py-1.5 pr-3">Institution</th><th className="py-1.5 pr-3">City / Country</th><th className="py-1.5 pr-3">Email</th><th className="py-1.5">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {s.authors.map((a) => (
                    <tr key={a.id} className="border-b border-line/60">
                      <td className="py-2 pr-3 font-semibold text-ink">{a.fullName}{a.degree ? `, ${a.degree}` : ""}</td>
                      <td className="py-2 pr-3 text-inksoft">{a.institution}</td>
                      <td className="py-2 pr-3 text-inksoft">{[a.city, a.country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="py-2 pr-3 font-mono text-[0.7rem] text-navy">{a.email}</td>
                      <td className="py-2">{a.corresponding ? <Tag tone="green">Corresponding</Tag> : <span className="text-inkfaint">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>
        </>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-sheet p-5">
      <h2 className="mb-3 border-b border-line pb-2 font-display text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed border-line/70 py-1">
      <dt className="font-mono text-[0.64rem] uppercase tracking-[0.08em] text-inkfaint">{k}</dt>
      <dd className="text-right font-medium text-ink">{v}</dd>
    </div>
  );
}

/* ============================ files tab ============================ */

function downloadVersion(data: string, fileName: string) {
  const a = document.createElement("a");
  if (data.startsWith("data:")) {
    a.href = data;
  } else {
    a.href = data;
    a.target = "_blank";
  }
  a.download = fileName || "original";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function VersionedUploader({ s, kind }: { s: Submission; kind: "tlc" | "scheme" }) {
  const { addFileVersion, currentUser, toast } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const versions = s.fileVersions[kind];
  const label = kind === "tlc" ? "TLC photograph" : "Reaction scheme";

  const onFile = (f: File) => {
    if (!f.type.startsWith("image/")) return toast("Only image files are accepted.", "bad");
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) return toast(`File exceeds the ${MAX_UPLOAD_MB} MB limit.`, "bad");
    const fr = new FileReader();
    fr.onload = () => addFileVersion(s.id, kind, String(fr.result), f.name, "Revised upload — previous original preserved.");
    fr.readAsDataURL(f);
  };

  return (
    <div className="border border-line bg-sheet p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-ink">Original {label}</h3>
        <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5 border border-navy px-3 py-1.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy hover:bg-navy hover:text-white">
          <IUpload size={12} /> Upload new version
        </button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      </div>
      {versions.length === 0 ? (
        <p className="mt-3 border border-dashed border-[#b9c4ce] px-3 py-4 text-center text-[0.78rem] italic text-inkfaint">
          No versioned copy on file yet. {s[kind === "tlc" ? "tlcImage" : "schemeImage"] ? "The current file was provided before versioning; the next upload starts Version 1." : ""}
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {[...versions].reverse().map((v) => (
            <li key={v.version} className="flex gap-4 border border-line bg-white p-3">
              <img src={v.data} alt={`${label} v${v.version}`} className="h-20 w-24 shrink-0 border border-line bg-[#101608] object-contain p-1" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone={v.version === versions.length ? "green" : "slate"}>Version {v.version}{v.version === versions.length ? " · current" : ""}</Tag>
                  <span className="truncate font-mono text-[0.68rem] text-inksoft">{v.fileName}</span>
                </div>
                <p className="mt-1 font-mono text-[0.62rem] text-inkfaint">{v.uploadedBy} · {v.date}{v.note ? ` · ${v.note}` : ""}</p>
              </div>
              <button onClick={() => downloadVersion(v.data, v.fileName)} className="self-center border border-line px-2.5 py-1.5 text-navy hover:bg-sky" title="Download original">
                <IDownload size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 border-l-2 border-navy bg-sky px-3 py-2 text-[0.72rem] italic text-navy">
        Originals are never overwritten — every upload is archived as a new version with uploader and date.
      </p>
      <span className="hidden">{currentUser?.name}</span>
    </div>
  );
}

function FilesTab({ s, canUpload }: { s: Submission; canUpload: boolean }) {
  return (
    <div className="space-y-5">
      {!canUpload && (
        <p className="border border-line bg-sheet px-4 py-2.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-inksoft">
          Read-only file archive {s.status === "published" ? "· published record" : ""}
        </p>
      )}
      <VersionedUploader s={s} kind="tlc" />
      <VersionedUploader s={s} kind="scheme" />
    </div>
  );
}

/* ============================ review tab ============================ */

function ReviewTab({ s, isStaff, isReviewer, isAuthor }: { s: Submission; isStaff: boolean; isReviewer: boolean; isAuthor: boolean }) {
  const store = useStore();
  const { currentUser, toggleChecklist, addComment, respondToComment, editorRespondToComment, toggleCommentResolved, submitReview } = store;
  const checklist = s.checklist;

  const canReviewForm =
    (isReviewer && s.assignedReviewerId === currentUser?.id) || isStaff;
  const showReviewForm = canReviewForm && ["editorial_review", "resubmitted"].includes(s.status);

  /* review form state */
  const [form, setForm] = useState<Record<string, string>>({});
  const [comments, setComments] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);

  /* comment composer */
  const [section, setSection] = useState("General");
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [edReplyTo, setEdReplyTo] = useState<string | null>(null);
  const [edReplyText, setEdReplyText] = useState("");

  const checklistDone = Object.keys(checklist).length; // informational
  void checklistDone;

  const submitForm = () => {
    const missing = REVIEW_CRITERIA.filter((c) => !form[c.key]);
    if (missing.length > 0) return setFormErr(`Please rate: ${missing.map((m) => m.label).join(", ")}.`);
    if (!form.recommendation) return setFormErr("Select an overall recommendation.");
    if (comments.trim().length < 10) return setFormErr("Please provide reviewer comments (a few sentences).");
    setFormErr(null);
    submitReview(s.id, {
      scientificClarity: (form.scientificClarity ?? "") as ReviewCriterionValue,
      tlcDocumentation: (form.tlcDocumentation ?? "") as ReviewCriterionValue,
      reactionDescription: (form.reactionDescription ?? "") as ReviewCriterionValue,
      interpretation: (form.interpretation ?? "") as never,
      imageQuality: (form.imageQuality ?? "") as never,
      originality: (form.originality ?? "") as never,
      practicalValue: (form.practicalValue ?? "") as never,
      recommendation: (form.recommendation ?? "") as never,
      comments: comments.trim(),
    });
    setForm({});
    setComments("");
  };

  return (
    <div className="space-y-5">
      {/* scientific review form */}
      {showReviewForm && (
        <section className="border-2 border-navy bg-sheet p-5">
          <h2 className="font-display text-xl font-bold text-ink">TLC Journal Scientific Review</h2>
          <p className="mt-1 text-[0.78rem] text-inksoft">
            Evaluating {s.submissionId ?? "this manuscript"} as {currentUser?.name} ({currentUser?.role}). The handling editor sees your recommendation and comments.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {REVIEW_CRITERIA.map((c) => (
              <div key={c.key} className="border border-line bg-white p-3">
                <p className="field-label">{c.label}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => setForm((f) => ({ ...f, [c.key]: o }))}
                      className={`border px-2.5 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.06em] transition-colors ${
                        form[c.key] === o ? "border-navy bg-navy text-white" : "border-line text-inksoft hover:border-navy hover:text-navy"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="border border-line bg-white p-3 sm:col-span-2">
              <p className="field-label">Overall recommendation</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REVIEW_RECOMMENDATIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setForm((f) => ({ ...f, recommendation: o }))}
                    className={`border px-3 py-1.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.08em] transition-colors ${
                      form.recommendation === o
                        ? o === "Accept" ? "border-uvdeep bg-uvdeep text-white"
                        : o === "Reject" ? "border-[#a33327] bg-[#a33327] text-white"
                        : "border-navy bg-navy text-white"
                        : "border-line text-inksoft hover:border-navy hover:text-navy"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea rows={4} className="field-input mt-3 resize-y" placeholder="Reviewer comments for the editor and authors…" value={comments} onChange={(e) => setComments(e.target.value)} />
          {formErr && <p className="mt-2 text-[0.75rem] font-medium text-[#a33327]">{formErr}</p>}
          <div className="mt-3 flex justify-end">
            <Btn variant="accent" onClick={submitForm}>Submit review</Btn>
          </div>
        </section>
      )}

      {/* submitted reviews */}
      {s.reviews.length > 0 && (
        <section className="border border-line bg-sheet p-5">
          <h2 className="font-display text-lg font-bold text-ink">Scientific reviews ({s.reviews.length})</h2>
          <div className="mt-3 space-y-3">
            {s.reviews.map((r) => (
              <div key={r.id} className="border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-navy">{r.reviewerName} · {r.reviewerRole} · {r.date}</span>
                  <Tag tone={r.recommendation === "Accept" ? "green" : r.recommendation === "Reject" ? "red" : "amber"}>{r.recommendation || "No recommendation"}</Tag>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[0.78rem] sm:grid-cols-2">
                  <Row k="Scientific clarity" v={r.scientificClarity || "—"} />
                  <Row k="TLC documentation" v={r.tlcDocumentation || "—"} />
                  <Row k="Reaction description" v={r.reactionDescription || "—"} />
                  <Row k="Interpretation" v={r.interpretation || "—"} />
                  <Row k="Image quality" v={r.imageQuality || "—"} />
                  <Row k="Originality" v={r.originality || "—"} />
                  <Row k="Practical value" v={r.practicalValue || "—"} />
                </dl>
                <p className="mt-3 border-l-2 border-line pl-3 text-[0.82rem] leading-relaxed text-inksoft">{r.comments}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* editorial checklist (staff) */}
      {isStaff && (
        <section className="border border-line bg-sheet p-5">
          <h2 className="font-display text-lg font-bold text-ink">Editorial checklist</h2>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {Object.keys(checklist).length === 0 && (
              <p className="text-[0.75rem] italic text-inkfaint sm:col-span-2">Checklist items appear once the editorial checklist has been started in the dashboard queue.</p>
            )}
            {CHECKLIST_DISPLAY.map((c) => (
              <li key={c.key}>
                <label className={`flex cursor-pointer items-start gap-2 border px-2.5 py-1.5 text-[0.75rem] ${checklist[c.key] ? "border-[#bfdcc4] bg-[#eef6ef]" : "border-line bg-white"}`}>
                  <input type="checkbox" className="mt-0.5 accent-[#467f26]" checked={!!checklist[c.key]} onChange={() => toggleChecklist(s.id, c.key)} />
                  <span className={checklist[c.key] ? "text-ink" : "text-inksoft"}>{c.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* comment thread */}
      <section className="border border-line bg-sheet p-5">
        <h2 className="font-display text-lg font-bold text-ink">Comments & responses ({s.comments.length})</h2>
        <div className="mt-3 space-y-3">
          {s.comments.length === 0 && <p className="border border-dashed border-[#b9c4ce] px-3 py-4 text-center text-[0.78rem] italic text-inkfaint">No comments yet.</p>}
          {s.comments.map((c) => (
            <div key={c.id} className={`border p-3 ${c.resolved ? "border-[#bfdcc4] bg-[#f2f7f2]" : "border-line bg-white"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy">{c.byName} · {c.byRole}</span>
                <div className="flex items-center gap-2">
                  <Tag tone="violet">{c.section}</Tag>
                  <span className="font-mono text-[0.6rem] text-inkfaint">{c.date}</span>
                  {(isStaff || isAuthor) && (
                    <button onClick={() => toggleCommentResolved(s.id, c.id)} className={`font-mono text-[0.6rem] font-bold uppercase tracking-[0.08em] ${c.resolved ? "text-uvdeep" : "text-inkfaint hover:text-navy"}`}>
                      {c.resolved ? "✓ Resolved" : "Mark resolved"}
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink">{c.text}</p>
              {c.authorResponse && (
                <div className="mt-2 border-l-2 border-uvdeep bg-uvglow/30 px-2.5 py-1.5">
                  <p className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.12em] text-uvdeep">Author response</p>
                  <p className="mt-0.5 text-[0.78rem] text-ink">{c.authorResponse}</p>
                </div>
              )}
              {c.editorResponse && (
                <div className="mt-2 border-l-2 border-navy bg-sky px-2.5 py-1.5">
                  <p className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.12em] text-navy">Editor response</p>
                  <p className="mt-0.5 text-[0.78rem] text-ink">{c.editorResponse}</p>
                </div>
              )}
              {isAuthor && !c.authorResponse && c.byRole !== "author" && (
                replyTo === c.id ? (
                  <div className="mt-2">
                    <textarea rows={2} className="field-input" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Your response to the editor…" />
                    <div className="mt-1.5 flex gap-2">
                      <Btn size="sm" variant="accent" onClick={() => { if (replyText.trim()) { respondToComment(s.id, c.id, replyText.trim()); setReplyTo(null); setReplyText(""); } }}>Send</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <button className="mt-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy hover:underline" onClick={() => { setReplyTo(c.id); setReplyText(""); }}>Respond as author</button>
                )
              )}
              {isStaff && !c.editorResponse && c.byRole === "author" && (
                edReplyTo === c.id ? (
                  <div className="mt-2">
                    <textarea rows={2} className="field-input" value={edReplyText} onChange={(e) => setEdReplyText(e.target.value)} placeholder="Editor response…" />
                    <div className="mt-1.5 flex gap-2">
                      <Btn size="sm" onClick={() => { if (edReplyText.trim()) { editorRespondToComment(s.id, c.id, edReplyText.trim()); setEdReplyTo(null); setEdReplyText(""); } }}>Send</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => setEdReplyTo(null)}>Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <button className="mt-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy hover:underline" onClick={() => { setEdReplyTo(c.id); setEdReplyText(""); }}>Respond as editor</button>
                )
              )}
            </div>
          ))}
        </div>

        {(isStaff || isAuthor) && (
          <div className="mt-4 border border-line bg-paper p-3">
            <div className="flex flex-wrap gap-2">
              <select className="field-input w-52" value={section} onChange={(e) => setSection(e.target.value)}>
                {["General", "Article Information", "Reaction Scheme", "Reaction Description", "TLC Conditions", "Lanes", "TLC Photograph", "Visualization", "Interpretation", "Final proof"].map((x) => <option key={x}>{x}</option>)}
              </select>
              <textarea rows={2} className="field-input min-w-[200px] flex-1" placeholder={isAuthor ? "Write to the editorial office…" : 'e.g. "Please clarify the mobile-phase ratio."'} value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <Btn size="sm" className="mt-2" disabled={!text.trim()} onClick={() => { addComment(s.id, section, text.trim()); setText(""); }}>Add comment</Btn>
          </div>
        )}
      </section>
    </div>
  );
}

const CHECKLIST_DISPLAY = [
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

/* ============================ history tab ============================ */

function HistoryTab({ s, isStaff }: { s: Submission; isStaff: boolean }) {
  const { auditLog } = useStore();
  const events = auditLog.filter((a) => a.submissionId === s.id).reverse();
  return (
    <div className="space-y-5">
      {/* status timeline */}
      <section className="border border-line bg-sheet p-5">
        <h2 className="font-display text-lg font-bold text-ink">Workflow timeline</h2>
        <ol className="relative ml-3 mt-4 space-y-5 border-l-2 border-line pl-6">
          {s.history.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-uvdeep bg-sheet">
                <ICheck size={9} className="text-uvdeep" strokeWidth={3} />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={h.status} />
                <span className="font-mono text-[0.62rem] text-inkfaint">{h.date} · {h.by}</span>
              </div>
              {h.note && <p className="mt-1 text-[0.8rem] italic text-inksoft">{h.note}</p>}
            </li>
          ))}
        </ol>
      </section>

      {/* revision history (§20) */}
      <section className="border border-line bg-sheet p-5">
        <h2 className="font-display text-lg font-bold text-ink">Revision history</h2>
        {s.revisions.length === 0 ? (
          <p className="mt-3 border border-dashed border-[#b9c4ce] px-3 py-4 text-center text-[0.78rem] italic text-inkfaint">
            No revisions yet — this is Version 1 (original submission).
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            <li className="flex items-start gap-3 border border-line bg-white p-3">
              <Tag tone="navy">Version 1</Tag>
              <div>
                <p className="text-[0.8rem] font-semibold text-ink">Original submission</p>
                <p className="font-mono text-[0.62rem] text-inkfaint">{s.submittedAt || s.createdAt} · {s.authors[0]?.fullName ?? "—"}</p>
              </div>
            </li>
            {s.revisions.map((r) => (
              <li key={r.version} className="flex items-start gap-3 border border-line bg-white p-3">
                <Tag tone="blue">Version {r.version}</Tag>
                <div className="min-w-0">
                  <p className="text-[0.8rem] font-semibold text-ink">{r.changes}</p>
                  <p className="font-mono text-[0.62rem] text-inkfaint">{r.date} · uploaded by {r.by}</p>
                  {r.files.length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-1">
                      {r.files.map((f) => <span key={f} className="bg-paper px-1.5 py-0.5 font-mono text-[0.6rem] text-inksoft">{f}</span>)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[0.7rem] italic text-inkfaint">Old versions are never deleted — the complete file and decision trail is preserved.</p>
      </section>

      {/* audit log */}
      {isStaff && (
        <section className="border border-line bg-sheet p-5">
          <h2 className="font-display text-lg font-bold text-ink">Audit log</h2>
          {events.length === 0 ? (
            <p className="mt-3 text-[0.78rem] italic text-inkfaint">No audited events recorded yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[0.75rem]">
                <thead>
                  <tr className="border-b border-line font-mono text-[0.58rem] uppercase tracking-[0.1em] text-inkfaint">
                    <th className="py-1.5 pr-3">When</th><th className="py-1.5 pr-3">User</th><th className="py-1.5 pr-3">Action</th><th className="py-1.5 pr-3">Status change</th><th className="py-1.5">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-b border-line/60 align-top">
                      <td className="py-2 pr-3 font-mono text-[0.66rem] whitespace-nowrap text-inksoft">{e.date}</td>
                      <td className="py-2 pr-3 font-medium text-ink">{e.user}</td>
                      <td className="py-2 pr-3 text-ink">{e.action}</td>
                      <td className="py-2 pr-3 font-mono text-[0.64rem] text-navy">
                        {e.prevStatus ? `${e.prevStatus} → ` : ""}{e.newStatus ?? "—"}
                      </td>
                      <td className="py-2 text-inksoft">{e.comment ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ============================ right rail ============================ */

function InfoCard({ s, isStaff }: { s: Submission; isStaff: boolean }) {
  const { users, assignEditor, assignReviewer, currentUser } = useStore();
  const editors = users.filter((u) => u.role === "editor" || u.role === "admin");
  const reviewers = users.filter((u) => u.role === "reviewer" || u.role === "editor" || u.role === "admin");
  return (
    <div className="border border-line bg-sheet p-4">
      <h3 className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.16em] text-navy">Submission information</h3>
      <dl className="mt-3 space-y-2 text-[0.8rem]">
        <Row k="Submission ID" v={s.submissionId ?? "— (draft)"} />
        <Row k="Article ID" v={s.articleId ?? "Assigned on acceptance"} />
        <Row k="Status" v={s.status.replace(/_/g, " ")} />
        <Row k="Submitted" v={s.submittedAt || "—"} />
        <Row k="Last updated" v={s.updatedAt || s.createdAt} />
        <Row k="Revision" v={`R${s.revisionNumber}${s.revisionType ? ` · ${s.revisionType}` : ""}`} />
        <Row k="Est. length" v={`${s.pageEstimate}% of A4`} />
      </dl>
      {isStaff && (
        <div className="mt-4 space-y-2 border-t border-line pt-3">
          <label className="field-label block">Handling editor</label>
          <select className="field-input" value={s.assignedEditorId ?? ""} onChange={(e) => e.target.value && assignEditor(s.id, e.target.value)}>
            <option value="">Unassigned</option>
            {editors.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <label className="field-label block">Reviewer</label>
          <select className="field-input" value={s.assignedReviewerId ?? ""} onChange={(e) => e.target.value && assignReviewer(s.id, e.target.value)}>
            <option value="">Unassigned</option>
            {reviewers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
          <span className="hidden">{currentUser?.id}</span>
        </div>
      )}
      {s.decisionNote && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="field-label">Latest decision</p>
          <p className="mt-1 border-l-2 border-navy bg-sky px-2.5 py-1.5 text-[0.78rem] italic leading-relaxed text-navy">{s.decisionNote}</p>
        </div>
      )}
    </div>
  );
}

/* ============================ action panel ============================ */

function ActionPanel({ s, isStaff, isAuthor }: { s: Submission; isStaff: boolean; isAuthor: boolean }) {
  const store = useStore();
  const navigate = useNavigate();
  const {
    setStatus, toggleTechCheck, techCheckPass, techReturn, decide, resubmitRevision,
    enterProduction, toggleProductionItem, requestAuthorProof, publishSubmission,
    unpublishSubmission, withdraw, decideCorrection, currentUser, toast,
  } = store;

  const [techReason, setTechReason] = useState(TECH_RETURN_REASONS[0]);
  const [techComment, setTechComment] = useState("");
  const [returnTech, setReturnTech] = useState(false);
  const [decision, setDecision] = useState<"accept" | "minor" | "major" | "reject" | null>(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState(WITHDRAW_REASONS[0]);
  const [corrNote, setCorrNote] = useState<Record<string, string>>({});

  const techDone = TECH_SCREEN_ITEMS.filter((t) => s.techCheck[t.key]).length;
  const prodDone = PRODUCTION_ITEMS.filter((t) => s.productionChecklist[t.key]).length;

  /* author withdrawal allowed pre-publication; post-publication staff only */
  const canWithdraw =
    !s.withdrawn &&
    ((isAuthor && !["published", "rejected", "withdrawn"].includes(s.status)) ||
      (isStaff && ["published"].includes(s.status)));

  return (
    <div className="space-y-4">
      {/* ---- staff workflow panels ---- */}
      {isStaff && s.status === "submitted" && (
        <Panel title="Editorial intake">
          <p className="text-[0.78rem] text-inksoft">New submission received. Begin the technical screening before scientific review.</p>
          <Btn className="mt-3 w-full" onClick={() => setStatus(s.id, "technical_check", "Technical screening started.")}>Start technical check</Btn>
        </Panel>
      )}

      {isStaff && s.status === "technical_check" && (
        <Panel title="Technical screening">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-inksoft">Checklist</span>
            <span className={`font-mono text-[0.68rem] font-bold tabular ${techDone === TECH_SCREEN_ITEMS.length ? "text-uvdeep" : "text-inksoft"}`}>{techDone}/{TECH_SCREEN_ITEMS.length}</span>
          </div>
          <ul className="mt-2 space-y-1">
            {TECH_SCREEN_ITEMS.map((t) => (
              <li key={t.key}>
                <label className={`flex cursor-pointer items-start gap-2 border px-2.5 py-1.5 text-[0.72rem] ${s.techCheck[t.key] ? "border-[#bfdcc4] bg-[#eef6ef]" : "border-line bg-white"}`}>
                  <input type="checkbox" className="mt-0.5 accent-[#467f26]" checked={!!s.techCheck[t.key]} onChange={() => toggleTechCheck(s.id, t.key)} />
                  <span className={s.techCheck[t.key] ? "text-ink" : "text-inksoft"}>{t.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid gap-2">
            <Btn variant="accent" onClick={() => techCheckPass(s.id)}>Pass technical check</Btn>
            <Btn variant="danger" onClick={() => setReturnTech(!returnTech)}>Return to author</Btn>
          </div>
          {returnTech && (
            <div className="mt-3 border border-[#ecc4be] bg-[#faece9] p-3">
              <select className="field-input" value={techReason} onChange={(e) => setTechReason(e.target.value)}>
                {TECH_RETURN_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              <textarea rows={2} className="field-input mt-2" placeholder="Explain what the author must correct…" value={techComment} onChange={(e) => setTechComment(e.target.value)} />
              <Btn size="sm" variant="danger" className="mt-2" onClick={() => { techReturn(s.id, techReason, techComment.trim()); setReturnTech(false); setTechComment(""); }}>
                Request correction
              </Btn>
            </div>
          )}
        </Panel>
      )}

      {isStaff && s.status === "technical_revision" && (
        <Panel title="Awaiting author correction">
          <p className="text-[0.78rem] text-inksoft">Returned for: <strong className="text-ink">{s.techReturnReason}</strong>. The author has been notified by email.</p>
          <Btn variant="ghost" className="mt-3 w-full" onClick={() => setStatus(s.id, "technical_check", "Reopened by editor.")}>Reopen technical check</Btn>
        </Panel>
      )}

      {isStaff && ["editorial_review", "resubmitted"].includes(s.status) && (
        <Panel title="Editorial decision">
          {s.reviews.length > 0 && (
            <p className="mb-2 text-[0.75rem] text-inksoft">
              {s.reviews.length} scientific review{s.reviews.length > 1 ? "s" : ""} on file — latest recommendation:{" "}
              <strong className="text-ink">{s.reviews[s.reviews.length - 1].recommendation || "—"}</strong>.
            </p>
          )}
          <label className="field-label block">Decision comment (required)</label>
          <textarea rows={3} className="field-input mt-1 resize-y" placeholder='e.g. "Accept — a clear, well-documented monitoring plate." or "Please identify Lane 4 and resubmit."' value={decisionComment} onChange={(e) => setDecisionComment(e.target.value)} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Btn variant="accent" onClick={() => setDecision("accept")}>Accept</Btn>
            <Btn onClick={() => setDecision("minor")}>Minor revision</Btn>
            <Btn onClick={() => setDecision("major")}>Major revision</Btn>
            <Btn variant="danger" onClick={() => setDecision("reject")}>Reject</Btn>
          </div>
          {decision && (
            <div className="mt-3 border border-line bg-paper p-3">
              <p className="text-[0.78rem] font-semibold text-ink">
                Confirm: <span className="uppercase">{decision}</span> this submission?
                {decision === "accept" && " The article identifier will be assigned now."}
              </p>
              {!decisionComment.trim() && <p className="mt-1 text-[0.72rem] font-medium text-[#a33327]">A decision comment is required before the decision can be recorded.</p>}
              <div className="mt-2 flex gap-2">
                <Btn size="sm" variant={decision === "reject" ? "danger" : "accent"} disabled={!decisionComment.trim()} onClick={() => { decide(s.id, decision, decisionComment.trim()); setDecision(null); setDecisionComment(""); }}>
                  Confirm {decision}
                </Btn>
                <Btn size="sm" variant="ghost" onClick={() => setDecision(null)}>Cancel</Btn>
              </div>
            </div>
          )}
        </Panel>
      )}

      {isStaff && s.status === "revision_required" && (
        <Panel title="Awaiting author revision">
          <p className="text-[0.78rem] text-inksoft">
            A <strong className="text-ink">{s.revisionType || ""} revision</strong> was requested (R{s.revisionNumber + 1} will be the next version). The author has been notified.
          </p>
        </Panel>
      )}

      {isStaff && s.status === "accepted" && (
        <Panel title="Post-acceptance">
          <p className="text-[0.78rem] text-inksoft">Article <strong className="text-navy">{s.articleId}</strong> assigned. Move the article into production to verify the final materials.</p>
          <Btn className="mt-3 w-full" onClick={() => enterProduction(s.id)}>Move to production</Btn>
        </Panel>
      )}

      {isStaff && s.status === "production" && (
        <Panel title="Production">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-inksoft">Production checklist</span>
            <span className={`font-mono text-[0.68rem] font-bold tabular ${prodDone === PRODUCTION_ITEMS.length ? "text-uvdeep" : "text-inksoft"}`}>{prodDone}/{PRODUCTION_ITEMS.length}</span>
          </div>
          <ul className="mt-2 space-y-1">
            {PRODUCTION_ITEMS.map((t) => (
              <li key={t.key}>
                <label className={`flex cursor-pointer items-start gap-2 border px-2.5 py-1.5 text-[0.72rem] ${s.productionChecklist[t.key] ? "border-[#bfdcc4] bg-[#eef6ef]" : "border-line bg-white"}`}>
                  <input type="checkbox" className="mt-0.5 accent-[#467f26]" checked={!!s.productionChecklist[t.key]} onChange={() => toggleProductionItem(s.id, t.key)} />
                  <span className={s.productionChecklist[t.key] ? "text-ink" : "text-inksoft"}>{t.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <Btn variant="accent" className="mt-3 w-full" onClick={() => requestAuthorProof(s.id)}>Generate final proof & request author approval</Btn>
        </Panel>
      )}

      {isStaff && s.status === "proof_ready" && (
        <Panel title="Final proof">
          <ProofPreview s={s} />
          <div className="mt-3 space-y-2">
            {s.authorProofApproved ? (
              <p className="flex items-center gap-2 border border-[#bfdcc4] bg-[#eef6ef] px-3 py-2 text-[0.78rem] font-semibold text-[#2f6b41]">
                <ICheck size={14} /> Author has approved the proof.
              </p>
            ) : (
              <p className="flex items-center gap-2 border border-[#e5d2a4] bg-[#faf3e0] px-3 py-2 text-[0.78rem] font-medium text-[#6d4a0d]">
                <IAlert size={14} /> Awaiting author proof approval…
              </p>
            )}
            <Btn variant="accent" size="lg" className="w-full" onClick={() => setConfirmPublish(true)}>Publish article</Btn>
            <Btn variant="ghost" className="w-full" onClick={() => setStatus(s.id, "production", "Returned to production by editor.")}>Return to production</Btn>
          </div>
        </Panel>
      )}

      {isStaff && s.status === "published" && (
        <Panel title="Published record">
          <p className="text-[0.78rem] text-inksoft">
            Live at <Link className="font-mono text-[0.72rem] font-bold text-navy underline underline-offset-2" to={`/article/${s.articleId}`}>/article/{s.articleId}</Link> · Version {s.correctedVersion}.
          </p>
          <div className="mt-3 grid gap-2">
            <Btn variant="outline" onClick={() => navigate(`/article/${s.articleId}`)}>Open public page</Btn>
            <Btn variant="danger" onClick={() => unpublishSubmission(s.id)}>Unpublish</Btn>
          </div>
        </Panel>
      )}

      {/* corrections (staff, published) */}
      {isStaff && s.status === "published" && s.corrections.length > 0 && (
        <Panel title="Correction requests">
          <ul className="space-y-2">
            {s.corrections.map((c) => (
              <li key={c.id} className="border border-line bg-white p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.6rem] text-inkfaint">{c.requestedBy} · {c.date}</span>
                  <Tag tone={c.status === "approved" ? "green" : c.status === "rejected" ? "red" : "amber"}>{c.status}</Tag>
                </div>
                <p className="mt-1 text-[0.76rem] text-ink">{c.description}</p>
                {c.status === "pending" && (
                  <div className="mt-2">
                    <input className="field-input" placeholder="Editor note (optional)" value={corrNote[c.id] ?? ""} onChange={(e) => setCorrNote((n) => ({ ...n, [c.id]: e.target.value }))} />
                    <div className="mt-1.5 flex gap-2">
                      <Btn size="sm" variant="accent" onClick={() => decideCorrection(s.id, c.id, true, corrNote[c.id] ?? "")}>Approve & issue corrected version</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => decideCorrection(s.id, c.id, false, corrNote[c.id] ?? "")}>Reject</Btn>
                    </div>
                  </div>
                )}
                {c.status !== "pending" && c.editorNote && <p className="mt-1 text-[0.7rem] italic text-inksoft">Editor: {c.editorNote}</p>}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* ---- author revision resubmission is in the banner; nothing here ---- */}
      {isAuthor && ["editorial_review", "technical_check", "submitted"].includes(s.status) && (
        <Panel title="What happens next">
          <p className="text-[0.78rem] leading-relaxed text-inksoft">
            Your submission is with the editorial office. You will be notified by email at each stage —
            technical check, review, decision — and can follow everything on this page.
          </p>
        </Panel>
      )}

      {/* withdrawal */}
      {canWithdraw && (
        <Panel title="Withdrawal">
          <p className="text-[0.75rem] text-inksoft">
            {s.status === "published"
              ? "Published articles can only be withdrawn by the editorial office. The record stays in the archive."
              : "You may request withdrawal before publication. The submission record is retained."}
          </p>
          <Btn variant="danger" className="mt-3 w-full" onClick={() => setWithdrawOpen(true)}>Request withdrawal</Btn>
        </Panel>
      )}

      {/* modals */}
      <Modal open={confirmPublish} onClose={() => setConfirmPublish(false)}>
        <div className="px-6 py-5">
          <h3 className="font-display text-xl font-bold text-ink">Publish this article permanently to TLC Journal?</h3>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-inksoft">
            This creates the public article page at <span className="font-mono text-[0.78rem] font-bold text-navy">/article/{s.articleId}</span>,
            the one-page PDF, the citation record and the search index entry. This action is recorded in the audit log.
          </p>
          {!s.authorProofApproved && (
            <p className="mt-3 flex items-start gap-2 border border-[#e5d2a4] bg-[#faf3e0] px-3 py-2 text-[0.78rem] font-medium text-[#6d4a0d]">
              <IAlert size={14} className="mt-0.5 shrink-0" /> The author has not yet approved the final proof. Editors may override only when justified.
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setConfirmPublish(false)}>Cancel</Btn>
            <Btn variant="accent" onClick={() => { publishSubmission(s.id); setConfirmPublish(false); }}>Yes — publish</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)}>
        <div className="px-6 py-5">
          <h3 className="font-display text-xl font-bold text-ink">Request withdrawal of {s.submissionId ?? s.articleId}?</h3>
          <label className="field-label mt-4 block">Reason</label>
          <select className="field-input mt-1" value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)}>
            {WITHDRAW_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <p className="mt-3 text-[0.8rem] text-inksoft">The withdrawal, its reason and date are recorded permanently; the scientific record is never erased.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setWithdrawOpen(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => { withdraw(s.id, withdrawReason); setWithdrawOpen(false); }}>Confirm withdrawal</Btn>
          </div>
        </div>
      </Modal>

      <span className="hidden">{currentUser?.name}</span>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-ink bg-sheet p-4 shadow-[5px_5px_0_rgba(16,35,59,0.08)]">
      <h3 className="border-b border-line pb-2 font-display text-[1.05rem] font-bold text-ink">{title}</h3>
      <div className="pt-3">{children}</div>
    </div>
  );
}

function ProofPreview({ s }: { s: Submission }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between border border-line bg-paper px-3 py-2 font-mono text-[0.64rem] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy">
        Final proof — one A4 page <IChevron size={13} className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 border border-line shadow-md">
          <ArticleSheet s={s} compact />
        </div>
      )}
    </div>
  );
}

/* ============================ author banners ============================ */

function RevisionRequestPanel({ s }: { s: Submission }) {
  const store = useStore();
  const { resubmitRevision, addFileVersion, addComment, currentUser, toast } = store;
  const [changes, setChanges] = useState("");
  const [respondOpen, setRespondOpen] = useState(false);
  const [response, setResponse] = useState("");
  const tlcRef = useRef<HTMLInputElement>(null);
  const schemeRef = useRef<HTMLInputElement>(null);

  const pick = (kind: "tlc" | "scheme") => (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Only image files are accepted.", "bad");
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) return toast(`File exceeds the ${MAX_UPLOAD_MB} MB limit.`, "bad");
    const fr = new FileReader();
    fr.onload = () => addFileVersion(s.id, kind, String(fr.result), f.name, `Revised ${kind === "tlc" ? "TLC photograph" : "reaction scheme"} for R${s.revisionNumber + 1}.`);
    fr.readAsDataURL(f);
  };

  const openComments = s.comments.filter((c) => !c.resolved && c.byRole !== "author");

  return (
    <div className="border-2 border-[#a33327] bg-sheet">
      <div className="border-b border-[#ecc4be] bg-[#faece9] px-5 py-3">
        <h2 className="font-display text-lg font-bold text-[#7c2b22]">
          {s.status === "technical_revision" ? "Technical correction requested" : `Editorial revision request — ${s.revisionType === "minor" ? "minor" : "major"} revision`}
        </h2>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#a33327]">{s.submissionId} · next version will be R{s.revisionNumber + 1}</p>
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="field-label">Editor comments</p>
          {s.decisionNote && <p className="mt-1.5 border-l-2 border-navy bg-sky px-3 py-2 text-[0.84rem] italic leading-relaxed text-navy">"{s.decisionNote}"</p>}
          {openComments.length > 0 && (
            <ul className="mt-3 space-y-2">
              {openComments.map((c) => (
                <li key={c.id} className="border border-line bg-white px-3 py-2">
                  <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.1em] text-navy">{c.byName} · {c.section}</p>
                  <p className="mt-0.5 text-[0.8rem] text-ink">{c.text}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <p className="field-label">Respond to the editor (optional)</p>
            {respondOpen ? (
              <div className="mt-1.5">
                <textarea rows={2} className="field-input resize-y" value={response} onChange={(e) => setResponse(e.target.value)} placeholder="How did you address the comments?" />
                <div className="mt-1.5 flex gap-2">
                  <Btn size="sm" variant="accent" onClick={() => { if (response.trim()) { addComment(s.id, "Author response", response.trim()); setResponse(""); setRespondOpen(false); } }}>Send response</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setRespondOpen(false)}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <button className="mt-1.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-navy underline underline-offset-2" onClick={() => setRespondOpen(true)}>Write a response</button>
            )}
          </div>
        </div>
        <div className="border border-dashed border-[#b9c4ce] bg-paper p-4">
          <p className="field-label">Submit your revision</p>
          <div className="mt-2 grid gap-2">
            <Link to={`/submit/${s.id}`} className="flex items-center justify-center gap-2 border border-navy px-3 py-2.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-navy hover:bg-navy hover:text-white">
              <IEdit size={13} /> Edit submission
            </Link>
            <button onClick={() => tlcRef.current?.click()} className="flex items-center justify-center gap-2 border border-navy px-3 py-2.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-navy hover:bg-navy hover:text-white">
              <IUpload size={13} /> Upload revised TLC photograph
            </button>
            <input ref={tlcRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pick("tlc")(e.target.files?.[0]); e.target.value = ""; }} />
            <button onClick={() => schemeRef.current?.click()} className="flex items-center justify-center gap-2 border border-navy px-3 py-2.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-navy hover:bg-navy hover:text-white">
              <IUpload size={13} /> Upload revised reaction scheme
            </button>
            <input ref={schemeRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pick("scheme")(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
          <p className="mt-3 text-[0.7rem] italic text-inkfaint">Previous originals are preserved as earlier versions — nothing is overwritten.</p>
          <label className="field-label mt-3 block">Summary of changes</label>
          <textarea rows={2} className="field-input mt-1 resize-y" value={changes} onChange={(e) => setChanges(e.target.value)} placeholder="e.g. Clarified mobile phase; identified Lane 4 as co-spot." />
          <Btn variant="accent" size="lg" className="mt-3 w-full" onClick={() => resubmitRevision(s.id, changes.trim())}>
            Resubmit revision <IChevron size={14} />
          </Btn>
          <span className="hidden">{currentUser?.name}</span>
        </div>
      </div>
    </div>
  );
}

function AuthorProofPanel({ s }: { s: Submission }) {
  const { authorApproveProof, authorRequestProofCorrection } = useStore();
  const [approve, setApprove] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [note, setNote] = useState("");
  return (
    <div className="border-2 border-navy bg-sheet">
      <div className="border-b border-line bg-sky px-5 py-3">
        <h2 className="font-display text-lg font-bold text-navy">Final proof — approval required</h2>
        <p className="text-[0.75rem] text-navy/80">Your article has been accepted and typeset. Review the exact one-page version readers will see, then approve it for publication or request a correction.</p>
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="border border-line shadow-md"><ArticleSheet s={s} compact /></div>
        <div className="space-y-3 self-start">
          <label className={`flex cursor-pointer items-start gap-2.5 border px-3 py-2.5 ${approve ? "border-[#bfdcc4] bg-[#eef6ef]" : "border-line bg-white"}`}>
            <input type="checkbox" className="mt-0.5 accent-[#467f26]" checked={approve} onChange={(e) => setApprove(e.target.checked)} />
            <span className="text-[0.82rem] font-medium text-ink">I approve this proof for publication.</span>
          </label>
          <Btn variant="accent" size="lg" className="w-full" disabled={!approve} onClick={() => authorApproveProof(s.id)}>Approve proof</Btn>
          <div className="border-t border-line pt-3">
            {correct ? (
              <div>
                <textarea rows={3} className="field-input resize-y" placeholder="Describe the correction needed, e.g. 'Author 2 affiliation should read …'" value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <Btn size="sm" variant="danger" disabled={!note.trim()} onClick={() => authorRequestProofCorrection(s.id, note.trim())}>Send correction request</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setCorrect(false)}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <Btn variant="ghost" className="w-full" onClick={() => setCorrect(true)}>Request correction</Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* silence unused-import warnings for icons used only in some branches */
void IX;
void EmptyState;
const __statusGuard: ArticleStatus = "draft";
void __statusGuard;
