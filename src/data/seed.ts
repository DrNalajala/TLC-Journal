import type { Submission, User } from "../types";

/**
 * Seed data.
 *
 * The journal starts with ZERO communications — no pre-loaded articles.
 * Everything published on TLC Journal comes from real submissions made
 * through the platform.
 *
 * Demonstration accounts are provided only so the editorial workflow
 * (author → reviewer → editor → admin) can be exercised.
 */

export const DEMO_USERS: User[] = [
  {
    id: "u-admin",
    name: "Dr. Elena Marsh",
    email: "admin@tlcjournal.org",
    password: "tlc-demo",
    role: "admin",
    affiliation: "Editorial Office, TLC Journal",
    createdAt: "2026-01-01",
  },
  {
    id: "u-editor",
    name: "Prof. Tomás Richter",
    email: "editor@tlcjournal.org",
    password: "tlc-demo",
    role: "editor",
    affiliation: "Editorial Office, TLC Journal",
    createdAt: "2026-01-01",
  },
  {
    id: "u-reviewer",
    name: "Dr. Kenji Sato",
    email: "reviewer@tlcjournal.org",
    password: "tlc-demo",
    role: "reviewer",
    affiliation: "Editorial Office, TLC Journal",
    createdAt: "2026-01-01",
  },
  {
    id: "u-author",
    name: "Dr. Amara Osei",
    email: "author@tlcjournal.org",
    password: "tlc-demo",
    role: "author",
    affiliation: "Department of Chemistry",
    createdAt: "2026-01-01",
  },
];

/** No pre-loaded communications. The journal is empty at launch. */
export const SEED_SUBMISSIONS: Submission[] = [];
