import { jsPDF } from "jspdf";
import type { Submission } from "../types";
import { JOURNAL_NAME, JOURNAL_SUBTITLE } from "../data/constants";
import { citationPlain } from "./citation";

const PAGE_W = 210;
const M = 14;
const CW = PAGE_W - M * 2;
const BOTTOM = 281;

async function toDataUrl(src: string): Promise<{ data: string; format: "PNG" | "JPEG" } | null> {
  if (!src) return null;
  if (src.startsWith("data:")) {
    const format: "PNG" | "JPEG" = src.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
    return { data: src, format };
  }
  try {
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    const data = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    const format: "PNG" | "JPEG" = blob.type.includes("jpeg") ? "JPEG" : "PNG";
    return { data, format };
  } catch {
    return null;
  }
}

export async function downloadArticlePdf(s: Submission): Promise<boolean> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ink: [number, number, number] = [16, 35, 59];
  const soft: [number, number, number] = [68, 88, 110];
  const accent: [number, number, number] = [29, 92, 156];

  let y = M + 2;

  /* masthead */
  doc.setFont("times", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...ink);
  doc.text(JOURNAL_NAME.toUpperCase(), M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...soft);
  doc.text(JOURNAL_SUBTITLE, M, y + 4.4);
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...accent);
  doc.text(s.articleId ?? "IN PRESS", PAGE_W - M, y, { align: "right" });
  doc.setFont("courier", "normal");
  doc.setFontSize(6.8);
  doc.text(`Vol. ${s.volume} · Practical TLC Communication`, PAGE_W - M, y + 4.4, { align: "right" });
  y += 7.5;
  doc.setDrawColor(...ink);
  doc.setLineWidth(0.7);
  doc.line(M, y, PAGE_W - M, y);
  doc.setLineWidth(0.25);
  doc.line(M, y + 1.1, PAGE_W - M, y + 1.1);
  y += 6.5;

  if (s.demo) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(179, 56, 44);
    doc.text("DEMO ARTICLE — NOT A REAL EXPERIMENT", PAGE_W / 2, y, { align: "center" });
    y += 4.5;
  }

  /* title + authors */
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...ink);
  const titleLines = doc.splitTextToSize(s.title, CW);
  doc.text(titleLines, M, y);
  y += titleLines.length * 5.6 + 1.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...ink);
  doc.text(
    doc.splitTextToSize(s.authors.map((a) => a.fullName).join(", "), CW),
    M,
    y,
  );
  y += 4.2;
  doc.setFontSize(7.5);
  doc.setTextColor(...soft);
  const aff = s.authors
    .map((a) => [a.affiliation, a.institution, a.city, a.country].filter(Boolean).join(", "))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(" · ");
  doc.text(doc.splitTextToSize(aff, CW), M, y);
  y += 6;

  const section = (label: string) => {
    if (y > BOTTOM - 10) return false;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...accent);
    doc.text(label.toUpperCase(), M, y);
    doc.setLineWidth(0.2);
    doc.setDrawColor(...accent);
    const w = doc.getTextWidth(label.toUpperCase());
    doc.line(M + w + 2, y - 0.8, PAGE_W - M, y - 0.8);
    y += 3.8;
    return true;
  };

  const body = (text: string, size = 8.2, maxLines = 8) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...ink);
    const lines = doc.splitTextToSize(text, CW).slice(0, maxLines);
    if (y + lines.length * 3.6 > BOTTOM) return;
    doc.text(lines, M, y);
    y += lines.length * 3.6 + 1.4;
  };

  /* reaction scheme */
  if (s.schemeImage && section("Reaction Scheme")) {
    const img = await toDataUrl(s.schemeImage);
    if (img) {
      const w = Math.min(CW * 0.72, 128);
      const h = w * (480 / 1200);
      if (y + h < BOTTOM) {
        try {
          doc.addImage(img.data, img.format, (PAGE_W - w) / 2, y, w, h);
          y += h + 3;
        } catch {
          body("[Reaction scheme available in the online version]", 7.5);
        }
      }
    }
  }

  if (s.reactionDescription && section("Reaction")) {
    body(s.reactionDescription, 8, 6);
  }

  /* TLC conditions + photograph side by side */
  if (section("TLC Conditions & Photograph")) {
    const img = await toDataUrl(s.tlcImage);
    const imgW = 52;
    const imgH = img ? imgW * (1040 / 840) : 0;
    const textX = M;
    const textW = CW - imgW - 8;
    const y0 = y;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...ink);
    const rows: [string, string][] = [
      ["Stationary phase", [s.plateType, s.plateManufacturer].filter(Boolean).join(" — ") || "—"],
      ["Plate size", s.plateDimensions || "—"],
      [
        "Mobile phase",
        s.mobilePhase.length
          ? s.mobilePhase.map((m) => `${m.solvent} ${m.parts}`).join(" : ")
          : "—",
      ],
      ["Chamber", s.chamberCondition || "—"],
      ["Lanes", s.lanes.map((l, i) => `${i + 1}. ${l.label}`).join("  ") || "—"],
    ];
    for (const [k, v] of rows) {
      if (y > BOTTOM - 6) break;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accent);
      doc.text(`${k}:`, textX, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...ink);
      const vLines = doc.splitTextToSize(v, textW - 28);
      doc.text(vLines, textX + 27, y);
      y += Math.max(1, vLines.length) * 3.4 + 0.6;
    }
    if (img) {
      try {
        doc.addImage(img.data, img.format, PAGE_W - M - imgW, y0, imgW, Math.min(imgH, BOTTOM - y0 - 6));
        doc.setFont("courier", "normal");
        doc.setFontSize(5.8);
        doc.setTextColor(...soft);
        doc.text(
          s.lanes.map((l, i) => `${i + 1}:${l.label}`).join(" "),
          PAGE_W - M - imgW,
          y0 + Math.min(imgH, BOTTOM - y0 - 6) + 3,
        );
      } catch {
        /* fall through to text-only */
      }
    }
    y = Math.max(y, y0 + (img ? Math.min(imgH, BOTTOM - y0 - 6) + 5 : 0)) + 2;
  }

  /* visualization sequence */
  if (s.visualization.length && section("Visualization Sequence")) {
    s.visualization.forEach((v, i) => {
      if (y > BOTTOM - 8) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...ink);
      doc.text(`${i + 1}. ${v.method}`, M, y);
      if (v.note) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...soft);
        const noteLines = doc.splitTextToSize(v.note, CW - 8);
        doc.text(noteLines, M + 4, y + 3.4);
        y += noteLines.length * 3.2;
      }
      y += 4.2;
    });
  }

  /* interpretation + Rf */
  if (s.scientificInterpretation && section("TLC Interpretation")) {
    body(s.scientificInterpretation, 8, 7);
    if (s.interpretation.rfValues.length) {
      doc.setFont("courier", "normal");
      doc.setFontSize(7.4);
      doc.setTextColor(...ink);
      const rfLine = s.interpretation.rfValues
        .map((r) => `${r.label}: Rf ${r.value?.toFixed(2) ?? "—"}`)
        .join("   ");
      doc.text(doc.splitTextToSize(rfLine, CW), M, y);
      y += Math.ceil(rfLine.length / 95) * 3.4 + 2;
    }
  }

  if (s.keyObservation && section("Key Observation")) {
    body(s.keyObservation, 8, 3);
  }

  /* footer */
  doc.setDrawColor(...ink);
  doc.setLineWidth(0.4);
  doc.line(M, 286, PAGE_W - M, 286);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...soft);
  const cite = citationPlain(s);
  doc.text(doc.splitTextToSize(cite, CW), M, 289.5);
  doc.setFont("courier", "normal");
  doc.text(
    `${s.publishedAt ? `Published ${s.publishedAt}` : "Pre-publication proof"} · ${JOURNAL_NAME} · One-page TLC Communication`,
    PAGE_W - M,
    293,
    { align: "right" },
  );

  doc.save(`${s.articleId ?? "tlc-submission"}.pdf`);
  return true;
}
