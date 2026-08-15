import type { Submission } from "../types";
import { JOURNAL_NAME } from "../data/constants";

function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((p) => `${p[0].toUpperCase()}.`)
    .join(" ");
  return `${last}, ${initials}`;
}

export function authorsCitation(s: Submission): string {
  return s.authors.map((a) => shortName(a.fullName)).join("; ");
}

export function citationPlain(s: Submission): string {
  const year = (s.publishedAt || s.updatedAt || "").slice(0, 4) || "2026";
  return `${authorsCitation(s)} ${s.title}. ${JOURNAL_NAME}. ${year};${s.volume}:${s.articleId ?? "in press"}.`;
}

export function citationBibtex(s: Submission): string {
  const year = (s.publishedAt || "").slice(0, 4) || "2026";
  const key = `tlcj${year}${(s.articleId ?? "").replace(/\D/g, "")}`;
  const authorField = s.authors.map((a) => shortName(a.fullName).replace(", ", ", ")).join(" and ");
  return [
    `@article{${key},`,
    `  title    = {${s.title}},`,
    `  author   = {${authorField}},`,
    `  journal  = {${JOURNAL_NAME}},`,
    `  year     = {${year}},`,
    `  volume   = {${s.volume}},`,
    `  pages    = {Article ${s.articleId ?? "in press"}},`,
    `  note     = {Practical TLC Communication}`,
    `}`,
  ].join("\n");
}

export function citationRis(s: Submission): string {
  const year = (s.publishedAt || "").slice(0, 4) || "2026";
  const lines = ["TY  - JOUR"];
  lines.push(`TI  - ${s.title}`);
  s.authors.forEach((a) => lines.push(`AU  - ${shortName(a.fullName)}`));
  lines.push(`JO  - ${JOURNAL_NAME}`);
  lines.push(`PY  - ${year}`);
  lines.push(`VL  - ${s.volume}`);
  lines.push(`ID  - ${s.articleId ?? "in press"}`);
  lines.push("N1  - Practical TLC Communication");
  lines.push("ER  - ");
  return lines.join("\n");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function downloadTextFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
