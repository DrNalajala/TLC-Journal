import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import type {
  ArticleStatus, AuditEvent, Correction, EmailLogEntry, JournalSettings, Notification,
  ReviewComment, RevisionRecord, Role, ScientificReview, StatusEvent, Submission, User,
} from "../types";
import { DEMO_USERS, SEED_SUBMISSIONS } from "../data/seed";
import {
  CURRENT_YEAR, DEFAULT_EMAIL_TEMPLATES, EDITORIAL_EMAIL, EMAIL_TEMPLATE_KEYS,
  ID_PREFIX, SUB_PREFIX,
} from "../data/constants";
import { getProvider, renderTemplate } from "../utils/email";

/* ------------------------------------------------------------------ */
/* Persisted state                                                     */
/* ------------------------------------------------------------------ */

interface PersistedState {
  users: User[];
  submissions: Submission[];
  currentUserId: string | null;
  nextArticleNumber: number;
  nextSubmissionNumber: number;
  notifications: Notification[];
  emailLogs: EmailLogEntry[];
  auditLog: AuditEvent[];
  settings: JournalSettings;
}

const STORE_KEY = "tlcj-store-v5";

const defaultSettings = (): JournalSettings => ({
  journalEmail: EDITORIAL_EMAIL,
  emailProvider: "log-only",
  anonymousReview: false,
  emailTemplates: { ...DEFAULT_EMAIL_TEMPLATES },
});

function loadInitial(): PersistedState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && Array.isArray(parsed.submissions) && Array.isArray(parsed.users)) {
        return {
          ...parsed,
          notifications: parsed.notifications ?? [],
          emailLogs: parsed.emailLogs ?? [],
          auditLog: parsed.auditLog ?? [],
          nextSubmissionNumber: parsed.nextSubmissionNumber ?? 1,
          settings: { ...defaultSettings(), ...(parsed.settings ?? {}) },
        };
      }
    }
  } catch {
    /* corrupted state — reseed */
  }
  return {
    users: DEMO_USERS,
    submissions: SEED_SUBMISSIONS,
    currentUserId: null,
    nextArticleNumber: 1,
    nextSubmissionNumber: 1,
    notifications: [],
    emailLogs: [],
    auditLog: [],
    settings: defaultSettings(),
  };
}

const nowIso = () => new Date().toISOString().slice(0, 10);
const nowStamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");
const uid = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: number;
  text: string;
  kind: "ok" | "warn" | "bad";
}

/* ------------------------------------------------------------------ */
/* Store shape                                                         */
/* ------------------------------------------------------------------ */

