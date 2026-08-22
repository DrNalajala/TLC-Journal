import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../store/AppStore";
import ArticleSheet from "../components/ArticleSheet";
import MiniPlate from "../components/MiniPlate";
import {
  Btn, DemoTag, IAlert, IArrow, IDownload, IPlate, IQuote, IShare, IStamp,
  Modal, Reveal, StatusBadge, Tag,
} from "../components/ui";
import { JOURNAL_NAME } from "../data/constants";
import { citationBibtex, citationPlain, citationRis, copyText, downloadTextFile } from "../utils/citation";
import { downloadArticlePdf } from "../utils/pdf";

export default function ArticlePage() {
  const { id } = useParams();
  const { submissions, toast, currentUser, requestCorrection } = useStore();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [citeOpen, setCiteOpen] = useState(false);
  const [corrOpen, setCorrOpen] = useState(false);
  const [corrText, setCorrText] = useState("");

  const article = useMemo(
    () => submissions.find((s) => s.articleId === id),
    [submissions, id],
  );

  /* lightweight SEO per article */
  useEffect(() => {
    if (!article) return;
    document.title = `${article.title} — ${JOURNAL_NAME} ${article.articleId}`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", `${article.keyObservation} (${article.articleId})`);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      headline: article.title,
      author: article.authors.map((a) => ({ "@type": "Person", name: a.fullName })),
      datePublished: article.publishedAt,
      isPartOf: { "@type": "Periodical", name: JOURNAL_NAME },
      identifier: article.articleId,
      keywords: article.keywords.join(","),
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [article]);

  if (!article || (article.status !== "published" && article.status !== "withdrawn")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#a33327]">404 · Article not found</p>
        <h1 className="mt-3 font-display text-3xl font-black text-ink">No published article with ID "{id}"</h1>
        <p className="mt-2 text-[0.9rem] text-inksoft">
          The identifier may be unpublished, withdrawn, or mistyped. Browse the database for all live communications.
        </p>
        <Link to="/browse" className="mt-6 inline-flex items-center gap-2 border border-navy px-5 py-2.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.12em] text-navy hover:bg-navy hover:text-white">
          Browse TLCs <IArrow size={13} />
        </Link>
      </div>
    );
  }

  /* withdrawn articles keep their permanent URL but show the withdrawal record (§31) */
  if (article.status === "withdrawn") {
    return (
      <div className="graph-paper min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#a33327]">Article withdrawn</p>
          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">{article.title}</h1>
          <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-inkfaint">
            {article.articleId} · withdrawn {article.withdrawn?.date ?? "—"}
          </p>
          <div className="mx-auto mt-7 max-w-xl border-2 border-[#a33327] bg-[#faece9] px-6 py-5 text-left">
            <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#7c2b22]">Withdrawal notice</p>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-[#7c2b22]">
              <strong>Reason:</strong> {article.withdrawn?.reason ?? "—"}. Withdrawn by {article.withdrawn?.by ?? "the editorial office"}.
              The scientific record is retained in the journal archive and is never erased.
            </p>
          </div>
          <Link to="/browse" className="mt-8 inline-flex items-center gap-2 border border-navy px-5 py-2.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.12em] text-navy hover:bg-navy hover:text-white">
            Browse TLCs <IArrow size={13} />
          </Link>
        </div>
      </div>
    );
  }

  const approvedCorrections = article.corrections.filter((c) => c.status === "approved");

  const onPdf = async () => {
    setPdfBusy(true);
    try {
      await downloadArticlePdf(article);
      toast("One-page PDF generated and downloaded.", "ok");
    } catch {
      toast("PDF generation failed — please try again.", "bad");
    } finally {
      setPdfBusy(false);
    }
  };

  const onShare = async () => {
    const ok = await copyText(window.location.href);
    toast(ok ? "Permanent link copied to clipboard." : "Could not copy link.", ok ? "ok" : "bad");
  };

  const related = submissions
    .filter((s) => s.status === "published" && s.id !== article.id)
    .filter((s) => s.articleType === article.articleType || s.visualization.some((v) => article.visualization.some((w) => w.method === v.method)))
    .slice(0, 3);

  return (
    <div className="graph-paper min-h-screen pb-10">
      {/* article header band */}
      <div className="border-b border-line bg-sheet">
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-inkfaint">
              <Link to="/browse" className="hover:text-navy">Browse</Link>
              <span>/</span>
              <span>Vol. {article.volume}</span>
              <span>/</span>
              <span className="font-bold text-navy">{article.articleId}</span>
              <span className="ml-2"><StatusBadge status="published" /></span>
              {article.demo && <DemoTag />}
              <span className="border border-line bg-paper px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-inksoft">DOI: Not assigned</span>
              {article.correctedVersion > 1 && <Tag tone="amber">Corrected · Version {article.correctedVersion}</Tag>}
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-black leading-tight tracking-tight text-ink sm:text-[2.6rem]">
              {article.title}
            </h1>
            <p className="mt-3 text-[0.9rem] font-medium text-ink">
              {article.authors.map((a) => (
                <span key={a.id}>
                  {a.fullName}
                  {a.corresponding && <sup className="ml-0.5 text-uvdeep">*</sup>}
                  {", "}
                </span>
              ))}
            </p>
            <p className="mt-1 text-[0.78rem] italic text-inksoft">
              {[...new Set(article.authors.map((a) => [a.affiliation, a.city, a.country].filter(Boolean).join(", ")))].join(" · ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Tag tone="blue">{article.articleType}</Tag>
              {article.keywords.slice(0, 6).map((k) => (
                <span key={k} className="border border-line bg-paper px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-inksoft">{k}</span>
              ))}
            </div>

            {/* action bar */}
            <div className="mt-6 flex flex-wrap gap-2.5 border-y border-line py-3.5">
              <Btn onClick={onPdf} disabled={pdfBusy} size="sm">
                <IDownload size={14} /> {pdfBusy ? "Preparing PDF…" : "Download PDF"}
              </Btn>
              <Btn variant="outline" size="sm" onClick={() => setCiteOpen(true)}>
                <IQuote size={14} /> Cite
              </Btn>
              <Btn variant="ghost" size="sm" onClick={onShare}>
                <IShare size={14} /> Share
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setCertOpen(true)}>
                <IStamp size={14} /> Certificate
              </Btn>
              {currentUser && (
                <Btn variant="ghost" size="sm" onClick={() => setCorrOpen(true)}>
                  <IAlert size={14} /> Request correction
                </Btn>
              )}
              <span className="ml-auto hidden items-center font-mono text-[0.62rem] uppercase tracking-[0.1em] text-inkfaint sm:flex">
                Published {article.publishedAt} · CC BY 4.0
              </span>
            </div>

            {/* correction history — never silently altered (§30) */}
            {approvedCorrections.length > 0 && (
              <div className="mt-3 border-l-2 border-[#b45309] bg-[#faf3e0] px-3.5 py-2.5">
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#6d4a0d]">Correction history</p>
                {approvedCorrections.map((c) => (
                  <p key={c.id} className="mt-1 text-[0.78rem] leading-relaxed text-[#6d4a0d]">
                    <strong>Corrected version issued {c.approvedDate}</strong> — {c.description}
                    {c.editorNote ? <span className="italic"> (Editor: {c.editorNote})</span> : null}
                  </p>
                ))}
                <p className="mt-1.5 text-[0.68rem] italic text-[#8a5a12]">The original published version remains part of the scientific record.</p>
              </div>
            )}
          </Reveal>
        </div>
      </div>

      {/* the one-page sheet */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="border border-line shadow-[0_28px_70px_-35px_rgba(16,35,59,0.55)]">
            <ArticleSheet s={article} />
          </div>
          <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.14em] text-inkfaint">
            Standardized one-A4-page layout · lane labels refer to the photograph above
          </p>
        </Reveal>

        {/* schematic view */}
        <Reveal delay={100}>
          <div className="mt-10 grid gap-6 md:grid-cols-[240px_1fr]">
            <div className="border border-line bg-sheet p-4">
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-navy">Schematic view</p>
              <MiniPlate lanes={article.lanes} spots={article.spots} height={240} animate className="mt-2 w-full" />
              <p className="mt-1 text-[0.62rem] italic text-inkfaint">Machine-readable summary of lanes & spots.</p>
            </div>
            <div className="flex flex-col justify-center border border-line bg-navydeep p-6 text-[#f2f4f0] sm:p-8">
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-uv">Recommended citation</p>
              <p className="mt-3 font-display text-[1.05rem] italic leading-relaxed text-[#e6ecf3]">{citationPlain(article)}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Btn
                  variant="dark"
                  size="sm"
                  onClick={async () => {
                    const ok = await copyText(citationPlain(article));
                    toast(ok ? "Citation copied." : "Copy failed.", ok ? "ok" : "bad");
                  }}
                >
                  Copy citation
                </Btn>
                <Btn variant="dark" size="sm" onClick={() => downloadTextFile(`${article.articleId}.bib`, citationBibtex(article))}>
                  BibTeX
                </Btn>
                <Btn variant="dark" size="sm" onClick={() => downloadTextFile(`${article.articleId}.ris`, citationRis(article))}>
                  RIS
                </Btn>
              </div>
            </div>
          </div>
        </Reveal>

        {/* related */}
        {related.length > 0 && (
          <Reveal delay={120}>
            <div className="mt-12">
              <h2 className="font-display text-2xl font-bold text-ink">Related communications</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.id} to={`/article/${r.articleId}`} className="group border border-line bg-sheet p-4 transition-all hover:-translate-y-1 hover:shadow-lg">
                    <p className="font-mono text-[0.6rem] font-bold text-uvdeep">{r.articleId}</p>
                    <p className="mt-1.5 font-display text-[0.95rem] font-bold leading-snug text-ink group-hover:text-navy">{r.title}</p>
                    <p className="mt-1.5 text-[0.72rem] text-inksoft">{r.authors[0]?.fullName} · {r.publishedAt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {/* citation modal */}
      <Modal open={citeOpen} onClose={() => setCiteOpen(false)}>
        <div className="border-b border-line px-6 py-4">
          <h3 className="font-display text-xl font-bold text-ink">Cite this communication</h3>
        </div>
        <div className="space-y-4 px-6 py-5">
          {[
            ["Plain text", citationPlain(article)],
            ["BibTeX", citationBibtex(article)],
            ["RIS", citationRis(article)],
          ].map(([label, text]) => (
            <div key={label as string}>
              <div className="flex items-center justify-between">
                <span className="field-label">{label}</span>
                <button
                  className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] text-navy hover:text-uvdeep"
                  onClick={async () => {
                    const ok = await copyText(text as string);
                    toast(ok ? `${label} copied.` : "Copy failed.", ok ? "ok" : "bad");
                  }}
                >
                  Copy
                </button>
              </div>
              <pre className="scrollbar-slim mt-1.5 overflow-x-auto whitespace-pre-wrap border border-line bg-paper p-3 font-mono text-[0.7rem] leading-relaxed text-ink">{text}</pre>
            </div>
          ))}
        </div>
      </Modal>

      {/* certificate modal (printable) */}
      <Modal open={certOpen} onClose={() => setCertOpen(false)} wide>
        <div className="print-area border-[6px] border-double border-navy bg-white p-8 sm:p-12">
          <div className="text-center">
            <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.3em] text-uvdeep">{JOURNAL_NAME}</p>
            <h3 className="mt-3 font-display text-4xl font-black tracking-tight text-ink">Certificate of Publication</h3>
            <div className="masthead-rule mx-auto mt-4 w-40" />
          </div>
          <div className="mx-auto mt-8 max-w-xl text-center">
            <p className="text-[0.85rem] text-inksoft">This certifies that the practical TLC communication</p>
            <p className="mt-3 font-display text-xl font-bold italic text-navy">"{article.title}"</p>
            <p className="mt-4 text-[0.85rem] text-inksoft">by</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">{article.authors.map((a) => a.fullName).join(", ")}</p>
            <p className="mt-4 text-[0.85rem] leading-relaxed text-inksoft">
              has passed technical check and editorial review and is published in {JOURNAL_NAME},
              Volume {article.volume}, with the article identifier
            </p>
            <p className="mt-2 font-mono text-lg font-bold tracking-[0.1em] text-navy">{article.articleId}</p>
            <p className="mt-2 text-[0.8rem] text-inkfaint">Published {article.publishedAt}</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-8 text-center">
            <div>
              <p className="font-display text-lg italic text-ink">T. Richter</p>
              <div className="border-t border-ink pt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-inksoft">Handling editor</div>
            </div>
            <div>
              <p className="font-display text-lg italic text-ink">E. Marsh</p>
              <div className="border-t border-ink pt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-inksoft">Editor-in-chief</div>
            </div>
          </div>
          {article.demo && (
            <p className="mt-6 text-center font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#a33327]">
              Demo certificate — not a real experiment
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4 print:hidden">
          <Btn variant="ghost" onClick={() => setCertOpen(false)}>Close</Btn>
          <Btn onClick={() => window.print()}><IStamp size={14} /> Print certificate</Btn>
        </div>
      </Modal>

      {/* correction request modal (§30) */}
      <Modal open={corrOpen} onClose={() => setCorrOpen(false)}>
        <div className="px-6 py-5">
          <h3 className="font-display text-xl font-bold text-ink">Request a correction</h3>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-inksoft">
            Published records are never silently altered. Your request goes to the editorial office;
            if approved, a corrected version is issued and the correction is logged in the article's history.
          </p>
          <textarea
            rows={4}
            className="field-input mt-3 resize-y"
            placeholder="Describe the error precisely — e.g. 'The mobile phase ratio should read 40:60, not 30:70.'"
            value={corrText}
            onChange={(e) => setCorrText(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setCorrOpen(false)}>Cancel</Btn>
            <Btn
              variant="accent"
              disabled={corrText.trim().length < 10}
              onClick={() => {
                requestCorrection(article.id, corrText.trim());
                setCorrText("");
                setCorrOpen(false);
              }}
            >
              Submit correction request
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
