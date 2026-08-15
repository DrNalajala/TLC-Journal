import type { Submission } from "../types";
import { JOURNAL_NAME, JOURNAL_SUBTITLE } from "../data/constants";
import { DotScale, DemoTag } from "./ui";

/**
 * The standardized ONE-A4-PAGE article layout. Rendered identically for
 * the live preview in the submission editor, the public article page and
 * (structurally) the generated PDF.
 */
export default function ArticleSheet({ s, compact = false }: { s: Submission; compact?: boolean }) {
  const imgH = compact ? "max-h-52" : "max-h-[420px]";
  return (
    <article className="bg-white">
      {/* masthead */}
      <header className={`border-b-2 border-ink px-6 pb-3 pt-5 ${compact ? "" : "sm:px-10"}`}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-display text-xl font-black tracking-tight text-ink">{JOURNAL_NAME.toUpperCase()}</div>
            <div className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-inksoft">{JOURNAL_SUBTITLE}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[0.72rem] font-bold text-navy">{s.articleId ?? "IN PRESS"}</div>
            <div className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-inkfaint">
              Vol. {s.volume} · Practical TLC Communication
            </div>
          </div>
        </div>
        <div className="masthead-rule mt-2" />
      </header>

      <div className={`px-6 py-5 ${compact ? "" : "sm:px-10"}`}>
        {s.demo && (
          <div className="mb-3"><DemoTag /></div>
        )}
        <h1 className={`font-display font-black leading-tight tracking-tight text-ink ${compact ? "text-xl" : "text-2xl sm:text-[1.7rem]"}`}>
          {s.title || "Untitled TLC communication"}
        </h1>
        <p className="mt-2 text-[0.85rem] font-medium text-ink">
          {s.authors.map((a) => a.fullName).join(", ") || "—"}
        </p>
        <p className="mt-0.5 text-[0.72rem] italic text-inksoft">
          {[...new Set(s.authors.map((a) => [a.affiliation || a.institution, a.city, a.country].filter(Boolean).join(", ")))].join(" · ") || "—"}
        </p>

        <SectionLabel n="1" t="Reaction Scheme" />
        {s.schemeImage ? (
          <div className="border border-line bg-white p-3">
            <img src={s.schemeImage} alt="Reaction scheme" className="mx-auto max-h-40 object-contain" />
          </div>
        ) : (
          <p className="text-[0.8rem] italic text-inkfaint">No scheme provided.</p>
        )}

        <SectionLabel n="2" t="Reaction" />
        <p className={`text-justify leading-relaxed text-ink ${compact ? "text-[0.72rem]" : "text-[0.84rem]"}`}>
          {s.reactionDescription || "—"}
        </p>

        <SectionLabel n="3" t="TLC Conditions" />
        <dl className={`grid gap-x-6 gap-y-1 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
          <CondRow k="Stationary phase" v={[s.plateType, s.plateManufacturer].filter(Boolean).join(" — ") || "—"} />
          <CondRow k="Plate size" v={s.plateDimensions || "—"} />
          <CondRow
            k="Mobile phase"
            v={s.mobilePhase.length ? s.mobilePhase.map((m) => `${m.solvent} : ${m.parts}`).join(", ") : "—"}
          />
          <CondRow k="Chamber" v={s.chamberCondition || "—"} />
        </dl>
        <p className="mt-1.5 text-[0.72rem] text-inksoft">
          <span className="font-semibold text-navy">Sample lanes: </span>
          {s.lanes.map((l, i) => `${i + 1}. ${l.label}`).join(" · ") || "—"}
        </p>

        <SectionLabel n="4" t="TLC Photograph (original)" />
        <figure>
          <div className="border border-line bg-[#101608] p-2">
            {s.tlcImage ? (
              <img
                src={s.tlcImage}
                alt="Original TLC photograph"
                className={`mx-auto w-auto object-contain ${imgH}`}
                style={{ transform: `rotate(${s.rotate}deg)` }}
              />
            ) : (
              <div className="grid h-40 place-items-center font-mono text-[0.7rem] uppercase tracking-widest text-[#8a9a66]">
                Original photograph pending
              </div>
            )}
          </div>
          {s.lanes.length > 0 && (
            <figcaption className="mt-1.5 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(s.lanes.length, 6)}, minmax(0,1fr))` }}>
              {s.lanes.slice(0, 6).map((l, i) => (
                <span key={l.id} className="border-t-2 border-ink/60 pt-1 text-center font-mono text-[0.56rem] uppercase tracking-[0.06em] text-inksoft">
                  {i + 1} · {l.label}
                </span>
              ))}
            </figcaption>
          )}
        </figure>

        <SectionLabel n="5" t="Visualization" />
        {s.visualization.length ? (
          <ol className="space-y-1.5">
            {s.visualization.map((v, i) => (
              <li key={v.id} className="flex gap-2.5 text-[0.78rem] leading-relaxed text-ink">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border border-navy font-mono text-[0.62rem] font-bold text-navy">
                  {i + 1}
                </span>
                <span>
                  <strong className="text-navy">{v.method}.</strong> {v.note || <span className="italic text-inkfaint">No note given.</span>}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[0.8rem] italic text-inkfaint">Not reported.</p>
        )}

        <SectionLabel n="6" t="TLC Interpretation" />
        <p className={`text-justify leading-relaxed text-ink ${compact ? "text-[0.72rem]" : "text-[0.82rem]"}`}>
          {s.scientificInterpretation || "—"}
        </p>
        {s.interpretation.rfValues.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {s.interpretation.rfValues.map((r) => (
              <span key={r.id} className="border border-line bg-sky px-2 py-0.5 font-mono text-[0.66rem] text-navy">
                {r.label}: Rf {r.value !== null ? r.value.toFixed(2) : "—"}
              </span>
            ))}
          </div>
        )}
        {(s.interpretation.smSpot || s.interpretation.productSpot || s.interpretation.reactionStatus) && (
          <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-inksoft">
            SM spot: <b className="text-ink">{s.interpretation.smSpot || "—"}</b> · Product spot:{" "}
            <b className="text-ink">{s.interpretation.productSpot || "—"}</b> · Additional:{" "}
            <b className="text-ink">{s.interpretation.additionalSpots || "—"}</b> · Status:{" "}
            <b className="text-navy">{s.interpretation.reactionStatus || "—"}</b>
          </p>
        )}

        {s.includeProgress && (
          <>
            <SectionLabel n="7" t="Reaction Progress (visual estimate)" />
            <div className="border border-line bg-paper px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                <span className="flex items-center gap-2.5">
                  <span className="w-28 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-inksoft">Starting material</span>
                  <DotScale value={s.progressSM} readOnly />
                </span>
                <span className="font-display text-lg text-navy">→</span>
                <span className="flex items-center gap-2.5">
                  <span className="w-28 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-inksoft">Product</span>
                  <DotScale value={s.progressProduct} readOnly />
                </span>
              </div>
              <p className="mt-2 text-[0.62rem] italic leading-snug text-inkfaint">
                TLC intensity is generally qualitative or semi-quantitative and should not automatically be
                interpreted as a quantitative measure of reaction conversion. {s.progressNote}
              </p>
            </div>
          </>
        )}

        <SectionLabel n={s.includeProgress ? "8" : "7"} t="Key Observation" />
        <p className="border-l-[3px] border-uvdeep bg-uvglow/40 px-3.5 py-2.5 text-[0.82rem] font-medium leading-relaxed text-ink">
          {s.keyObservation || "—"}
        </p>

        {s.tlcStory && (
          <>
            <SectionLabel n={s.includeProgress ? "9" : "8"} t="The TLC Story" />
            <p className="font-display text-[0.92rem] italic leading-relaxed text-navy">
              "{s.tlcStory}"
            </p>
          </>
        )}

        {/* citation footer */}
        <footer className="mt-6 border-t-2 border-ink pt-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.62rem] text-inksoft">
            <span>
              {JOURNAL_NAME} {s.publishedAt ? s.publishedAt.slice(0, 4) : "2026"};{s.volume}:{s.articleId ?? "in press"}
            </span>
            {s.publishedAt && <span>Published {s.publishedAt}</span>}
          </div>
          {s.keywords.length > 0 && (
            <div className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-inkfaint">
              Keywords: {s.keywords.join(" · ")}
            </div>
          )}
        </footer>
      </div>
    </article>
  );
}

function SectionLabel({ n, t }: { n: string; t: string }) {
  return (
    <h2 className="mb-1.5 mt-4 flex items-center gap-2.5">
      <span className="grid h-5 w-5 place-items-center bg-navy font-mono text-[0.62rem] font-bold text-[#f2f4f0]">{n}</span>
      <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-navy">{t}</span>
      <span className="h-px flex-1 bg-line" />
    </h2>
  );
}

function CondRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2 text-[0.76rem]">
      <dt className="w-32 shrink-0 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-inksoft">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}
