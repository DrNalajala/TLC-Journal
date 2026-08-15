import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ArticleStatus, ReviewComment, Role, StatusEvent, Submission, User } from "../types";
import { DEMO_USERS, SEED_SUBMISSIONS } from "../data/seed";
import { CURRENT_YEAR, ID_PREFIX } from "../data/constants";

const STORE_KEY = "tlcj-store-v3";

export interface Toast {
  id: number;
  text: string;
  kind: "ok" | "warn" | "bad";
}

interface PersistedState {
  users: User[];
  submissions: Submission[];
  currentUserId: string | null;
  nextArticleNumber: number;
}

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
  acceptSubmission: (id: string) => void;
  publishSubmission: (id: string) => void;
  unpublishSubmission: (id: string) => void;
  nextArticleId: () => string;
}

const AppStoreContext = createContext<StoreShape | null>(null);

function loadInitial(): PersistedState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && Array.isArray(parsed.submissions) && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch {
    /* corrupted state — reseed */
  }
  return {
    users: DEMO_USERS,
    submissions: SEED_SUBMISSIONS,
    currentUserId: null,
    nextArticleNumber: 6,
  };
}

const nowIso = () => new Date().toISOString().slice(0, 10);

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
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
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

  const login = useCallback(
    (email: string, password: string): string | null => {
      const user = state.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );
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

  const patchSubmission = useCallback(
    (id: string, patch: Partial<Submission>) => {
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id ? { ...s, ...patch, updatedAt: nowIso() } : s,
        ),
      }));
    },
    [mutate],
  );

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
      mutate((p) => ({ ...p, submissions: p.submissions.filter((s) => s.id !== id) }));
      toast("Submission deleted.", "warn");
    },
    [mutate, toast],
  );

  const setStatus = useCallback(
    (id: string, status: ArticleStatus, note?: string) => {
      const who = currentUser ? currentUser.name : "System";
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) => {
          if (s.id !== id) return s;
          const event: StatusEvent = { status, date: nowIso(), by: who, note };
          const next: Submission = {
            ...s,
            status,
            updatedAt: nowIso(),
            history: [...s.history, event],
          };
          if (status === "submitted" || status === "resubmitted") {
            next.submittedAt = next.submittedAt || nowIso();
          }
          return next;
        }),
      }));
    },
    [currentUser, mutate],
  );

  const toggleChecklist = useCallback(
    (id: string, key: string) => {
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id
            ? { ...s, checklist: { ...s.checklist, [key]: !s.checklist[key] }, updatedAt: nowIso() }
            : s,
        ),
      }));
    },
    [mutate],
  );

  const addComment = useCallback(
    (id: string, section: string, text: string) => {
      if (!currentUser) return;
      const comment: ReviewComment = {
        id: `c-${Date.now()}`,
        byName: currentUser.name,
        byRole: currentUser.role,
        section,
        text,
        date: nowIso(),
      };
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id ? { ...s, comments: [...s.comments, comment], updatedAt: nowIso() } : s,
        ),
      }));
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
            ? {
                ...s,
                comments: s.comments.map((c) =>
                  c.id === commentId ? { ...c, authorResponse: response } : c,
                ),
                updatedAt: nowIso(),
              }
            : s,
        ),
      }));
      toast("Response recorded.", "ok");
    },
    [mutate, toast],
  );

  const nextArticleId = useCallback(() => {
    return `${ID_PREFIX}-${CURRENT_YEAR}-${String(state.nextArticleNumber).padStart(5, "0")}`;
  }, [state.nextArticleNumber]);

  const acceptSubmission = useCallback(
    (id: string) => {
      const who = currentUser ? currentUser.name : "Editor";
      mutate((p) => {
        const num = p.nextArticleNumber;
        const articleId = `${ID_PREFIX}-${CURRENT_YEAR}-${String(num).padStart(5, "0")}`;
        return {
          ...p,
          nextArticleNumber: num + 1,
          submissions: p.submissions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  articleId,
                  status: "accepted" as ArticleStatus,
                  updatedAt: nowIso(),
                  history: [
                    ...s.history,
                    {
                      status: "accepted" as ArticleStatus,
                      date: nowIso(),
                      by: who,
                      note: `Article identifier ${articleId} assigned.`,
                    },
                  ],
                }
              : s,
          ),
        };
      });
      toast("Accepted — article identifier assigned.", "ok");
    },
    [currentUser, mutate, toast],
  );

  const publishSubmission = useCallback(
    (id: string) => {
      const who = currentUser ? currentUser.name : "Editor";
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) => {
          if (s.id !== id) return s;
          const articleId =
            s.articleId ??
            `${ID_PREFIX}-${CURRENT_YEAR}-${String(p.nextArticleNumber).padStart(5, "0")}`;
          return {
            ...s,
            articleId,
            status: "published" as ArticleStatus,
            publishedAt: nowIso(),
            updatedAt: nowIso(),
            history: [
              ...s.history,
              { status: "published" as ArticleStatus, date: nowIso(), by: who },
            ],
          };
        }),
        nextArticleNumber:
          state.nextArticleNumber + (state.submissions.find((s) => s.id === id)?.articleId ? 0 : 1),
      }));
      toast("Article published — permanent page is now live.", "ok");
    },
    [currentUser, mutate, state.nextArticleNumber, state.submissions, toast],
  );

  const unpublishSubmission = useCallback(
    (id: string) => {
      const who = currentUser ? currentUser.name : "Editor";
      mutate((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "accepted" as ArticleStatus,
                updatedAt: nowIso(),
                history: [
                  ...s.history,
                  { status: "accepted" as ArticleStatus, date: nowIso(), by: who, note: "Unpublished by editor." },
                ],
              }
            : s,
        ),
      }));
      toast("Article withdrawn from the public journal.", "warn");
    },
    [currentUser, mutate, toast],
  );

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
    acceptSubmission,
    publishSubmission,
    unpublishSubmission,
    nextArticleId,
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
