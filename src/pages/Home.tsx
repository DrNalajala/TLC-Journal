import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/AppStore";
import MiniPlate from "../components/MiniPlate";
import { IArrow, IDoc, IDrop, IEye, IPlate, IUV, Reveal, StatusBadge, Tag } from "../components/ui";
import { JOURNAL_MOTTO } from "../data/constants";

/* animated developing chamber — the journal's signature object */
function DevelopingChamber() {
  const spots = [
    { x: 105, rf: 0.62, d: 3.4, r: 7 },
    { x: 150, rf: 0.62, d: 3.8, r: 5 },
    { x: 150, rf: 0.38, d: 4.6, r: 7 },
    { x: 195, rf: 0.38, d: 5.2, r: 9 },
    { x: 195, rf: 0.62, d: 5.6, r: 4 },
  ];
  const baseline = 286;
  const topY = 128;
  return (
    <div className="relative">
      {/* floating chips */}
      <div className="anim-drift absolute -left-3 top-8 z-10 hidden border border-line bg-sheet px-2.5 py-1.5 font-mono text-[0.62rem] font-semibold tracking-[0.1em] text-navy shadow-md sm:block">
        Rf = 0.38
      </div>
      <div className="anim-drift absolute -right-2 top-24 z-10 hidden border border-line bg-sheet px-2.5 py-1.5 font-mono text-[0.62rem] font-semibold tracking-[0.1em] text-uvdeep shadow-md sm:block" style={{ animationDelay: "1.4s" }}>
        UV 254 nm
      </div>
      <div className="anim-drift absolute -left-5 bottom-16 z-10 hidden border border-line bg-sheet px-2.5 py-1.5 font-mono text-[0.62rem] font-semibold tracking-[0.1em] text-iodine shadow-md sm:block" style={{ animationDelay: "2.2s" }}>
        I₂ → new spot
      </div>

      <svg viewBox="0 0 300 400" className="mx-auto w-full max-w-[400px]" role="img" aria-label="Animated TLC developing chamber">
        <defs>
          <linearGradient id="chamberGlass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dfe8ee" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f4f8fa" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#cfdbe3" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="solventG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8edb8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d8e29a" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="uvGlow" cx="0.5" cy="0.45" r="0.65">
            <stop offset="0%" stopColor="#8fd14f" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8fd14f" stopOpacity="0" />
          </radialGradient>
          <filter id="softSpot" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* chamber body */}
        <rect x="38" y="42" width="224" height="322" rx="14" fill="url(#chamberGlass)" stroke="#9db1c7" strokeWidth="1.6" />
        <rect x="30" y="30" width="240" height="16" rx="6" fill="#b9c8d4" stroke="#8ea2b5" strokeWidth="1.4" />
        <rect x="44" y="50" width="8" height="306" rx="4" fill="#ffffff" opacity="0.45" />

        {/* solvent pool */}
        <path d="M48 330 Q 90 322 150 330 T 252 330 L 252 352 Q 252 358 246 358 L 54 358 Q 48 358 48 352 Z" fill="#c9d8e6" opacity="0.8" />
        <path d="M48 330 Q 90 322 150 330 T 252 330" fill="none" stroke="#8ea2b5" strokeWidth="1.2" />

        {/* plate */}
        <g>
          <rect x="78" y="74" width="144" height="230" rx="4" fill="#ccd6a2" stroke="#8a9a66" strokeWidth="1.4" />
          <rect x="78" y="74" width="144" height="230" rx="4" fill="url(#uvGlow)" className="anim-uvpulse" />
          {/* baseline */}
          <line x1="86" y1={baseline} x2="214" y2={baseline} stroke="#5c684a" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* lane pencil marks */}
          {[105, 150, 195].map((x) => (
            <line key={x} x1={x - 9} y1={baseline + 5} x2={x + 9} y2={baseline + 5} stroke="#77855c" strokeWidth="1" />
          ))}

          {/* rising solvent front + wet zone */}
          <g className="anim-solvent">
            <rect x="80" y={topY + 22} width="140" height={baseline - topY - 22} fill="url(#solventG)" />
            <line x1="82" y1={topY + 22} x2="218" y2={topY + 22} stroke="#6f7f4d" strokeWidth="1.6" />
          </g>

          {/* spots appear as development proceeds */}
          {spots.map((s, i) => {
            const cy = baseline - s.rf * (baseline - topY - 30);
            return (
              <g key={i} className="anim-spot" style={{ animationDelay: `${s.d}s` }}>
                <ellipse cx={s.x} cy={cy} rx={s.r * 1.4} ry={s.r * 1.1} fill="#20280f" opacity="0.5" filter="url(#softSpot)" />
                <ellipse cx={s.x} cy={cy} rx={s.r * 0.7} ry={s.r * 0.58} fill="#171d0a" opacity="0.9" />
              </g>
            );
          })}
        </g>

        {/* annotations */}
        <g fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill="#44586e">
          <text x="262" y={baseline - 158} transform="rotate(90 262 128)" textAnchor="middle">development ↑</text>
          <text x="150" y="388" textAnchor="middle" fontWeight="600" fill="#14365c">silica gel 60 F254 · EtOAc : Hexane 30 : 70</text>
        </g>
      </svg>
    </div>
  );
}