interface StoreShape extends PersistedState {
  currentUser: User | null;
  toasts: Toast[];
  toast: (text: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  register: (name: string, email: string, password: string, affiliation: string) => string | null;
  saveSubmission: (s: Submission) => void;
  deleteSubmission: (id: string) => void;
  setStatus: (id: string, status: ArticleStatus, note?: string) => void;
  toggleChecklist: (id: string, key: string) => void;
  addComment: (id: string, section: string, text: string) => void;
  respondToComment: (id: string, commentId: string, response: string) => void;
  editorRespondToComment: (id: string, commentId: string, response: string) => void;
  toggleCommentResolved: (id: string, commentId: string) => void;
  /* workflow */
  nextArticleId: () => string;
  nextSubmissionId: () => string;
  submitToJournal: (id: string) => string; // returns generated submission id
  assignEditor: (id: string, userId: string) => void;
  assignReviewer: (id: string, userId: string) => void;
  toggleTechCheck: (id: string, key: string) => void;
  techCheckPass: (id: string) => void;
  techReturn: (id: string, reason: string, comment: string) => void;
  submitReview: (id: string, review: Omit<ScientificReview, "id" | "date" | "reviewerName" | "reviewerRole">) => void;
  decide: (id: string, kind: "accept" | "minor" | "major" | "reject", comment: string) => void;
  resubmitRevision: (id: string, changes: string) => void;
  addFileVersion: (id: string, kind: "tlc" | "scheme", data: string, fileName: string, note: string) => void;
  enterProduction: (id: string) => void;
  toggleProductionItem: (id: string, key: string) => void;
  requestAuthorProof: (id: string) => void;
  authorApproveProof: (id: string) => void;
  authorRequestProofCorrection: (id: string, note: string) => void;
  publishSubmission: (id: string) => void;
  unpublishSubmission: (id: string) => void;
  withdraw: (id: string, reason: string) => void;
  requestCorrection: (id: string, description: string) => void;
  decideCorrection: (id: string, correctionId: string, approve: boolean, note: string) => void;
  messageAuthor: (id: string, subject: string, body: string) => void;
  /* notifications */
  markNotificationRead: (nid: string) => void;
  markAllNotificationsRead: () => void;
  /* admin */
  updateSettings: (patch: Partial<JournalSettings>) => void;
  updateEmailTemplate: (key: (typeof EMAIL_TEMPLATE_KEYS)[number], body: string) => void;
  updateUserRole: (userId: string, role: Role) => void;
  addUser: (name: string, email: string, password: string, role: Role) => string | null;
}

const AppStoreContext = createContext<StoreShape | null>(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitial);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded — keep running in memory */
    }
  }, [state]);

  const toast = useCallback((text: string, kind: Toast["kind"] = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const mutate = useCallback(
    (fn: (prev: PersistedState) => PersistedState) => setState((prev) => fn(prev)),
    [],
  );

  /* ---------------- audit + email + notification helpers ---------------- */

  const makeAudit = (
    user: string, action: string, opts: Partial<AuditEvent> = {},
  ): AuditEvent => ({
    id: uid("a"), user, date: nowStamp(), action, ...opts,
  });

  /** Archive an outgoing email via the configured provider abstraction. */
  const makeEmail = (
    s: PersistedState, to: string, templateKey: (typeof EMAIL_TEMPLATE_KEYS)[number],
    subject: string, vars: Record<string, string>,
  ): EmailLogEntry => {
    const template = s.settings.emailTemplates[templateKey] ?? DEFAULT_EMAIL_TEMPLATES[templateKey];
    const body = renderTemplate(template, { ...vars, journalEmail: s.settings.journalEmail });
    void getProvider(s.settings.emailProvider).send({ to, subject, body });
    return {
      id: uid("e"), to, subject, body, provider: s.settings.emailProvider, date: nowStamp(),
    };
  };

  const notify = (audience: string, text: string, link?: string): Notification => ({
    id: uid("n"), audience, text, date: nowStamp(), read: false, link,
  });

  /** Find the platform account of an author by email (for in-app notifications). */
  const authorUserId = (s: PersistedState, sub: Submission): string | null => {
    const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
    if (!corr) return null;
    const u = s.users.find((x) => x.email.toLowerCase() === corr.email.toLowerCase());
    return u ? u.id : null;
  };

  const subRef = (s: Submission) => s.submissionId ?? s.articleId ?? s.id.slice(0, 10);

  /* ---------------- auth ---------------- */

  const login = useCallback(
    (email: string, password: string): string | null => {
      const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) return "No account found with this email.";
      if (user.password !== password) return "Incorrect password.";
      setState((p) => ({ ...p, currentUserId: user.id }));
      toast(`Signed in as ${user.name} (${user.role}).`, "ok");
      return null;
    },
    [state.users, toast],
  );

  const logout = useCallback(() => {
    setState((p) => ({ ...p, currentUserId: null }));
    toast("Signed out.", "ok");
  }, [toast]);

  const register = useCallback(
    (name: string, email: string, password: string, affiliation: string): string | null => {
      if (state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        return "An account with this email already exists.";
      }
      const user: User = {
        id: `u-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        password,
        role: "author" as Role,
        affiliation,
        createdAt: nowIso(),
      };
      setState((p) => ({ ...p, users: [...p.users, user], currentUserId: user.id }));
      toast(`Account created — welcome, ${user.name}.`, "ok");
      return null;
    },
    [state.users, toast],
  );

  /* ---------------- basic submission ops ---------------- */

  const saveSubmission = useCallback(
    (s: Submission) => {
      mutate((p) => {
        const exists = p.submissions.some((x) => x.id === s.id);
        const next = { ...s, updatedAt: nowIso(), pageEstimate: estimatePagePct(s) };
        return {
          ...p,
          submissions: exists
            ? p.submissions.map((x) => (x.id === s.id ? next : x))
            : [...p.submissions, next],
        };
      });
    },
    [mutate],
  );

  const deleteSubmission = useCallback(
    (id: string) => {
      const who = currentUser?.name ?? "System";
      mutate((p) => {
        const s = p.submissions.find((x) => x.id === id);
        return {
          ...p,
          submissions: p.submissions.filter((x) => x.id !== id),
          auditLog: [
            ...p.auditLog,
            makeAudit(who, "Submission deleted", { ref: s ? subRef(s) : id, submissionId: id }),
          ],
        };
      });
      toast("Submission deleted.", "warn");
    },
    [currentUser, mutate, toast],
  );

  const setStatus = useCallback(
    (id: string, status: ArticleStatus, note?: string) => {
      const who = currentUser ? currentUser.name : "System";
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) => {
          if (s.id !== id) return s;
          const event: StatusEvent = { status, date: nowIso(), by: who, note };
          const next: Submission = { ...s, status, updatedAt: nowIso(), history: [...s.history, event] };
          if (status === "submitted" || status === "resubmitted") {
            next.submittedAt = next.submittedAt || nowIso();
          }
          return next;
        }),
        auditLog: [
          ...p.auditLog,
          makeAudit(who, `Status set to ${status.replace(/_/g, " ")}`, { submissionId: id, newStatus: status, comment: note }),
        ],
      }));
    },
    [currentUser, mutate],
  );

  const toggleChecklist = useCallback(
    (id: string, key: string) => {
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id ? { ...s, checklist: { ...s.checklist, [key]: !s.checklist[key] }, updatedAt: nowIso() } : s,
        ),
      }));
    },
    [mutate],
  );

  /* ---------------- comments ---------------- */

  const addComment = useCallback(
    (id: string, section: string, text: string) => {
      if (!currentUser) return;
      const who = currentUser;
      const comment: ReviewComment = {
        id: uid("c"), byName: who.name, byRole: who.role, section, text, date: nowIso(),
      };
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const isStaff = who.role !== "author";
        const emails = isStaff && sub
          ? (() => {
              const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
              return corr
                ? [makeEmail(p, corr.email, "reviewDecision", `TLC Journal — New comment on ${subRef(sub)}`, {
                    id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso(),
                  })]
                : [];
            })()
          : [];
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id ? { ...s, comments: [...s.comments, comment], updatedAt: nowIso() } : s,
          ),
          emailLogs: [...p.emailLogs, ...emails],
          notifications:
            isStaff && sub
              ? [...p.notifications, notify(authorUserId(p, sub) ?? "author", `New editor comment on ${subRef(sub)}: "${text.slice(0, 80)}${text.length > 80 ? "…" : ""}"`, `/submission/${id}`)]
              : p.notifications,
          auditLog: [...p.auditLog, makeAudit(who.name, "Comment added", { submissionId: id, ref: sub ? subRef(sub) : undefined, comment: `${section}: ${text.slice(0, 90)}` })],
        };
      });
      toast("Review comment added.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const respondToComment = useCallback(
    (id: string, commentId: string, response: string) => {
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id
            ? { ...s, comments: s.comments.map((c) => (c.id === commentId ? { ...c, authorResponse: response } : c)), updatedAt: nowIso() }
            : s,
        ),
        auditLog: [...p.auditLog, makeAudit(currentUser?.name ?? "Author", "Author responded to comment", { submissionId: id })],
      }));
      toast("Response recorded.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const editorRespondToComment = useCallback(
    (id: string, commentId: string, response: string) => {
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id
            ? { ...s, comments: s.comments.map((c) => (c.id === commentId ? { ...c, editorResponse: response } : c)), updatedAt: nowIso() }
            : s,
        ),
        auditLog: [...p.auditLog, makeAudit(currentUser?.name ?? "Editor", "Editor responded to comment", { submissionId: id })],
      }));
      toast("Editor response recorded.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const toggleCommentResolved = useCallback(
    (id: string, commentId: string) => {
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id
            ? { ...s, comments: s.comments.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c)), updatedAt: nowIso() }
            : s,
        ),
      }));
    },
    [mutate],
  );

  /* ---------------- identifiers ---------------- */

  const nextArticleId = useCallback(
    () => `${ID_PREFIX}-${CURRENT_YEAR}-${String(state.nextArticleNumber).padStart(5, "0")}`,
    [state.nextArticleNumber],
  );

  const nextSubmissionId = useCallback(
    () => `${SUB_PREFIX}-${CURRENT_YEAR}-${String(state.nextSubmissionNumber).padStart(5, "0")}`,
    [state.nextSubmissionNumber],
  );

  /* ---------------- workflow actions ---------------- */

  /** Final submission: assigns TLC-SUB-…, notifies editors, logs email (§4, §7). */
  const submitToJournal = useCallback(
    (id: string): string => {
      const who = currentUser?.name ?? "Author";
      const newId = `${SUB_PREFIX}-${CURRENT_YEAR}-${String(state.nextSubmissionNumber).padStart(5, "0")}`;
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const submissionId = sub?.submissionId ?? newId;
        const emails: EmailLogEntry[] = [];
        const notes: Notification[] = [];
        if (sub) {
          const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
          emails.push(
            makeEmail(p, p.settings.journalEmail, "submissionReceived",
              `TLC Journal — New Submission ${submissionId}`,
              { id: submissionId, title: sub.title, author: corr?.fullName ?? who, date: nowIso() }),
          );
          if (corr) {
            emails.push(
              makeEmail(p, corr.email, "submissionReceived",
                `TLC Journal — Submission received — ${submissionId}`,
                { id: submissionId, title: sub.title, author: corr.fullName, date: nowIso() }),
            );
          }
          const auId = authorUserId(p, sub);
          if (auId) notes.push(notify(auId, `Submission received — ${submissionId}. The editorial team is running the technical screening.`, `/submission/${id}`));
          p.users.filter((u) => u.role === "editor" || u.role === "admin").forEach((u) =>
            notes.push(notify(u.id, `New TLC submission ${submissionId} — "${sub.title}"`, `/submission/${id}`)),
          );
        }
        return {
          ...p,
          nextSubmissionNumber: p.submissions.find((s) => s.id === id)?.submissionId
            ? p.nextSubmissionNumber
            : p.nextSubmissionNumber + 1,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  submissionId,
                  status: "submitted" as ArticleStatus,
                  submittedAt: s.submittedAt || nowIso(),
                  updatedAt: nowIso(),
                  history: [...s.history, { status: "submitted" as ArticleStatus, date: nowIso(), by: who, note: `Submission identifier ${submissionId} generated.` }],
                }
              : s,
          ),
          emailLogs: [...p.emailLogs, ...emails],
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Submission submitted", { submissionId: id, ref: submissionId, prevStatus: "draft", newStatus: "submitted" })],
        };
      });
      return newId;
    },
    [currentUser, mutate, state.nextSubmissionNumber],
  );

  const assignEditor = useCallback(
    (id: string, userId: string) => {
      const who = currentUser?.name ?? "Admin";
      mutate((p) => {
        const u = p.users.find((x) => x.id === userId);
        const sub = p.submissions.find((s) => s.id === id);
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id ? { ...s, assignedEditorId: userId, assignedEditorName: u?.name ?? "", updatedAt: nowIso() } : s,
          ),
          notifications: u
            ? [...p.notifications, notify(u.id, `You were assigned as handling editor for ${sub ? subRef(sub) : id}.`, `/submission/${id}`)]
            : p.notifications,
          auditLog: [...p.auditLog, makeAudit(who, "Editor assigned", { submissionId: id, ref: sub ? subRef(sub) : undefined, comment: u?.name })],
        };
      });
      toast("Handling editor assigned.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const assignReviewer = useCallback(
    (id: string, userId: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const u = p.users.find((x) => x.id === userId);
        const sub = p.submissions.find((s) => s.id === id);
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id ? { ...s, assignedReviewerId: userId, assignedReviewerName: u?.name ?? "", updatedAt: nowIso() } : s,
          ),
          notifications: u
            ? [...p.notifications, notify(u.id, `A manuscript was assigned to you for scientific review (${sub ? subRef(sub) : id}).`, `/submission/${id}`)]
            : p.notifications,
          auditLog: [...p.auditLog, makeAudit(who, "Reviewer assigned", { submissionId: id, ref: sub ? subRef(sub) : undefined, comment: u?.name })],
        };
      });
      toast("Reviewer assigned.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const toggleTechCheck = useCallback(
    (id: string, key: string) => {
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id ? { ...s, techCheck: { ...s.techCheck, [key]: !s.techCheck[key] }, updatedAt: nowIso() } : s,
        ),
      }));
    },
    [mutate],
  );

  /** Technical screening passed → Under Review (§13). */
  const techCheckPass = useCallback(
    (id: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const emails: EmailLogEntry[] = [];
        const notes: Notification[] = [];
        if (sub) {
          const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
          if (corr) {
            emails.push(makeEmail(p, corr.email, "reviewDecision",
              `TLC Journal — Technical check completed — ${subRef(sub)}`,
              { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() }));
          }
          const auId = authorUserId(p, sub);
          if (auId) notes.push(notify(auId, `Technical check completed — ${subRef(sub)} has moved to scientific review.`, `/submission/${id}`));
        }
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? {
                  ...s, status: "editorial_review" as ArticleStatus, updatedAt: nowIso(),
                  history: [...s.history, { status: "editorial_review" as ArticleStatus, date: nowIso(), by: who, note: "Passed technical screening." }],
                }
              : s,
          ),
          emailLogs: [...p.emailLogs, ...emails],
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Technical check passed", { submissionId: id, ref: sub ? subRef(sub) : undefined, prevStatus: "technical_check", newStatus: "editorial_review" })],
        };
      });
      toast("Technical check passed — now under scientific review.", "ok");
    },
    [currentUser, mutate, toast],
  );

  /** Return to author for technical correction (§14). */
  const techReturn = useCallback(
    (id: string, reason: string, comment: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const emails: EmailLogEntry[] = [];
        const notes: Notification[] = [];
        if (sub) {
          const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
          if (corr) {
            emails.push(makeEmail(p, corr.email, "technicalRevision",
              `TLC Journal — Technical correction required — ${subRef(sub)}`,
              { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() }));
          }
          const auId = authorUserId(p, sub);
          if (auId) notes.push(notify(auId, `Technical correction required for ${subRef(sub)}: ${reason}.`, `/submission/${id}`));
        }
        const revComment: ReviewComment = {
          id: uid("c"), byName: who, byRole: (currentUser?.role as Role) ?? "editor",
          section: "Technical check", text: `[${reason}] ${comment}`, date: nowIso(),
        };
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? {
                  ...s, status: "technical_revision" as ArticleStatus, techReturnReason: reason,
                  comments: comment ? [...s.comments, revComment] : s.comments,
                  updatedAt: nowIso(),
                  history: [...s.history, { status: "technical_revision" as ArticleStatus, date: nowIso(), by: who, note: reason }],
                }
              : s,
          ),
          emailLogs: [...p.emailLogs, ...emails],
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Returned to author (technical)", { submissionId: id, ref: sub ? subRef(sub) : undefined, prevStatus: "technical_check", newStatus: "technical_revision", comment: reason })],
        };
      });
      toast("Returned to author for technical correction.", "warn");
    },
    [currentUser, mutate, toast],
  );

  /** Store a completed scientific review form (§16). */
  const submitReview = useCallback(
    (id: string, review: Omit<ScientificReview, "id" | "date" | "reviewerName" | "reviewerRole">) => {
      const who = currentUser;
      if (!who) return;
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const full: ScientificReview = {
          ...review, id: uid("r"), date: nowIso(), reviewerName: who.name, reviewerRole: who.role,
        };
        const notes: Notification[] = [];
        p.users.filter((u) => u.role === "editor" || u.role === "admin").forEach((u) =>
          notes.push(notify(u.id, `Scientific review completed for ${sub ? subRef(sub) : id} — recommendation: ${review.recommendation}.`, `/submission/${id}`)),
        );
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id ? { ...s, reviews: [...s.reviews, full], updatedAt: nowIso() } : s,
          ),
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who.name, "Scientific review submitted", { submissionId: id, ref: sub ? subRef(sub) : undefined, comment: `Recommendation: ${review.recommendation}` })],
        };
      });
      toast("Review recorded — the handling editor has been notified.", "ok");
    },
    [currentUser, mutate, toast],
  );

  /** Editorial decision: accept | minor | major | reject (§17, §21). */
  const decide = useCallback(
    (id: string, kind: "accept" | "minor" | "major" | "reject", comment: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        if (!sub) return p;
        const emails: EmailLogEntry[] = [];
        const notes: Notification[] = [];
        const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
        let nextArticleNumber = p.nextArticleNumber;
        let articleId = sub.articleId;

        let patch: Partial<Submission>;
        let action: string;
        let newStatus: ArticleStatus;

        if (kind === "accept") {
          newStatus = "accepted";
          articleId = articleId ?? `${ID_PREFIX}-${CURRENT_YEAR}-${String(nextArticleNumber).padStart(5, "0")}`;
          nextArticleNumber = sub.articleId ? nextArticleNumber : nextArticleNumber + 1;
          patch = {
            status: newStatus, articleId, decisionNote: comment,
            history: [...sub.history, { status: newStatus, date: nowIso(), by: who, note: `Accepted for publication. Article identifier ${articleId} assigned.` }],
          };
          action = "Submission accepted";
          if (corr) emails.push(makeEmail(p, corr.email, "acceptance", `TLC Journal — Accepted — ${subRef(sub)}`, { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() }));
          const auId = authorUserId(p, sub);
          if (auId) notes.push(notify(auId, `Congratulations — ${subRef(sub)} has been accepted for publication (${articleId}).`, `/submission/${id}`));
        } else if (kind === "reject") {
          newStatus = "rejected";
          patch = {
            status: newStatus, decisionNote: comment,
            history: [...sub.history, { status: newStatus, date: nowIso(), by: who, note: comment }],
          };
          action = "Submission rejected";
          if (corr) emails.push(makeEmail(p, corr.email, "reviewDecision", `TLC Journal — Decision: Reject — ${subRef(sub)}`, { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() }));
          const auId = authorUserId(p, sub);
          if (auId) notes.push(notify(auId, `A decision has been made on ${subRef(sub)}. Please read the editor's comments.`, `/submission/${id}`));
        } else {
          newStatus = "revision_required";
          patch = {
            status: newStatus, revisionType: kind, decisionNote: comment,
            history: [...sub.history, { status: newStatus, date: nowIso(), by: who, note: `${kind === "minor" ? "Minor" : "Major"} revision requested — ${comment}` }],
          };
          action = `${kind === "minor" ? "Minor" : "Major"} revision requested`;
          if (corr) emails.push(makeEmail(p, corr.email, "reviewDecision", `TLC Journal — ${kind === "minor" ? "Minor" : "Major"} Revision Required — ${subRef(sub)}`, { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() }));
          const auId = authorUserId(p, sub);
          if (auId) notes.push(notify(auId, `${kind === "minor" ? "Minor" : "Major"} revision required for ${subRef(sub)}. Read the comments and resubmit.`, `/submission/${id}`));
        }

        return {
          ...p,
          nextArticleNumber,
          submissions: p.submissions.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: nowIso() } : s)),
          emailLogs: [...p.emailLogs, ...emails],
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, action, { submissionId: id, ref: subRef(sub), prevStatus: sub.status, newStatus, comment })],
        };
      });
      toast(
        kind === "accept" ? "Accepted — publication identifier assigned."
        : kind === "reject" ? "Submission rejected."
        : `${kind === "minor" ? "Minor" : "Major"} revision requested — author notified.`,
        kind === "reject" ? "warn" : "ok",
      );
    },
    [currentUser, mutate, toast],
  );

  /** Author resubmits a revised version (§18, §20). */
  const resubmitRevision = useCallback(
    (id: string, changes: string) => {
      const who = currentUser?.name ?? "Author";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        if (!sub) return p;
        const revNum = sub.revisionNumber + 1;
        const record: RevisionRecord = {
          version: revNum, date: nowIso(), by: who,
          changes: changes || "Revised manuscript submitted.",
          files: [
            ...(sub.fileVersions.tlc.length ? [`TLC photograph (v${sub.fileVersions.tlc.length})`] : []),
            ...(sub.fileVersions.scheme.length ? [`Reaction scheme (v${sub.fileVersions.scheme.length})`] : []),
          ],
        };
        const emails: EmailLogEntry[] = [];
        const notes: Notification[] = [];
        const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
        if (corr) emails.push(makeEmail(p, corr.email, "revisionReceived", `TLC Journal — Revision received — ${subRef(sub)}`, { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() }));
        p.users.filter((u) => u.role === "editor" || u.role === "admin").forEach((u) =>
          notes.push(notify(u.id, `Author revision (R${revNum}) submitted for ${subRef(sub)}.`, `/submission/${id}`)),
        );
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? {
                  ...s, status: "resubmitted" as ArticleStatus, revisionNumber: revNum,
                  revisions: [...s.revisions, record], techCheck: {},
                  updatedAt: nowIso(),
                  history: [...s.history, { status: "resubmitted" as ArticleStatus, date: nowIso(), by: who, note: `Revision ${revNum} submitted.` }],
                }
              : s,
          ),
          emailLogs: [...p.emailLogs, ...emails],
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Revision submitted", { submissionId: id, ref: subRef(sub), prevStatus: sub.status, newStatus: "resubmitted", comment: `Revision ${revNum}` })],
        };
      });
      toast("Revision submitted — the editorial office has been notified.", "ok");
    },
    [currentUser, mutate, toast],
  );

  /** Append a versioned original file — previous versions are never overwritten (§12). */
  const addFileVersion = useCallback(
    (id: string, kind: "tlc" | "scheme", data: string, fileName: string, note: string) => {
      const who = currentUser?.name ?? "Author";
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) => {
          if (s.id !== id) return s;
          const versions = s.fileVersions[kind];
          const nextVersion = versions.length + 1;
          const fv = { version: nextVersion, data, fileName, uploadedBy: who, date: nowIso(), note };
          return {
            ...s,
            fileVersions: { ...s.fileVersions, [kind]: [...versions, fv] },
            ...(kind === "tlc" ? { tlcImage: data, tlcImageName: fileName, rotate: 0 } : { schemeImage: data, schemeFileName: fileName }),
            updatedAt: nowIso(),
          };
        }),
        auditLog: [...p.auditLog, makeAudit(who, `Original ${kind === "tlc" ? "TLC photograph" : "reaction scheme"} version uploaded`, { submissionId: id, comment: fileName })],
      }));
      toast("Uploaded as a new version — the previous original is preserved.", "ok");
    },
    [currentUser, mutate, toast],
  );

  /* ---------------- production & publication ---------------- */

  const enterProduction = useCallback(
    (id: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? { ...s, status: "production" as ArticleStatus, updatedAt: nowIso(), history: [...s.history, { status: "production" as ArticleStatus, date: nowIso(), by: who }] }
              : s,
          ),
          auditLog: [...p.auditLog, makeAudit(who, "Entered production", { submissionId: id, ref: sub ? subRef(sub) : undefined, prevStatus: sub?.status, newStatus: "production" })],
        };
      });
      toast("Moved to production.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const toggleProductionItem = useCallback(
    (id: string, key: string) => {
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id ? { ...s, productionChecklist: { ...s.productionChecklist, [key]: !s.productionChecklist[key] }, updatedAt: nowIso() } : s,
        ),
      }));
    },
    [mutate],
  );

  /** Generate the final proof and ask the author to approve it (§23, §24). */
  const requestAuthorProof = useCallback(
    (id: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const emails: EmailLogEntry[] = [];
        const notes: Notification[] = [];
        if (sub) {
          const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
          if (corr) emails.push(makeEmail(p, corr.email, "proofReady", `TLC Journal — Final proof ready — ${subRef(sub)}`, { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() }));
          const auId = authorUserId(p, sub);
          if (auId) notes.push(notify(auId, `Your final proof is ready for ${subRef(sub)}. Please review and approve it for publication.`, `/submission/${id}`));
        }
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? { ...s, status: "proof_ready" as ArticleStatus, proofRequested: true, updatedAt: nowIso(), history: [...s.history, { status: "proof_ready" as ArticleStatus, date: nowIso(), by: who, note: "Author proof requested." }] }
              : s,
          ),
          emailLogs: [...p.emailLogs, ...emails],
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Author proof requested", { submissionId: id, ref: sub ? subRef(sub) : undefined, newStatus: "proof_ready" })],
        };
      });
      toast("Final proof generated — author asked to approve.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const authorApproveProof = useCallback(
    (id: string) => {
      const who = currentUser?.name ?? "Author";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const notes: Notification[] = [];
        p.users.filter((u) => u.role === "editor" || u.role === "admin").forEach((u) =>
          notes.push(notify(u.id, `Author approved the final proof of ${sub ? subRef(sub) : id} — ready to publish.`, `/submission/${id}`)),
        );
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? { ...s, authorProofApproved: true, productionChecklist: { ...s.productionChecklist, authorProof: true }, updatedAt: nowIso(), history: [...s.history, { status: s.status, date: nowIso(), by: who, note: "Author approved the final proof." }] }
              : s,
          ),
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Author approved final proof", { submissionId: id, ref: sub ? subRef(sub) : undefined })],
        };
      });
      toast("Proof approved — the editor can now publish the article.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const authorRequestProofCorrection = useCallback(
    (id: string, note: string) => {
      const who = currentUser?.name ?? "Author";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const revComment: ReviewComment = {
          id: uid("c"), byName: who, byRole: (currentUser?.role as Role) ?? "author",
          section: "Final proof", text: `Proof correction requested: ${note}`, date: nowIso(),
        };
        const notes: Notification[] = [];
        p.users.filter((u) => u.role === "editor" || u.role === "admin").forEach((u) =>
          notes.push(notify(u.id, `Author requested a proof correction for ${sub ? subRef(sub) : id}.`, `/submission/${id}`)),
        );
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? { ...s, status: "production" as ArticleStatus, proofRequested: false, comments: [...s.comments, revComment], updatedAt: nowIso(), history: [...s.history, { status: "production" as ArticleStatus, date: nowIso(), by: who, note: "Proof returned for correction." }] }
              : s,
          ),
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Author requested proof correction", { submissionId: id, ref: sub ? subRef(sub) : undefined, comment: note })],
        };
      });
      toast("Correction request sent to the editorial office.", "warn");
    },
    [currentUser, mutate, toast],
  );

  /** Publish permanently (§25, §26). */
  const publishSubmission = useCallback(
    (id: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        if (!sub) return p;
        const articleId = sub.articleId ?? `${ID_PREFIX}-${CURRENT_YEAR}-${String(p.nextArticleNumber).padStart(5, "0")}`;
        const emails: EmailLogEntry[] = [];
        const notes: Notification[] = [];
        const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
        if (corr) emails.push(makeEmail(p, corr.email, "publication", `TLC Journal — Published — ${articleId}`, { id: articleId, title: sub.title, author: corr.fullName, date: nowIso() }));
        const auId = authorUserId(p, sub);
        if (auId) notes.push(notify(auId, `Your article "${sub.title}" is now published as ${articleId}.`, `/article/${articleId}`));
        return {
          ...p,
          nextArticleNumber: sub.articleId ? p.nextArticleNumber : p.nextArticleNumber + 1,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? { ...s, articleId, status: "published" as ArticleStatus, publishedAt: nowIso(), updatedAt: nowIso(), history: [...s.history, { status: "published" as ArticleStatus, date: nowIso(), by: who, note: `Published at /article/${articleId}.` }] }
              : s,
          ),
          emailLogs: [...p.emailLogs, ...emails],
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Article published", { submissionId: id, ref: articleId, prevStatus: sub.status, newStatus: "published" })],
        };
      });
      toast("Article published — permanent page is now live.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const unpublishSubmission = useCallback(
    (id: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? { ...s, status: "accepted" as ArticleStatus, updatedAt: nowIso(), history: [...s.history, { status: "accepted" as ArticleStatus, date: nowIso(), by: who, note: "Unpublished by editor." }] }
              : s,
          ),
          auditLog: [...p.auditLog, makeAudit(who, "Article unpublished", { submissionId: id, ref: sub ? subRef(sub) : undefined, prevStatus: "published", newStatus: "accepted" })],
        };
      });
      toast("Article withdrawn from the public journal.", "warn");
    },
    [currentUser, mutate, toast],
  );

  /* ---------------- withdrawal & corrections ---------------- */

  const withdraw = useCallback(
    (id: string, reason: string) => {
      const who = currentUser?.name ?? "Author";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const emails: EmailLogEntry[] = [];
        if (sub) {
          const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
          if (corr) emails.push(makeEmail(p, corr.email, "withdrawal", `TLC Journal — Withdrawn — ${subRef(sub)}`, { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() }));
        }
        return {
          ...p,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? { ...s, status: "withdrawn" as ArticleStatus, withdrawn: { by: who, date: nowIso(), reason }, updatedAt: nowIso(), history: [...s.history, { status: "withdrawn" as ArticleStatus, date: nowIso(), by: who, note: reason }] }
              : s,
          ),
          emailLogs: [...p.emailLogs, ...emails],
          auditLog: [...p.auditLog, makeAudit(who, "Submission withdrawn", { submissionId: id, ref: sub ? subRef(sub) : undefined, prevStatus: sub?.status, newStatus: "withdrawn", comment: reason })],
        };
      });
      toast("Withdrawal recorded. The scientific record is retained in the archive.", "warn");
    },
    [currentUser, mutate, toast],
  );

  const requestCorrection = useCallback(
    (id: string, description: string) => {
      const who = currentUser?.name ?? "Reader";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        const correction: Correction = { id: uid("cor"), requestedBy: who, date: nowIso(), description, status: "pending" };
        const notes: Notification[] = [];
        p.users.filter((u) => u.role === "editor" || u.role === "admin").forEach((u) =>
          notes.push(notify(u.id, `Correction requested for ${sub ? subRef(sub) : id}: "${description.slice(0, 70)}…"`, `/submission/${id}`)),
        );
        return {
          ...p,
          submissions: p.submissions.map((s) => (s.id === id ? { ...s, corrections: [...s.corrections, correction], updatedAt: nowIso() } : s)),
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(who, "Correction requested", { submissionId: id, ref: sub ? subRef(sub) : undefined, comment: description })],
        };
      });
      toast("Correction request submitted to the editorial office.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const decideCorrection = useCallback(
    (id: string, correctionId: string, approve: boolean, note: string) => {
      const who = currentUser?.name ?? "Editor";
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        return {
          ...p,
          submissions: p.submissions.map((s) => {
            if (s.id !== id) return s;
            return {
              ...s,
              correctedVersion: approve ? s.correctedVersion + 1 : s.correctedVersion,
              corrections: s.corrections.map((c) =>
                c.id === correctionId
                  ? { ...c, status: approve ? ("approved" as const) : ("rejected" as const), editorNote: note, approvedDate: approve ? nowIso() : undefined }
                  : c,
              ),
              updatedAt: nowIso(),
              history: approve
                ? [...s.history, { status: s.status, date: nowIso(), by: who, note: `Correction approved — version ${s.correctedVersion + 1} published.` }]
                : s.history,
            };
          }),
          auditLog: [...p.auditLog, makeAudit(who, approve ? "Correction approved" : "Correction rejected", { submissionId: id, ref: sub ? subRef(sub) : undefined, comment: note })],
        };
      });
      toast(approve ? "Correction approved — corrected version issued." : "Correction rejected.", approve ? "ok" : "warn");
    },
    [currentUser, mutate, toast],
  );

  /** Direct editorial message to the author (§10 "Message Author"). */
  const messageAuthor = useCallback(
    (id: string, subject: string, body: string) => {
      mutate((p) => {
        const sub = p.submissions.find((s) => s.id === id);
        if (!sub) return p;
        const corr = sub.authors.find((a) => a.corresponding) ?? sub.authors[0];
        const emails = corr ? [makeEmail(p, corr.email, "reviewDecision", subject, { id: subRef(sub), title: sub.title, author: corr.fullName, date: nowIso() })] : [];
        const notes: Notification[] = [];
        const auId = authorUserId(p, sub);
        if (auId) notes.push(notify(auId, `Message from the editorial office: "${subject}"`, `/submission/${id}`));
        return {
          ...p,
          emailLogs: [...p.emailLogs, ...emails],
          notifications: [...p.notifications, ...notes],
          auditLog: [...p.auditLog, makeAudit(currentUser?.name ?? "Editor", "Message sent to author", { submissionId: id, ref: subRef(sub), comment: subject })],
        };
      });
      toast("Message sent to the corresponding author.", "ok");
    },
    [currentUser, mutate, toast],
  );

  /* ---------------- notifications ---------------- */

  const markNotificationRead = useCallback(
    (nid: string) => {
      mutate((p) => ({ ...p, notifications: p.notifications.map((n) => (n.id === nid ? { ...n, read: true } : n)) }));
    },
    [mutate],
  );

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    mutate((p) => ({
      ...p,
      notifications: p.notifications.map((n) =>
        n.audience === currentUser.id || (n.audience === "staff" && currentUser.role !== "author") ? { ...n, read: true } : n,
      ),
    }));
  }, [currentUser, mutate]);

  /* ---------------- admin ---------------- */

  const updateSettings = useCallback(
    (patch: Partial<JournalSettings>) => {
      mutate((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
      toast("Journal settings saved.", "ok");
    },
    [mutate, toast],
  );

  const updateEmailTemplate = useCallback(
    (key: (typeof EMAIL_TEMPLATE_KEYS)[number], body: string) => {
      mutate((p) => ({
        ...p,
        settings: { ...p.settings, emailTemplates: { ...p.settings.emailTemplates, [key]: body } },
      }));
    },
    [mutate],
  );

  const updateUserRole = useCallback(
    (userId: string, role: Role) => {
      const who = currentUser?.name ?? "Admin";
      mutate((p) => ({
        ...p,
        users: p.users.map((u) => (u.id === userId ? { ...u, role } : u)),
        auditLog: [...p.auditLog, makeAudit(who, `User role changed to ${role}`, { comment: p.users.find((u) => u.id === userId)?.name })],
      }));
      toast("Role updated.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const addUser = useCallback(
    (name: string, email: string, password: string, role: Role): string | null => {
      if (state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        return "An account with this email already exists.";
      }
      const user: User = { id: uid("u"), name: name.trim(), email: email.trim(), password, role, createdAt: nowIso() };
      setState((p) => ({
        ...p,
        users: [...p.users, user],
        auditLog: [...p.auditLog, makeAudit(currentUser?.name ?? "Admin", "User account created", { comment: `${name} (${role})` })],
      }));
      toast(`${role[0].toUpperCase() + role.slice(1)} account created for ${name}.`, "ok");
      return null;
    },
    [currentUser, state.users, toast],
  );

  /* ---------------- expose ---------------- */

  const value: StoreShape = {
    ...state,
    currentUser,
    toasts,
    toast,
    dismissToast,
    login,
    logout,
    register,
    saveSubmission,
    deleteSubmission,
    setStatus,
    toggleChecklist,
    addComment,
    respondToComment,
    editorRespondToComment,
    toggleCommentResolved,
    nextArticleId,
    nextSubmissionId,
    submitToJournal,
    assignEditor,
    assignReviewer,
    toggleTechCheck,
    techCheckPass,
    techReturn,
    submitReview,
    decide,
    resubmitRevision,
    addFileVersion,
    enterProduction,
    toggleProductionItem,
    requestAuthorProof,
    authorApproveProof,
    authorRequestProofCorrection,
    publishSubmission,
    unpublishSubmission,
    withdraw,
    requestCorrection,
    decideCorrection,
    messageAuthor,
    markNotificationRead,
    markAllNotificationsRead,
    updateSettings,
    updateEmailTemplate,
    updateUserRole,
    addUser,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useStore(): StoreShape {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* One-A4-page length estimator                                        */
/* ------------------------------------------------------------------ */
export function estimatePagePct(s: Submission): number {
  let pts = 16; // masthead + margins + citation footer
  pts += Math.min(6, Math.ceil((s.title?.length ?? 0) / 45));
  pts += (s.authors?.length ?? 0) * 2.4;
  if (s.schemeImage) pts += 11;
  pts += Math.min(13, ((s.reactionDescription?.length ?? 0) / 62) * 2);
  pts += (s.lanes?.length ?? 0) * 1.3;
  pts += (s.visualization?.length ?? 0) * 2.4;
  pts += ((s.visualization ?? []).reduce((a, v) => a + (v.note?.length ?? 0), 0) / 90) * 2;
  pts += (s.interpretation?.rfValues?.length ?? 0) * 1.6;
  if (s.tlcImage) pts += 26;
  pts += Math.min(15, ((s.scientificInterpretation?.length ?? 0) / 60) * 2);
  pts += Math.min(5, ((s.keyObservation?.length ?? 0) / 70) * 2);
  pts += Math.min(12, ((s.tlcStory?.length ?? 0) / 62) * 2);
  if (s.includeProgress) pts += 4;
  return Math.max(6, Math.round(pts));
}

export function hasRole(role: Role | undefined, allowed: Role[]): boolean {
  return !!role && allowed.includes(role);
}

/* ------------------------------------------------------------------ */
/* Permissions (§38)                                                   */
/* ------------------------------------------------------------------ */

const normName = (x: string) => x.toLowerCase().replace(/\b(dr|prof|mr|ms|mrs)\.?\s+/g, "").trim();

/** True when the user may open the given submission. */
export function canSeeSubmission(user: User | null, s: Submission): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "editor") return true;
  if (user.role === "reviewer") return s.assignedReviewerId === user.id;
  // authors see only their own manuscripts
  const me = normName(user.name);
  return s.authors.some(
    (a) =>
      a.email.toLowerCase() === user.email.toLowerCase() ||
      (me.length > 2 && (normName(a.fullName).includes(me) || me.includes(normName(a.fullName)))),
  );
}

/** True when the user is on the author list of the submission. */
export function isAuthorOf(user: User | null, s: Submission): boolean {
  if (!user) return false;
  const me = normName(user.name);
  return s.authors.some(
    (a) =>
      a.email.toLowerCase() === user.email.toLowerCase() ||
      (me.length > 2 && (normName(a.fullName).includes(me) || me.includes(normName(a.fullName)))),
  );
}

/* keep patchSubmission referenced for future admin metadata edits */
export type { PatchFn };
type PatchFn = (id: string, patch: Partial<Submission>) => void;
