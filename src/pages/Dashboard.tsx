import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ArticleStatus, Role, Submission } from "../types";
import { canSeeSubmission, hasRole, useStore } from "../store/AppStore";
import {
  Btn, EmptyState, IEdit, IMail, ITrash, IX, Modal, Reveal, StatusBadge, Tag,
} from "../components/ui";
import { EMAIL_TEMPLATE_KEYS, STATUS_META } from "../data/constants";

const QUEUE_TABS: (ArticleStatus | "all")[] = [
  "all", "submitted", "technical_check", "technical_revision", "editorial_review",
  "revision_required", "resubmitted", "accepted", "production", "proof_ready",
  "published", "rejected", "withdrawn",
];

export default function Dashboard() {
  const store = useStore();
  const { submissions, currentUser } = store;
  const navigate = useNavigate();

  const isStaff = hasRole(currentUser?.role, ["admin", "editor"]);
  const isReviewer = currentUser?.role === "reviewer";
  const isAdmin = currentUser?.role === "admin";

  const [tab, setTab] = useState<ArticleStatus | "all">("all");
  const [view, setView] = useState<"queue" | "insights" | "audit" | "admin" | "email">("queue");
  const [messageFor, setMessageFor] = useState<Submission | null>(null);

  const visible = useMemo(
    () =>
      [...submissions]
        .filter((s) => canSeeSubmission(currentUser, s))
        .sort((a, b) => (b.submittedAt || b.updatedAt || b.createdAt).localeCompare(a.submittedAt || a.updatedAt || a.createdAt)),
    [submissions, currentUser],
  );

  const stats = useMemo(() => {
    // reviewers only ever see aggregate numbers for manuscripts they can access (§38)
    const src = isStaff ? submissions : visible;
    const by = (st: ArticleStatus) => src.filter((s) => s.status === st).length;
    const published = src.filter((s) => s.status === "published");
    const month = new Date().toISOString().slice(0, 7);
    const reviewDays: number[] = [];
    src.forEach((s) => {
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
      by,
      publishedTotal: published.length,
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

  const filtered = tab === "all" ? visible : visible.filter((s) => s.status === tab);

  return (
    <div className="graph-paper min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.2em] text-uvdeep">
                {isStaff ? "Editorial office" : isReviewer ? "Reviewer queue" : "Author dashboard"}
              </p>
              <h1 className="mt-1 font-display text-4xl font-black tracking-tight text-ink">
                {isStaff || isReviewer ? "Editorial Office" : "My Submissions"}
              </h1>
              <p className="mt-1 text-[0.85rem] text-inksoft">
                {isStaff
                  ? "The complete submission → review → production → publication pipeline."
                  : isReviewer
                    ? "Manuscripts assigned to you for scientific review."
                    : "Every contribution you have submitted, with its live editorial status."}
              </p>
            </div>
            <Link to="/submit" className="border border-uvdeep bg-uvdeep px-5 py-2.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#f5f8ef] hover:bg-[#3a6b1f]">
              + New submission
            </Link>
          </div>
        </Reveal>

        {/* stat cards */}
        <Reveal delay={70}>
          {(isStaff || isReviewer) ? (
            <div className="mt-7 grid grid-cols-3 gap-px overflow-hidden border border-line bg-line sm:grid-cols-5 lg:grid-cols-9">
              {([
                ["New", stats.by("submitted")],
                ["Tech check", stats.by("technical_check") + stats.by("technical_revision")],
                ["Under review", stats.by("editorial_review")],
                ["Revision req.", stats.by("revision_required")],
                ["Rev. submitted", stats.by("resubmitted")],
                ["Accepted", stats.by("accepted")],
                ["Production", stats.by("production") + stats.by("proof_ready")],
                ["Published", stats.publishedTotal],
                ["Rejected", stats.by("rejected")],
              ] as [string, number][]).map(([l, v]) => (
                <div key={l} className="bg-sheet px-2 py-3.5 text-center">
                  <div className="font-display text-[1.5rem] font-black tabular text-navy">{v}</div>
                  <div className="mt-0.5 font-mono text-[0.54rem] uppercase tracking-[0.1em] text-inkfaint">{l}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
              {([
                ["Total submissions", visible.length],
                ["In editorial workflow", visible.filter((s) => !["draft", "rejected", "withdrawn"].includes(s.status)).length],
                ["Revisions requested", visible.filter((s) => ["revision_required", "technical_revision"].includes(s.status)).length],
                ["Published", visible.filter((s) => s.status === "published").length],
              ] as [string, number][]).map(([l, v]) => (
                <div key={l} className="bg-sheet px-3 py-3.5 text-center">
                  <div className="font-display text-[1.6rem] font-black tabular text-navy">{v}</div>
                  <div className="mt-0.5 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-inkfaint">{l}</div>
                </div>
              ))}
            </div>
          )}
        </Reveal>

        {/* view tabs (staff) */}
        {(isStaff || isAdmin) && (
          <div className="mt-7 flex flex-wrap gap-1 border-b border-line">
            {([
              ["queue", "Submission queue"],
              ["insights", "Insights"],
              ["audit", "Audit log"],
              ...(isAdmin ? ([["admin", "Admin settings"], ["email", "Email log"]] as const) : []),
            ] as [typeof view, string][]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setView(k)}
                className={`border border-b-0 px-4 py-2.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.12em] transition-colors ${
                  view === k ? "border-line bg-sheet text-navy" : "border-transparent text-inkfaint hover:text-navy"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ---------------- QUEUE ---------------- */}
        {(view === "queue" || !isStaff) && (
          <Reveal delay={100}>
            <div className={`${isStaff || isAdmin ? "" : "mt-7"} border border-line bg-sheet`}>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h2 className="font-display text-lg font-bold text-ink">
                  {isStaff || isReviewer ? "New submission queue" : "My submissions"}
                </h2>
                <span className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-inkfaint">{filtered.length} shown</span>
              </div>
              <div className="scrollbar-slim flex gap-1 overflow-x-auto border-b border-line bg-paper px-3 py-2">
                {QUEUE_TABS.map((t) => {
                  const n = t === "all" ? visible.length : visible.filter((s) => s.status === t).length;
                  if (t !== "all" && n === 0) return null;
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`shrink-0 border px-2.5 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] transition-colors ${
                        tab === t ? "border-navy bg-navy text-white" : "border-line bg-white text-inksoft hover:border-navy"
                      }`}
                    >
                      {t === "all" ? "All" : STATUS_META[t].label}
                      <span className="ml-1.5 opacity-60">{n}</span>
                    </button>
                  );
                })}
              </div>

              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="The queue is clear"
                    desc={isStaff || isReviewer ? "No submissions at this stage of the workflow right now." : "You have no submissions yet — your first TLC contribution is one plate away."}
                    action={!isStaff && !isReviewer ? (
                      <Link to="/submit" className="border border-uvdeep bg-uvdeep px-4 py-2 font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#f5f8ef] hover:bg-[#3a6b1f]">Submit your TLC</Link>
                    ) : undefined}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-[0.82rem]">
                    <thead>
                      <tr className="border-b border-line bg-paper font-mono text-[0.6rem] uppercase tracking-[0.12em] text-inkfaint">
                        <th className="px-4 py-2.5">ID</th>
                        <th className="px-3 py-2.5">Title</th>
                        <th className="px-3 py-2.5">Author</th>
                        <th className="px-3 py-2.5">Submitted</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Rev.</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id} className="group border-b border-line/70 transition-colors hover:bg-sky/50">
                          <td className="px-4 py-3 font-mono text-[0.68rem] font-bold whitespace-nowrap text-uvdeep">
                            {s.submissionId ?? <span className="text-inkfaint">— draft</span>}
                          </td>
                          <td className="max-w-[280px] px-3 py-3">
                            <button onClick={() => navigate(`/submission/${s.id}`)} className="truncate font-display text-[0.92rem] font-bold text-ink hover:text-navy">
                              {s.title || "Untitled draft"}
                            </button>
                            {s.articleId && <p className="font-mono text-[0.6rem] text-inkfaint">{s.articleId}</p>}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-inksoft">{s.authors[0]?.fullName ?? "—"}</td>
                          <td className="px-3 py-3 font-mono text-[0.68rem] whitespace-nowrap text-inksoft">{s.submittedAt || s.createdAt}</td>
                          <td className="px-3 py-3"><StatusBadge status={s.status} pulse={["submitted", "editorial_review", "resubmitted"].includes(s.status)} /></td>
                          <td className="px-3 py-3 font-mono text-[0.7rem] text-inksoft">R{s.revisionNumber}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {s.status === "draft" && !isStaff && (
                                <>
                                  <Link to={`/submit/${s.id}`} className="grid h-8 w-8 place-items-center border border-line text-navy hover:bg-sky" title="Edit draft"><IEdit size={14} /></Link>
                                  <DeleteDraft id={s.id} />
                                </>
                              )}
                              {isStaff && s.status === "submitted" && (
                                <QuickAction label="Tech check" onClick={() => { store.setStatus(s.id, "technical_check", "Technical screening started."); navigate(`/submission/${s.id}`); }} />
                              )}
                              {isStaff && ["editorial_review", "resubmitted"].includes(s.status) && (
                                <QuickAction label="Review" onClick={() => navigate(`/submission/${s.id}`)} />
                              )}
                              {isStaff && !["draft"].includes(s.status) && (
                                <button onClick={() => setMessageFor(s)} className="grid h-8 w-8 place-items-center border border-line text-navy hover:bg-sky" title="Message author"><IMail size={14} /></button>
                              )}
                              <Btn size="sm" variant="outline" onClick={() => navigate(`/submission/${s.id}`)}>View</Btn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* ---------------- INSIGHTS ---------------- */}
        {view === "insights" && (isStaff || isAdmin) && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Reveal><div className="border border-line bg-sheet p-4"><h3 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-navy">Workflow status</h3><StatusDonut submissions={visible} /></div></Reveal>
            <Reveal delay={80}><div className="border border-line bg-sheet p-4"><h3 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-navy">TLC categories (published)</h3><BarList items={stats.categoryCounts} color="#1d5c9c" /></div></Reveal>
            <Reveal delay={140}><div className="border border-line bg-sheet p-4"><h3 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-navy">Visualization methods (published)</h3><BarList items={stats.vizCounts} color="#467f26" /></div></Reveal>
            <Reveal delay={180}>
              <div className="grid grid-cols-2 gap-px border border-line bg-line text-center lg:col-span-3">
                {([
                  [`${stats.avgReviewDays.toFixed(1)} d`, "Avg. review time"],
                  [String(stats.publishedThisMonth), "Published this month"],
                  [String(stats.authorCount), "Authors"],
                  [`${stats.countries.length} (${stats.countries.slice(0, 3).join(", ")}${stats.countries.length > 3 ? "…" : ""})`, "Countries represented"],
                ] as [string, string][]).map(([v, l]) => (
                  <div key={l} className="bg-sheet px-3 py-4">
                    <div className="font-display text-2xl font-black tabular text-navy">{v}</div>
                    <div className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-inkfaint">{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        )}

        {/* ---------------- AUDIT ---------------- */}
        {view === "audit" && (isStaff || isAdmin) && <AuditView />}

        {/* ---------------- ADMIN ---------------- */}
        {view === "admin" && isAdmin && <AdminView />}

        {/* ---------------- EMAIL LOG ---------------- */}
        {view === "email" && isAdmin && <EmailLogView />}
      </div>

      {/* message author modal */}
      <MessageAuthorModal sub={messageFor} onClose={() => setMessageFor(null)} />
    </div>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="border border-navy px-2.5 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.08em] text-navy hover:bg-navy hover:text-white">
      {label}
    </button>
  );
}

function DeleteDraft({ id }: { id: string }) {
  const { deleteSubmission } = useStore();
  const [ask, setAsk] = useState(false);
  return (
    <>
      <button onClick={() => setAsk(true)} className="grid h-8 w-8 place-items-center border border-line text-[#a33327] hover:bg-[#faece9]" title="Delete draft"><ITrash size={14} /></button>
      <Modal open={ask} onClose={() => setAsk(false)}>
        <div className="px-6 py-5">
          <h3 className="font-display text-xl font-bold text-ink">Delete this draft?</h3>
          <p className="mt-2 text-[0.85rem] text-inksoft">Drafts that were never submitted can be removed. This cannot be undone.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setAsk(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => { deleteSubmission(id); setAsk(false); }}>Delete</Btn>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------ message author ------------------------------ */

function MessageAuthorModal({ sub, onClose }: { sub: Submission | null; onClose: () => void }) {
  const { messageAuthor } = useStore();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  if (!sub) return null;
  const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
  return (
    <Modal open onClose={onClose}>
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Message author</h3>
            <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-inkfaint">
              To: {corr?.fullName} · {corr?.email}
            </p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center border border-line text-inksoft hover:text-ink"><IX size={14} /></button>
        </div>
        <input className="field-input mt-4" placeholder="Subject — e.g. TLC Journal — Question about TLC-SUB-2026-00001" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea rows={5} className="field-input mt-2 resize-y" placeholder="Your message… (the author receives this by email and as an in-app notification)" value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="accent" disabled={!subject.trim() || !body.trim()} onClick={() => { messageAuthor(sub.id, subject.trim(), body.trim()); setSubject(""); setBody(""); onClose(); }}>
            Send message
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------ audit view ------------------------------ */

function AuditView() {
  const { auditLog } = useStore();
  const events = [...auditLog].reverse();
  return (
    <div className="mt-6 border border-line bg-sheet">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-lg font-bold text-ink">Audit log</h2>
        <span className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-inkfaint">{events.length} events</span>
      </div>
      {events.length === 0 ? (
        <div className="p-6"><EmptyState title="No events yet" desc="Every submission, decision, assignment and publication is recorded here." /></div>
      ) : (
        <div className="max-h-[560px] overflow-auto scrollbar-slim">
          <table className="w-full min-w-[820px] text-left text-[0.78rem]">
            <thead className="sticky top-0 bg-paper">
              <tr className="border-b border-line font-mono text-[0.58rem] uppercase tracking-[0.12em] text-inkfaint">
                <th className="px-4 py-2.5">When</th><th className="px-3 py-2.5">User</th><th className="px-3 py-2.5">Action</th><th className="px-3 py-2.5">Ref</th><th className="px-3 py-2.5">Status change</th><th className="px-3 py-2.5">Comment</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-line/60 align-top hover:bg-sky/40">
                  <td className="px-4 py-2.5 font-mono text-[0.66rem] whitespace-nowrap text-inksoft">{e.date}</td>
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap text-ink">{e.user}</td>
                  <td className="px-3 py-2.5 text-ink">{e.action}</td>
                  <td className="px-3 py-2.5 font-mono text-[0.66rem] text-uvdeep">{e.ref ?? "—"}</td>
                  <td className="px-3 py-2.5 font-mono text-[0.64rem] text-navy">{e.prevStatus ? `${e.prevStatus} → ` : ""}{e.newStatus ?? "—"}</td>
                  <td className="max-w-[260px] px-3 py-2.5 text-inksoft">{e.comment ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ email log ------------------------------ */

function EmailLogView() {
  const { emailLogs } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const logs = [...emailLogs].reverse();
  return (
    <div className="mt-6 border border-line bg-sheet">
      <div className="border-b border-line px-4 py-3">
        <h2 className="font-display text-lg font-bold text-ink">Email log</h2>
        <p className="mt-0.5 text-[0.72rem] text-inkfaint">
          Every notification dispatched through the email service abstraction. Images are never attached — emails link to the secure dashboard.
        </p>
      </div>
      {logs.length === 0 ? (
        <div className="p-6"><EmptyState title="No emails yet" desc="Submission receipts, decisions, proofs and publication notices appear here." /></div>
      ) : (
        <ul className="divide-y divide-line">
          {logs.map((l) => (
            <li key={l.id} className="px-4 py-3">
              <button className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpen(open === l.id ? null : l.id)}>
                <span className="min-w-0">
                  <span className="block truncate text-[0.85rem] font-semibold text-ink">{l.subject}</span>
                  <span className="font-mono text-[0.62rem] text-inkfaint">to {l.to} · via {l.provider} · {l.date}</span>
                </span>
                <Tag tone="blue">{l.provider}</Tag>
              </button>
              {open === l.id && (
                <pre className="mt-2 whitespace-pre-wrap border border-line bg-paper p-3 font-mono text-[0.7rem] leading-relaxed text-inksoft">{l.body}</pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------ admin view ------------------------------ */

function AdminView() {
  const store = useStore();
  const { users, settings, updateSettings, updateEmailTemplate, updateUserRole, addUser } = store;
  const [email, setEmail] = useState(settings.journalEmail);
  const [provider, setProvider] = useState(settings.emailProvider);
  const [anon, setAnon] = useState(settings.anonymousReview);
  const [tplKey, setTplKey] = useState<(typeof EMAIL_TEMPLATE_KEYS)[number]>("submissionReceived");
  const [tplBody, setTplBody] = useState(settings.emailTemplates.submissionReceived);
  const [nu, setNu] = useState({ name: "", email: "", password: "", role: "reviewer" as Role });
  const [nuErr, setNuErr] = useState<string | null>(null);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* users */}
      <div className="border border-line bg-sheet p-5">
        <h2 className="font-display text-lg font-bold text-ink">Users & roles</h2>
        <div className="mt-3 max-h-72 overflow-auto scrollbar-slim">
          <table className="w-full text-left text-[0.78rem]">
            <thead>
              <tr className="border-b border-line font-mono text-[0.58rem] uppercase tracking-[0.12em] text-inkfaint">
                <th className="py-1.5 pr-2">Name</th><th className="py-1.5 pr-2">Email</th><th className="py-1.5">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line/60">
                  <td className="py-2 pr-2 font-medium text-ink">{u.name}</td>
                  <td className="py-2 pr-2 font-mono text-[0.66rem] text-inksoft">{u.email}</td>
                  <td className="py-2">
                    <select className="field-input !w-28 !py-1 text-[0.72rem]" value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value as Role)}>
                      {(["author", "reviewer", "editor", "admin"] as Role[]).map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <p className="field-label">Add user</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input className="field-input" placeholder="Full name" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} />
            <input className="field-input" placeholder="Email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} />
            <input className="field-input" placeholder="Temporary password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} />
            <select className="field-input" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value as Role })}>
              {(["author", "reviewer", "editor", "admin"] as Role[]).map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          {nuErr && <p className="mt-2 text-[0.72rem] font-medium text-[#a33327]">{nuErr}</p>}
          <Btn size="sm" className="mt-2" onClick={() => {
            if (!nu.name.trim() || !/^\S+@\S+\.\S+$/.test(nu.email) || nu.password.length < 6) return setNuErr("Name, valid email and a password of 6+ characters are required.");
            const err = addUser(nu.name, nu.email, nu.password, nu.role);
            if (err) return setNuErr(err);
            setNuErr(null); setNu({ name: "", email: "", password: "", role: "reviewer" });
          }}>Create account</Btn>
        </div>
      </div>

      {/* settings + templates */}
      <div className="space-y-6">
        <div className="border border-line bg-sheet p-5">
          <h2 className="font-display text-lg font-bold text-ink">Journal settings</h2>
          <label className="field-label mt-3 block">Editorial office email (§37 — configurable, never hard-coded)</label>
          <input className="field-input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="field-label mt-3 block">Email provider (abstraction — SMTP / Resend / SendGrid / SES ready)</label>
          <select className="field-input mt-1" value={provider} onChange={(e) => setProvider(e.target.value as typeof provider)}>
            {(["log-only", "smtp", "resend", "sendgrid", "ses"] as const).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" className="mt-1 accent-[#467f26]" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
            <span className="text-[0.8rem] text-inksoft">Anonymous review — hide author identities from reviewers where supported.</span>
          </label>
          <Btn size="sm" className="mt-3" onClick={() => updateSettings({ journalEmail: email.trim(), emailProvider: provider, anonymousReview: anon })}>Save settings</Btn>
        </div>

        <div className="border border-line bg-sheet p-5">
          <h2 className="font-display text-lg font-bold text-ink">Email templates</h2>
          <p className="mt-1 text-[0.72rem] text-inkfaint">Placeholders: {"{{id}} {{title}} {{author}} {{date}} {{journalEmail}}"}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EMAIL_TEMPLATE_KEYS.map((k) => (
              <button key={k} onClick={() => { setTplKey(k); setTplBody(settings.emailTemplates[k] ?? ""); }}
                className={`border px-2.5 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.06em] ${tplKey === k ? "border-navy bg-navy text-white" : "border-line text-inksoft hover:border-navy"}`}>
                {k}
              </button>
            ))}
          </div>
          <textarea rows={7} className="field-input mt-3 resize-y font-mono text-[0.72rem]" value={tplBody} onChange={(e) => setTplBody(e.target.value)} />
          <Btn size="sm" className="mt-2" onClick={() => { updateEmailTemplate(tplKey, tplBody); store.toast(`Template "${tplKey}" saved.`, "ok"); }}>Save template</Btn>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ charts ------------------------------ */

function StatusDonut({ submissions }: { submissions: Submission[] }) {
  const order: ArticleStatus[] = ["draft", "submitted", "technical_check", "technical_revision", "editorial_review", "revision_required", "resubmitted", "accepted", "production", "proof_ready", "rejected", "withdrawn", "published"];
  const colors: Record<string, string> = {
    draft: "#8ea0b5", submitted: "#1d5c9c", technical_check: "#5b4a8f", technical_revision: "#c2543f",
    editorial_review: "#b45309", revision_required: "#b3382c", resubmitted: "#2e7fb8", accepted: "#2f7d4f",
    production: "#c98a1b", proof_ready: "#7a5fb0", rejected: "#7c2b22", withdrawn: "#a4aeb9", published: "#14365c",
  };
  const total = submissions.length || 1;
  let acc = 0;
  const segs = order
    .map((st) => ({ st, n: submissions.filter((s) => s.status === st).length }))
    .filter((x) => x.n > 0)
    .map((x) => { const start = acc / total; acc += x.n; return { ...x, start, end: acc / total }; });
  const R = 42;
  const C = 2 * Math.PI * R;
  return (
    <div className="mt-3 flex items-center gap-5">
      <svg viewBox="0 0 110 110" className="h-28 w-28 shrink-0">
        <circle cx="55" cy="55" r={R} fill="none" stroke="#e7ebee" strokeWidth="14" />
        {segs.map((sg) => (
          <circle key={sg.st} cx="55" cy="55" r={R} fill="none" stroke={colors[sg.st]} strokeWidth="14"
            strokeDasharray={`${(sg.end - sg.start) * C} ${C}`} strokeDashoffset={-sg.start * C}
            transform="rotate(-90 55 55)" className="transition-all duration-700" />
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
        {segs.length === 0 && <li className="text-[0.72rem] italic text-inkfaint">No data yet.</li>}
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