export default function Home() {
  const { submissions } = useStore();
  const published = useMemo(
    () =>
      submissions
        .filter((s) => s.status === "published")
        .sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1)),
    [submissions],
  );
  const authors = useMemo(() => {
    const set = new Set<string>();
    published.forEach((p) => p.authors.forEach((a) => set.add(a.fullName)));
    return set.size;
  }, [published]);
  const countries = useMemo(
    () => new Set(published.flatMap((p) => p.authors.map((a) => a.country).filter(Boolean))).size,
    [published],
  );
  const vizMethods = useMemo(
    () => new Set(published.flatMap((p) => p.visualization.map((v) => v.method))).size,
    [published],
  );

  const stats = [
    { n: published.length, l: "Published TLCs" },
    { n: authors, l: "Authors" },
    { n: countries, l: "Countries" },
    { n: vizMethods, l: "Visualization methods" },
  ];

  return (
    <div>
      {/* ============ OPENING: masthead + live chamber ============ */}
      <section className="graph-paper relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pb-20 lg:pt-16">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <span className="border border-navy/40 bg-white px-2.5 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.18em] text-navy">
                  Vol. 1 · 2026 · Continuous publication
                </span>
                <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-inkfaint">
                  Open access · CC BY 4.0
                </span>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-6 font-display text-[3.2rem] font-black leading-[0.95] tracking-tight text-ink sm:text-[4.6rem]">
                TLC
                <br />
                Journal<span className="text-uvdeep">.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-4 max-w-xl font-display text-xl font-medium italic leading-snug text-navy sm:text-[1.4rem]">
                Thin-Layer Chromatography: A Basic Need in Every Chemist's Laboratory
              </p>
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-inksoft">
                Capturing the small observations that guide chemical reactions. A peer-checked
                journal for <strong className="text-ink">one-page TLC communications</strong> — reaction
                monitoring, visualization sequences, Rf data, and the practical findings that
                rarely get published.
              </p>
            </Reveal>
            <Reveal delay={230}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/submit"
                  className="group inline-flex items-center gap-2.5 border border-uvdeep bg-uvdeep px-6 py-3.5 font-mono text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[#f5f8ef] shadow-[4px_4px_0_#10233b] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#10233b]"
                >
                  <IPlate size={16} /> Submit your TLC
                </Link>
                <Link
                  to="/browse"
                  className="group inline-flex items-center gap-2.5 border border-navy bg-transparent px-6 py-3.5 font-mono text-[0.78rem] font-bold uppercase tracking-[0.14em] text-navy transition-colors hover:bg-navy hover:text-[#f2f4f0]"
                >
                  Explore published TLCs <IArrow size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <dl className="mt-10 grid max-w-lg grid-cols-4 divide-x divide-line border border-line bg-white">
                {stats.map((s) => (
                  <div key={s.l} className="flex flex-col px-3 py-3.5 text-center sm:px-4">
                    <dd className="order-1 font-display text-2xl font-black tabular text-navy sm:text-3xl">{s.n}</dd>
                    <dt className="order-2 mt-1 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-inkfaint sm:text-[0.6rem]">
                      {s.l}
                    </dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={200} className="relative">
            <div className="border border-line bg-white/70 p-4 shadow-[0_24px_60px_-30px_rgba(16,35,59,0.4)] backdrop-blur-sm sm:p-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-navy">
                  Fig. 1 — Developing chamber, in situ
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-uvdeep">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-uvdeep" /> live
                </span>
              </div>
              <DevelopingChamber />
            </div>
          </Reveal>
        </div>

        {/* ticker of latest communications */}
        <div className="border-t border-line bg-navydeep py-2.5">
          <div className="flex overflow-hidden">
            <div className="anim-ticker flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
              {[...published, ...published].map((p, i) => (
                <Link key={`${p.id}-${i}`} to={`/article/${p.articleId}`} className="group flex items-center gap-3 font-mono text-[0.68rem] tracking-[0.06em] text-[#9db1c7] transition-colors hover:text-white">
                  <span className="text-uv">{p.articleId}</span>
                  <span className="max-w-[340px] truncate">{p.title}</span>
                  <span aria-hidden="true" className="text-[#41597a]">▪</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ LATEST COMMUNICATIONS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="border border-navy/50 px-2 py-0.5 font-mono text-[0.65rem] font-bold tracking-[0.18em] text-navy">§ 01</span>
                <span className="h-px w-16 bg-ink/15" />
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Latest communications</h2>
            </div>
            <Link to="/browse" className="group inline-flex items-center gap-2 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-navy hover:text-uvdeep">
              Browse the database <IArrow size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {published.slice(0, 6).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <Link
                to={`/article/${p.articleId}`}
                className="plate-card group flex h-full flex-col border border-line bg-sheet shadow-[0_10px_30px_-22px_rgba(16,35,59,0.5)]"
              >
                <div className="relative border-b border-line bg-[#eef1ea] p-4">
                  <div className="absolute left-3 top-3 z-10">
                    <StatusBadge status="published" />
                  </div>
                  <div className="absolute right-3 top-3 z-10 font-mono text-[0.6rem] font-bold tracking-[0.1em] text-uvdeep">
                    {p.articleId}
                  </div>
                  <MiniPlate lanes={p.lanes} spots={p.spots} height={210} animate={false} hoverDevelop className="mx-auto w-full max-w-[240px]" />
                  <div className="mt-1 text-center font-mono text-[0.58rem] uppercase tracking-[0.14em] text-inkfaint">
                    hover to develop · UV 254 view
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-1.5">
                    <Tag tone="blue">{p.articleType}</Tag>
                    {p.visualization.slice(0, 2).map((v) => (
                      <Tag key={v.id} tone="green">{v.method}</Tag>
                    ))}
                  </div>
                  <h3 className="mt-3 font-display text-[1.15rem] font-bold leading-snug text-ink transition-colors group-hover:text-navy">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[0.8rem] text-inksoft">
                    {p.authors.map((a) => a.fullName).join(", ")}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 font-mono text-[0.64rem] tracking-[0.08em] text-inkfaint">
                    <span>{p.mobilePhase.map((m) => `${m.solvent} ${m.parts}`).join(" : ")}</span>
                    <span className="font-bold text-navy">{p.publishedAt}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ PHILOSOPHY BAND ============ */}
      <section className="graph-paper-dark relative overflow-hidden bg-navydeep py-20 text-[#f2f4f0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="max-w-4xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              TLC is not just a laboratory routine.
              <br />
              <span className="text-uv">TLC contains scientific information worth preserving.</span>
            </p>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Observe",
                d: "Every plate carries data — conversion, intermediates, impurities, decomposition. Most of it evaporates with the solvent.",
                icon: <IEye size={22} />,
              },
              {
                n: "02",
                t: "Record",
                d: "One photograph, one scheme, one set of conditions, one honest interpretation. Structured, complete, and capped at a single A4 page.",
                icon: <IDoc size={22} />,
              },
              {
                n: "03",
                t: "Share",
                d: "A permanent article page, an article identifier, a one-page PDF and a citation — so the observation can be found and reused.",
                icon: <IUV size={22} />,
              },
            ].map((x, i) => (
              <Reveal key={x.n} delay={i * 120}>
                <div className="group border-t-2 border-uv/40 pt-5 transition-colors hover:border-uv">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.7rem] font-bold tracking-[0.2em] text-uv">{x.n}</span>
                    <span className="text-uv transition-transform duration-300 group-hover:-translate-y-1">{x.icon}</span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold">{x.t}</h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-[#aebdd0]">{x.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="mt-14 border-l-2 border-uv pl-4 font-display text-lg italic text-uvglow">{JOURNAL_MOTTO}</p>
          </Reveal>
        </div>
      </section>

      {/* ============ PIPELINE ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="border border-navy/50 px-2 py-0.5 font-mono text-[0.65rem] font-bold tracking-[0.18em] text-navy">§ 02</span>
            <span className="h-px w-16 bg-ink/15" />
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            From bench to permanent record
          </h2>
          <p className="mt-2 max-w-2xl text-[0.95rem] text-inksoft">
            Where reaction progress becomes a scientific record. Every submission follows the same
            transparent editorial path.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            { s: "Prepare", d: "Photograph the original plate, sketch the scheme, note the mobile phase and lanes.", t: "AUTHOR" },
            { s: "Submit", d: "Structured one-page form with validation, declarations and a live A4 preview.", t: "AUTHOR" },
            { s: "Review", d: "Technical check, then editorial review with a 14-point checklist and comments.", t: "EDITORIAL" },
            { s: "Publish", d: "Article ID TLCJ-2026-000xx, permanent page, one-page PDF, citation & BibTeX.", t: "JOURNAL" },
          ].map((x, i) => (
            <Reveal key={x.s} delay={i * 90} className="bg-sheet">
              <div className="group flex h-full flex-col p-6 transition-colors hover:bg-sky">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-black text-line transition-colors group-hover:text-navy/25">
                    {i + 1}
                  </span>
                  <span className="font-mono text-[0.58rem] font-bold tracking-[0.16em] text-uvdeep">{x.t}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{x.s}</h3>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-inksoft">{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ VISUALIZATION CANON ============ */}
      <section className="border-y border-line bg-sheet">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div>
                <div className="flex items-center gap-3">
                  <span className="border border-navy/50 px-2 py-0.5 font-mono text-[0.65rem] font-bold tracking-[0.18em] text-navy">§ 03</span>
                  <span className="h-px w-16 bg-ink/15" />
                </div>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  One canonical visualization sequence
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-inksoft">
                  Every communication reports visualization in the same order, so readers can
                  compare plates across articles. UV first. Iodine second. Stains third — each
                  step adding information the previous one could not.
                </p>
                <div className="mt-6 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-inkfaint">
                  <IDrop size={14} className="text-iodine" /> 13 supported reagents · KMnO₄, vanillin, anisaldehyde, ninhydrin, CAM, PMA…
                </div>
              </div>
            </Reveal>
            <div className="grid gap-4">
              {[
                { step: "Step 1", name: "UV 254 / 365 nm", d: "Report first whenever applicable — the non-destructive baseline view of every UV-active compound.", tone: "bg-[#2b3a20] text-[#d9e8b8]", chip: "254 · 365" },
                { step: "Step 2", name: "Iodine chamber", d: "Reversible brown staining catches UV-silent material — the classic second opinion.", tone: "bg-[#4a3313] text-[#ecd9b8]", chip: "I₂" },
                { step: "Step 3", name: "Revealing reagents", d: "KMnO₄, vanillin, ninhydrin, CAM, PMA and more — functional-group level information as a final layer.", tone: "bg-[#3a2438] text-[#ecd0e6]", chip: "KMnO₄ · CAM · …" },
              ].map((v, i) => (
                <Reveal key={v.step} delay={i * 110}>
                  <div className={`group flex items-center gap-5 border border-line p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${v.tone}`}>
                    <div className="grid h-14 w-14 shrink-0 place-items-center border border-current/40 font-display text-xl font-black">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] opacity-70">{v.step}</span>
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] opacity-70">{v.chip}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold">{v.name}</h3>
                      <p className="mt-0.5 text-[0.8rem] leading-relaxed opacity-85">{v.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="graph-paper">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <Reveal>
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-uvdeep">Making everyday TLC observations publishable</p>
            <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
              Your last plate deserved
              <br />
              better than the bin.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.95rem] text-inksoft">
              One TLC. One observation. One page. Read the guidelines, upload the original
              photograph, and give a useful observation a permanent home.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/guidelines" className="border border-navy px-6 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-navy transition-colors hover:bg-navy hover:text-[#f2f4f0]">
                Read author guidelines
              </Link>
              <Link to="/submit" className="border border-uvdeep bg-uvdeep px-6 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#f5f8ef] shadow-[4px_4px_0_#10233b] transition-all hover:-translate-y-0.5">
                Submit your TLC
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
