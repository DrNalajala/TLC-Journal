import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ArticleStatus, Submission } from "../types";
import { hasRole, useStore } from "../store/AppStore";
import ArticleSheet from "../components/ArticleSheet";
import {
  Btn, ICheck, IPlate, IX, Modal, Reveal, StatusBadge, Tag, EmptyState, IEdit, ITrash,
} from "../components/ui";
import { CHECKLIST_ITEMS, REVIEW_SECTIONS, STATUS_META } from "../data/constants";
import { downloadArticlePdf } from "../utils/pdf";

const TABS: (ArticleStatus | "all")[] = [
  "all", "draft", "submitted", "technical_check", "editorial_review",
  "revision_required", "resubmitted", "accepted", "rejected", "published",
];

export default function Dashboard() {
  const { submissions, currentUser, deleteSubmission, setStatus } = useStore();
  const [tab, setTab] = useState<ArticleStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const isStaff = hasRole(currentUser?.role, ["admin", "editor", "reviewer"]);
  const mine = useMemo(() => {
    const norm = (x: string) => x.toLowerCase().replace(/\b(dr|prof|mr|ms|mrs)\.?\s+/g, "").trim();
    return submissions
      .filter((s) => {
        if (!currentUser) return false;
        const me = norm(currentUser.name);
        return s.authors.some(
          (a) =>
            a.email.toLowerCase() === (currentUser.email ?? "").toLowerCase() ||
            (me.length > 2 && (norm(a.fullName).includes(me) || me.includes(norm(a.fullName)))),
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [submissions, currentUser]);
  const pool = useMemo(
    () => [...submissions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [submissions],
  );

  const stats = useMemo(() => {
    const by = (st: ArticleStatus) => submissions.filter((s) => s.status === st).length;
    const published = submissions.filter((s) => s.status === "published");
    const month = new Date().toISOString().slice(0, 7);
    const reviewDays: number[] = [];
    submissions.forEach((s) => {
      const sub = s.history.find((h) => h.status === "submitted");
      const acc = s.history.find((h) => h.status === "accepted");
      if (sub && acc) reviewDays.push((new Date(acc.date).getTime() - new Date(sub.date).getTime()) / 86400000);
    });
    const cats = new Map<string, number>();
    const vizs = new Map<string, number>();
    const authorsSet = new Set<string>();
    const countrySet = new Set<string>();
    published.forEach((s) => {
      cats.set(s.articleType || "Other", (cats.get(s.articleType || "Other") ?? 0) + 1);
      s.visualization.forEach((v) => vizs.set(v.method, (vizs.get(v.method) ?? 0) + 1));
      s.authors.forEach((a) => { authorsSet.add(a.fullName); if (a.country) countrySet.add(a.country); });
    });
    return {
      total: submissions.length,
      drafts: by("draft"),
      underReview: by("submitted") + by("technical_check") + by("editorial_review") + by("resubmitted"),
      revisionRequired: by("revision_required"),
      accepted: by("accepted"),
      rejected: by("rejected"),
      published: published.length,
      publishedThisMonth: published.filter((s) => s.publishedAt.startsWith(month)).length,
      avgReviewDays: reviewDays.length ? reviewDays.reduce((a, b) => a + b, 0) / reviewDays.length : 0,
      authorCount: authorsSet.size,
      countries: [...countrySet],
      categoryCounts: [...cats.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
      vizCounts: [...vizs.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    };
  }, [submissions]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-black text-ink">Sign in to access your dashboard</h1>
        <p className="mt-3 text-[0.9rem] text-inksoft">Authors track their submissions here; editors and reviewers manage the workflow.</p>
        <Link to="/auth?next=/dashboard" className="mt-6 inline-block border border-uvdeep bg-uvdeep px-6 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#f5f8ef] hover:bg-[#3a6b1f]">Sign in</Link>
      </div>
    );
  }

  const visible = isStaff ? pool : mine;
  const filtered = tab === "all" ? visible : visible.filter((s) => s.status === tab);
  const open = submissions.find((s) => s.id === openId) ?? null;

  return (
    <div className="graph-paper min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.2em] text-uvdeep">
                {isStaff ? "Editorial dashboard" : "Author dashboard"}
              </p>
              <h1 className="mt-1 font-display text-4xl font-black tracking-tight text-ink">
                Welcome, {currentUser.name.split(" ").slice(-1)[0]}
              </h1>
            </div>
            <Link to="/submit" className="border border-uvdeep bg-uvdeep px-5 py-2.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#f5f8ef] hover:bg-[#3a6b1f]">
              + New submission
            </Link>
          </div>
        </Reveal>

        {/* stats */}
        <Reveal delay={70}>
          <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4 lg:grid-cols-8">
            {[
              { l: "Total", v: stats.total },
              { l: "Drafts", v: stats.drafts },
              { l: "Under review", v: stats.underReview },
              { l: "Revision req.", v: stats.revisionRequired },
              { l: "Accepted", v: stats.accepted },
              { l: "Rejected", v: stats.rejected },
              { l: "Published", v: stats.published },
              { l: "This month", v: stats.publishedThisMonth },
            ].map((s) => (
              <div key={s.l} className="bg-sheet px-3 py-3.5 text-center">
                <div className="font-display text-[1.6rem] font-black tabular text-navy">{s.v}</div>
                <div className="mt-0.5 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-inkfaint">{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* pipeline table */}
          <Reveal delay={100}>
            <div className="border border-line bg-sheet">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h2 className="font-display text-lg font-bold text-ink">{isStaff ? "Submission pipeline" : "My submissions"}</h2>
                <span className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-inkfaint">{filtered.length} shown</span>
              </div>
              <div className="scrollbar-slim flex gap-1 overflow-x-auto border-b border-line bg-paper px-3 py-2">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`shrink-0 border px-2.5 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] transition-colors ${
                      tab === t ? "border-navy bg-navy text-white" : "border-line bg-white text-inksoft hover:border-navy"
                    }`}
                  >
                    {t === "all" ? "All" : STATUS_META[t].label}
                    <span className="ml-1.5 opacity-60">{t === "all" ? visible.length : visible.filter((s) => s.status === t).length}</span>
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState title="Nothing here" desc="No submissions match this stage of the workflow." />
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {filtered.map((s) => (
                    <li key={s.id} className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-sky/60">
                      <button onClick={() => setOpenId(s.id)} className="min-w-0 flex-1 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[0.62rem] font-bold text-uvdeep">{s.articleId ?? "—"}</span>
                          <StatusBadge status={s.status} pulse={s.status === "editorial_review" || s.status === "submitted"} />
                        </div>
                        <p className="mt-1 truncate font-display text-[0.98rem] font-bold text-ink group-hover:text-navy">{s.title || "Untitled draft"}</p>
                        <p className="mt-0.5 font-mono text-[0.62rem] text-inkfaint">
                          {s.authors[0]?.fullName ?? "—"} · updated {s.updatedAt || s.createdAt} · est. {s.pageEstimate}% A4
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {s.status === "draft" && (
                          <Link to={`/submit/${s.id}`} className="grid h-8 w-8 place-items-center border border-line text-navy hover:bg-sky" title="Edit draft"><IEdit size={14} /></Link>
                        )}
                        {s.status === "draft" && (
                          <button onClick={() => deleteSubmission(s.id)} className="grid h-8 w-8 place-items-center border border-line text-[#a33327] hover:bg-[#faece9]" title="Delete draft"><ITrash size={14} /></button>
                        )}
                        <Btn size="sm" variant="outline" onClick={() => setOpenId(s.id)}>Open</Btn>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          {/* charts + meta */}
          <div className="space-y-6">
            <Reveal delay={140}>
              <div className="border border-line bg-sheet p-4">
                <h3 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-navy">Workflow status</h3>
                <StatusDonut submissions={visible} />
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="border border-line bg-sheet p-4">
                <h3 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-navy">TLC categories (published)</h3>
                <BarList items={stats.categoryCounts} color="#1d5c9c" />
              </div>
            </Reveal>
            <Reveal delay={220}>
              <div className="border border-line bg-sheet p-4">
                <h3 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-navy">Visualization methods (published)</h3>
                <BarList items={stats.vizCounts} color="#467f26" />
              </div>
            </Reveal>
            <Reveal delay={260}>
              <div className="grid grid-cols-2 gap-px border border-line bg-line text-center">
                <div className="bg-sheet px-3 py-4">
                  <div className="font-display text-2xl font-black tabular text-navy">{stats.avgReviewDays.toFixed(1)} d</div>
                  <div className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-inkfaint">Avg. review time</div>
                </div>
                <div className="bg-sheet px-3 py-4">
                  <div className="font-display text-2xl font-black tabular text-navy">{stats.countries.length}</div>
                  <div className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-inkfaint">Countries · {stats.countries.slice(0, 3).join(", ")}{stats.countries.length > 3 ? "…" : ""}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* detail drawer */}
      {open && (
        <SubmissionDetail
          key={open.id}
          s={open}
          isStaff={isStaff}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------ detail ------------------------------ */

function SubmissionDetail({ s, isStaff, onClose }: { s: Submission; isStaff: boolean; onClose: () => void }) {
  const { currentUser, toggleChecklist, addComment, respondToComment, acceptSubmission, publishSubmission, unpublishSubmission, setStatus, nextArticleId, toast } = useStore();
  const [tab, setTab] = useState<"review" | "preview" | "timeline">("review");
  const [commentSection, setCommentSection] = useState("General");
  const [commentText, setCommentText] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const checklistDone = CHECKLIST_ITEMS.filter((c) => s.checklist[c.key]).length;
  const isAuthor = !!currentUser && s.authors.some((a) => a.email.toLowerCase() === currentUser.email.toLowerCase());

  return (
    <Modal open onClose={onClose} wide>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.66rem] font-bold text-uvdeep">{s.articleId ?? nextArticleId() + " (provisional)"}</span>
            <StatusBadge status={s.status} />
          </div>
          <h3 className="mt-1 truncate font-display text-lg font-bold text-ink">{s.title || "Untitled draft"}</h3>
        </div>
        <button onClick={onClose} className="grid h-9 w-9 place-items-center border border-line text-inksoft hover:text-ink"><IX size={16} /></button>
      </div>

      {/* tabs */}
      <div className="flex gap-1 border-b border-line bg-paper px-4 pt-2.5">
        {(["review", "preview", "timeline"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`border border-b-0 px-4 py-2 font-mono text-[0.66rem] font-bold uppercase tracking-[0.12em] ${
              tab === t ? "border-line bg-sheet text-navy" : "border-transparent text-inkfaint hover:text-navy"
            }`}>
            {t === "review" ? "Review & comments" : t === "preview" ? "Article preview" : "History"}
          </button>
        ))}
      </div>

      <div className="max-h-[62vh] overflow-y-auto p-5 scrollbar-slim">
        {tab === "review" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* checklist */}
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy">Editor checklist</h4>
                <span className={`font-mono text-[0.68rem] font-bold tabular ${checklistDone === CHECKLIST_ITEMS.length ? "text-uvdeep" : "text-inksoft"}`}>{checklistDone}/{CHECKLIST_ITEMS.length}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {CHECKLIST_ITEMS.map((c) => {
                  const on = !!s.checklist[c.key];
                  return (
                    <li key={c.key}>
                      <label className={`flex cursor-pointer items-start gap-2.5 border px-3 py-2 text-[0.78rem] transition-colors ${isStaff ? "hover:border-navy" : "cursor-default"} ${on ? "border-[#bfdcc4] bg-[#eef6ef]" : "border-line bg-white"}`}>
                        <input type="checkbox" disabled={!isStaff} className="mt-0.5 accent-[#467f26]" checked={on} onChange={() => toggleChecklist(s.id, c.key)} />
                        <span className={on ? "text-ink" : "text-inksoft"}>{c.label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* comments */}
            <div>
              <h4 className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy">Review comments ({s.comments.length})</h4>
              <div className="mt-3 space-y-3">
                {s.comments.length === 0 && (
                  <p className="border border-dashed border-[#b9c4ce] bg-white px-3 py-4 text-center text-[0.78rem] italic text-inkfaint">No comments yet.</p>
                )}
                {s.comments.map((c) => (
                  <div key={c.id} className="border border-line bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy">{c.byName} · {c.byRole}</span>
                      <span className="font-mono text-[0.6rem] text-inkfaint">{c.date}</span>
                    </div>
                    <Tag tone="violet">{c.section}</Tag>
                    <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink">{c.text}</p>
                    {c.authorResponse ? (
                      <div className="mt-2 border-l-2 border-uvdeep bg-uvglow/30 px-2.5 py-1.5">
                        <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.12em] text-uvdeep">Author response</p>
                        <p className="mt-0.5 text-[0.78rem] text-ink">{c.authorResponse}</p>
                      </div>
                    ) : isAuthor ? (
                      respondingTo === c.id ? (
                        <div className="mt-2">
                          <textarea rows={2} className="field-input" placeholder="Your response to the editor…" value={responseText} onChange={(e) => setResponseText(e.target.value)} />
                          <div className="mt-1.5 flex gap-2">
                            <Btn size="sm" variant="accent" onClick={() => {
                              if (!responseText.trim()) return;
                              respondToComment(s.id, c.id, responseText.trim());
                              setRespondingTo(null); setResponseText("");
                            }}>Send response</Btn>
                            <Btn size="sm" variant="ghost" onClick={() => setRespondingTo(null)}>Cancel</Btn>
                          </div>
                        </div>
                      ) : (
                        <button className="mt-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy hover:underline" onClick={() => { setRespondingTo(c.id); setResponseText(""); }}>
                          Respond as author
                        </button>
                      )
                    ) : null}
                  </div>
                ))}
              </div>

              {isStaff && (
                <div className="mt-4 border border-line bg-paper p-3">
                  <select className="field-input" value={commentSection} onChange={(e) => setCommentSection(e.target.value)}>
                    {REVIEW_SECTIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <textarea rows={3} className="field-input mt-2" placeholder='e.g. "Please clarify the mobile-phase ratio."' value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                  <Btn size="sm" className="mt-2" disabled={!commentText.trim()} onClick={() => { addComment(s.id, commentSection, commentText.trim()); setCommentText(""); }}>
                    Add comment
                  </Btn>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div className="mx-auto max-w-[680px] border border-line shadow-lg">
            <ArticleSheet s={s} compact />
          </div>
        )}

        {tab === "timeline" && (
          <ol className="relative ml-3 space-y-5 border-l-2 border-line pl-6">
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
        )}
      </div>

      {/* decision bar */}
      <div className="border-t-2 border-ink bg-sheet px-5 py-4">
        {isStaff ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {(s.status === "submitted" || s.status === "resubmitted") && (
                <Btn size="sm" onClick={() => { setStatus(s.id, "technical_check"); toast("Moved to technical check.", "ok"); }}>Start technical check</Btn>
              )}
              {s.status === "technical_check" && (
                <Btn size="sm" onClick={() => { setStatus(s.id, "editorial_review"); toast("Moved to editorial review.", "ok"); }}>Start editorial review</Btn>
              )}
              {(s.status === "editorial_review" || s.status === "resubmitted") && (
                <>
                  <Btn size="sm" variant="accent" onClick={() => acceptSubmission(s.id)}>Accept & assign ID</Btn>
                  <Btn size="sm" variant="danger" onClick={() => {
                    setStatus(s.id, "revision_required", decisionNote || "Revision requested by editor.");
                    toast("Revision requested.", "warn");
                  }}>Request revision</Btn>
                  <Btn size="sm" variant="danger" onClick={() => {
                    setStatus(s.id, "rejected", decisionNote || "Not suitable for publication.");
                    toast("Submission rejected.", "bad");
                  }}>Reject</Btn>
                </>
              )}
              {s.status === "revision_required" && (
                <Btn size="sm" onClick={() => { setStatus(s.id, "editorial_review", "Reopened by editor."); toast("Reopened for review.", "ok"); }}>Reopen review</Btn>
              )}
              {s.status === "accepted" && (
                <Btn size="sm" variant="accent" onClick={() => publishSubmission(s.id)}>Publish now</Btn>
              )}
              {s.status === "published" && (
                <>
                  <Btn size="sm" variant="danger" onClick={() => unpublishSubmission(s.id)}>Unpublish</Btn>
                  <Btn size="sm" variant="outline" onClick={async () => { await downloadArticlePdf(s); toast("PDF generated.", "ok"); }}>Generate PDF</Btn>
                </>
              )}
              {s.articleId && (
                <Link to={`/article/${s.articleId}`} className="ml-auto font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-navy hover:underline">
                  {s.status === "published" ? "View public page →" : "Article page (unlisted)"}
                </Link>
              )}
            </div>
            {(s.status === "editorial_review" || s.status === "resubmitted") && (
              <input className="field-input mt-2.5" placeholder="Decision note (optional) — e.g. 'Please explain the additional spot.'" value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} />
            )}
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[0.8rem] text-inksoft">
              Current stage: <strong className="text-ink">{STATUS_META[s.status].label}</strong>
              {s.status === "revision_required" && " — address the review comments, edit your submission and resubmit."}
            </span>
            {s.status === "draft" && (
              <Link to={`/submit/${s.id}`} className="border border-navy px-4 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-navy hover:bg-navy hover:text-white">Continue editing</Link>
            )}
            {s.status === "revision_required" && (
              <Link to={`/submit/${s.id}`} className="border border-uvdeep bg-uvdeep px-4 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#f5f8ef] hover:bg-[#3a6b1f]">Revise & resubmit</Link>
            )}
            {s.articleId && s.status === "published" && (
              <Link to={`/article/${s.articleId}`} className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-navy hover:underline">View published page →</Link>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------ charts ------------------------------ */

function StatusDonut({ submissions }: { submissions: Submission[] }) {
  const order: ArticleStatus[] = ["draft", "submitted", "technical_check", "editorial_review", "revision_required", "resubmitted", "accepted", "rejected", "published"];
  const colors: Record<string, string> = {
    draft: "#8ea0b5", submitted: "#1d5c9c", technical_check: "#5b4a8f", editorial_review: "#b45309",
    revision_required: "#b3382c", resubmitted: "#2e7fb8", accepted: "#2f7d4f", rejected: "#7c2b22", published: "#14365c",
  };
  const total = submissions.length || 1;
  let acc = 0;
  const segs = order
    .map((st) => ({ st, n: submissions.filter((s) => s.status === st).length }))
    .filter((x) => x.n > 0)
    .map((x) => {
      const start = acc / total;
      acc += x.n;
      return { ...x, start, end: acc / total };
    });
  const R = 42;
  const C = 2 * Math.PI * R;
  return (
    <div className="mt-3 flex items-center gap-5">
      <svg viewBox="0 0 110 110" className="h-28 w-28 shrink-0">
        <circle cx="55" cy="55" r={R} fill="none" stroke="#e7ebee" strokeWidth="14" />
        {segs.map((sg) => (
          <circle
            key={sg.st} cx="55" cy="55" r={R} fill="none"
            stroke={colors[sg.st]} strokeWidth="14"
            strokeDasharray={`${(sg.end - sg.start) * C} ${C}`}
            strokeDashoffset={-sg.start * C}
            transform="rotate(-90 55 55)"
            className="transition-all duration-700"
          />
        ))}
        <text x="55" y="52" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="19" fill="#10233b">{submissions.length}</text>
        <text x="55" y="66" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="6.5" letterSpacing="1" fill="#7a8ba0">TOTAL</text>
      </svg>
      <ul className="grid flex-1 grid-cols-1 gap-1 sm:grid-cols-2">
        {segs.map((sg) => (
          <li key={sg.st} className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.06em] text-inksoft">
            <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: colors[sg.st] }} />
            <span className="truncate">{STATUS_META[sg.st].short} · {sg.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarList({ items, color }: { items: { label: string; count: number }[]; color: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  if (items.length === 0) return <p className="mt-3 text-[0.75rem] italic text-inkfaint">No data yet.</p>;
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.06em] text-inksoft">
            <span className="truncate">{i.label}</span>
            <span className="font-bold tabular text-ink">{i.count}</span>
          </div>
          <div className="mt-1 h-2 w-full bg-paper">
            <div className="h-full transition-all duration-700" style={{ width: `${(i.count / max) * 100}%`, backgroundColor: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
