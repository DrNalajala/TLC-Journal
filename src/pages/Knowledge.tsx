import { useState } from "react";
import { Link } from "react-router-dom";
import { IChevron, IPlus, ITrash, Reveal, SectionHead } from "../components/ui";

interface HubArticle {
  id: string;
  title: string;
  tag: string;
  body: React.ReactNode;
}

const p = (t: string) => <p className="text-[0.85rem] leading-relaxed text-inksoft">{t}</p>;
const ul = (items: string[]) => (
  <ul className="space-y-1.5">
    {items.map((i) => (
      <li key={i} className="flex gap-2.5 text-[0.85rem] leading-relaxed text-inksoft">
        <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-uvdeep" /> {i}
      </li>
    ))}
  </ul>
);

const ARTICLES: HubArticle[] = [
  {
    id: "what",
    title: "What is TLC?",
    tag: "Fundamentals",
    body: (
      <div className="space-y-3">
        {p("Thin-layer chromatography separates the components of a mixture on a thin film of adsorbent (usually silica gel) coated on glass, aluminium or plastic. A small spot of the mixture is applied near the bottom, the plate stands in a shallow pool of solvent, and capillary action pulls the solvent up through the spot.")}
        {p("Compounds partition continuously between the stationary phase and the moving solvent. Polar compounds interact more strongly with polar silica and lag behind; non-polar compounds travel further. The result — a vertical column of separated spots — is a direct visual map of the mixture.")}
        {ul([
          "Stationary phase: most often silica gel 60, optionally with fluorescent indicator F254.",
          "Mobile phase: a solvent or solvent mixture chosen to give Rf values between ~0.2 and 0.8.",
          "Readout: UV quenching, iodine staining, or chemical reagents reveal otherwise invisible spots.",
        ])}
      </div>
    ),
  },
  {
    id: "mobile",
    title: "How to select a mobile phase",
    tag: "Method development",
    body: (
      <div className="space-y-3">
        {p("Start from a binary gradient of a non-polar solvent (hexane or petroleum ether) and a polar one (ethyl acetate is the workhorse). Spot your compound in 10%, 30%, 50% and 70% ethyl acetate, and pick the mixture that places the spot near Rf 0.3–0.5.")}
        {ul([
          "Too high (Rf > 0.8): decrease the polar component — resolution collapses near the front.",
          "Too low (Rf < 0.15): increase polarity, or add 1–5% methanol for very polar material.",
          "Amines tail on acidic silica: add 0.5–1% triethylamine to the eluent.",
          "Acids streak: add 0.5–1% acetic acid to sharpen carboxylic acids.",
          "Always record the exact ratio — 'EtOAc : hexane 30 : 70' — in every communication.",
        ])}
      </div>
    ),
  },
  {
    id: "viz-choose",
    title: "Choosing visualization reagents",
    tag: "Visualization",
    body: (
      <div className="space-y-3">
        {p("A compound is only as real as your ability to see it. Match the reagent to the functional groups you expect:")}
        {ul([
          "KMnO4 — oxidizable groups: alkenes, alcohols, aldehydes; purple → yellow/brown.",
          "Vanillin / anisaldehyde (acidic charring) — terpenes, steroids, sugars; colourful heated spots.",
          "Ninhydrin — primary and secondary amines, amino acids; blue-purple at room temperature or on heating.",
          "CAM or PMA — near-universal charring reagents for non-UV-active natural products.",
          "Dragendorff — alkaloids; orange spots on yellow background.",
          "Ehrlich — indoles and electron-rich aromatics.",
          "Bromocresol green — carboxylic acids as yellow spots on blue.",
          "FeCl3 — phenols; violet/green complexes.",
        ])}
      </div>
    ),
  },
  {
    id: "uv-iodine",
    title: "UV vs iodine vs staining reagents",
    tag: "Visualization",
    body: (
      <div className="space-y-3">
        {p("Each visualization layer answers a different question. UV 254 nm shows aromatic and conjugated systems as dark spots on a glowing green plate — non-destructive, so always first. UV 365 nm reveals native fluorescence, useful for coumarins and polyaromatics.")}
        {p("Iodine vapour stains most organic compounds reversibly brown — excellent as a second opinion that catches UV-silent material. Because it fades, photograph immediately.")}
        {p("Charring and dip reagents are destructive but functional-group specific: they turn 'there is a spot' into 'there is an amine'. Using the sequence UV → iodine → specific stain is why TLC Journal plates are comparable across articles.")}
      </div>
    ),
  },
  {
    id: "rf",
    title: "How to calculate Rf",
    tag: "Fundamentals",
    body: (
      <div className="space-y-3">
        {p("The retention factor Rf is the distance travelled by the compound divided by the distance travelled by the solvent front, both measured from the baseline:")}
        <p className="border border-line bg-white px-4 py-3 text-center font-mono text-[0.85rem] font-semibold text-navy">Rf = d(spot) / d(front)</p>
        {ul([
          "Measure to the centre of the spot, in the same units for both distances.",
          "Rf is dimensionless and always between 0 and 1.",
          "It depends on stationary phase, mobile phase, temperature and layer thickness — report all of them.",
          "Compare compounds on the same plate, never across different plates.",
        ])}
        <p className="text-[0.82rem] font-medium text-navy">Try the interactive Rf calculator below this list.</p>
      </div>
    ),
  },
  {
    id: "monitoring",
    title: "TLC for reaction monitoring",
    tag: "Practice",
    body: (
      <div className="space-y-3">
        {p("Run at least three lanes: starting material reference, the reaction mixture, and a co-spot (reference + mixture in the same lane). The co-spot lane is the honest broker — it exposes co-elution that separate lanes hide.")}
        {ul([
          "Withdraw a small aliquot, quench it, and dilute before spotting to avoid overload.",
          "Judge completion by the disappearance of the SM spot against the reference lane.",
          "Remember intensity is not moles: a weak-staining SM may still be significant.",
          "Take an early time point — fast reactions finish between the plates you did not run.",
          "Watch for new spots at intermediate Rf: they are your intermediates or side products.",
        ])}
      </div>
    ),
  },
  {
    id: "purification",
    title: "TLC for purification",
    tag: "Practice",
    body: (
      <div className="space-y-3">
        {p("Flash column fractions are TLC's other day job. Screen fractions on one multi-lane plate against the crude mixture and a reference, then pool only the lanes that show a single clean spot at the product Rf.")}
        {ul([
          "Spot fractions undiluted, the crude diluted — otherwise the crude lane overloads.",
          "Cut pooling windows at the first and last clean fractions; resist the temptation to include borderline ones.",
          "A second eluent system (different selectivity) validates purity better than a second run of the same system.",
          "Late-eluting polar impurities often hide under the product tail — check the baseline region carefully.",
        ])}
      </div>
    ),
  },
  {
    id: "mistakes",
    title: "Common TLC mistakes",
    tag: "Troubleshooting",
    body: ul([
      "Spotting too much: overloaded spots streak, tail and merge — dilute and re-spot.",
      "Solvent level above the baseline: the sample dissolves into the pool instead of developing.",
      "Unsaturated chamber: edge effects and curved fronts; line the chamber with filter paper.",
      "Reading the plate after iodine has faded: photograph every visualization immediately.",
      "Comparing Rf across different plates or solvent batches: run references on the same plate.",
      "Trusting UV alone: UV-silent compounds are invisible, not absent.",
      "Claiming 100% conversion from one faint-smearing lane — say 'near complete' and show the plate.",
    ]),
  },
  {
    id: "trouble",
    title: "Troubleshooting poor separation",
    tag: "Troubleshooting",
    body: (
      <div className="space-y-3">
        {p("When everything runs as one blob or one streak, change one variable at a time:")}
        {ul([
          "All spots at the front → reduce eluent polarity in 10–20% steps.",
          "All spots at the baseline → increase polarity, or switch from hexane/EtOAc to DCM/MeOH selectivity.",
          "Tailing amines → add 1% Et3N; tailing acids → add 1% AcOH.",
          "Curved solvent front → saturate the chamber, and ensure the plate is cut square and level.",
          "Diffuse large spots → spot less material; concentrate the aliquot instead of spotting more volume.",
          "Still stuck → change selectivity class (e.g. toluene or THF instead of EtOAc), not just the ratio.",
        ])}
      </div>
    ),
  },
  {
    id: "docs",
    title: "TLC documentation best practices",
    tag: "Documentation",
    body: ul([
      "Photograph the whole plate, square-on, in even light, before and after each visualization.",
      "Mark baseline and solvent front in pencil before development — ink runs.",
      "Record plate type, batch, mobile phase ratio, chamber saturation and development distance.",
      "Note what each stain revealed that the previous one did not — that delta is the science.",
      "Store the original image unmodified; process only a display copy.",
      "Publish the observation while the context is fresh — a plate you cannot explain next month is half lost.",
    ]),
  },
];

export default function Knowledge() {
  const [openId, setOpenId] = useState<string | null>("what");

  return (
    <div className="graph-paper min-h-screen">
      <section className="border-b border-line bg-sheet">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <Reveal>
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-uvdeep">Education</p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">TLC Knowledge Hub</h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-inksoft">
              Short, practical primers written by the editorial board — the same standards applied
              to every communication we publish. Open a topic, or jump straight to the{" "}
              <button
                onClick={() => document.getElementById("rf-calc")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="font-semibold text-navy underline underline-offset-2 hover:text-uvdeep"
              >
                Rf calculator
              </button>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="space-y-3">
          {ARTICLES.map((a, i) => {
            const open = openId === a.id;
            return (
              <Reveal key={a.id} delay={Math.min(i * 40, 200)}>
                <article className={`border transition-all ${open ? "border-navy bg-sheet shadow-[0_14px_40px_-28px_rgba(16,35,59,0.6)]" : "border-line bg-sheet hover:border-navy/50"}`}>
                  <button
                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenId(open ? null : a.id)}
                    aria-expanded={open}
                  >
                    <span className="font-mono text-[0.66rem] font-bold text-inkfaint">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 font-display text-lg font-bold text-ink sm:text-xl">{a.title}</span>
                    <span className="hidden font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-uvdeep sm:block">{a.tag}</span>
                    <IChevron size={16} className={`text-navy transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-line px-5 py-4 sm:px-[3.4rem]">{a.body}</div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Rf calculator */}
        <div id="rf-calc" className="mt-14 scroll-mt-24">
          <SectionHead code="§ TOOL" title="Rf calculator" desc="Measure from the baseline to the spot centre and to the solvent front. Add as many spots as your plate has." />
          <RfLab />
        </div>

        <Reveal>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-uvglow/50 px-6 py-5">
            <p className="font-display text-xl font-bold text-ink">Put the theory on a plate — publish your observation.</p>
            <Link to="/submit" className="border border-uvdeep bg-uvdeep px-5 py-2.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#f5f8ef] hover:bg-[#3a6b1f]">
              Submit your TLC
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* --------------------------- Rf lab tool ---------------------------- */
function RfLab() {
  const [rows, setRows] = useState([
    { id: 1, label: "Product", spot: "3.4", front: "8.0" },
    { id: 2, label: "Starting material", spot: "5.8", front: "8.0" },
  ]);
  const frontVal = parseFloat(rows[0]?.front || "0");

  return (
    <Reveal>
      <div className="grid gap-6 border border-line bg-sheet p-5 sm:p-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="space-y-2">
            {rows.map((r) => {
              const s = parseFloat(r.spot);
              const f = parseFloat(r.front);
              const rf = !Number.isNaN(s) && !Number.isNaN(f) && f > 0 && s >= 0 && s <= f ? s / f : null;
              return (
                <div key={r.id} className="grid grid-cols-[1fr_88px_88px_86px_32px] items-center gap-2">
                  <input className="field-input" value={r.label} placeholder="Spot label" onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, label: e.target.value } : x))} />
                  <input className="field-input text-center font-mono" inputMode="decimal" value={r.spot} placeholder="spot cm" onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, spot: e.target.value } : x))} />
                  <input className="field-input text-center font-mono" inputMode="decimal" value={r.front} placeholder="front cm" onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, front: e.target.value } : x))} />
                  <span className={`text-center font-mono text-[0.8rem] font-bold tabular ${rf === null ? "text-inkfaint" : "text-navy"}`}>
                    {rf === null ? "—" : rf.toFixed(2)}
                  </span>
                  <button className="grid h-8 w-8 place-items-center border border-line text-[#a33327] hover:bg-[#faece9]" onClick={() => setRows(rows.filter((x) => x.id !== r.id))} disabled={rows.length === 1}>
                    <ITrash size={13} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-1.5 border border-dashed border-[#b9c4ce] px-3 py-1.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-inksoft hover:border-navy hover:text-navy"
              onClick={() => setRows([...rows, { id: Date.now(), label: "", spot: "", front: rows[0]?.front || "" }])}
            >
              <IPlus size={12} /> Add spot
            </button>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-inkfaint">columns: label · spot distance · front distance · Rf</span>
          </div>
        </div>

        {/* visual strip */}
        <div className="border border-line bg-paper p-4">
          <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-navy">Plate view</p>
          <svg viewBox="0 0 200 240" className="mx-auto mt-2 w-full max-w-[190px]">
            <rect x="30" y="8" width="140" height="210" rx="4" fill="#ccd6a2" stroke="#8a9a66" />
            <line x1="38" y1="28" x2="162" y2="28" stroke="#5c684a" strokeDasharray="4 3" />
            <line x1="38" y1="200" x2="162" y2="200" stroke="#5c684a" strokeDasharray="3 3" />
            {rows.map((r, i) => {
              const s = parseFloat(r.spot);
              const f = parseFloat(r.front);
              if (Number.isNaN(s) || Number.isNaN(f) || f <= 0 || s > f || s < 0) return null;
              const rf = s / f;
              const y = 200 - rf * (200 - 34);
              const x = 60 + (i % 3) * 40;
              return (
                <g key={r.id}>
                  <ellipse cx={x} cy={y} rx="10" ry="8" fill="#1b2312" opacity="0.55" />
                  <ellipse cx={x} cy={y} rx="5.5" ry="4.5" fill="#141a10" />
                  <text x={x} y={y - 12} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fill="#44586e">
                    {rf.toFixed(2)}
                  </text>
                </g>
              );
            })}
            <text x="100" y="232" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fill="#7a8ba0">
              front {Number.isNaN(frontVal) ? "—" : `${frontVal} cm`}
            </text>
          </svg>
          <p className="mt-1 text-center font-mono text-[0.58rem] uppercase tracking-[0.1em] text-inkfaint">Rf = spot ÷ front</p>
        </div>
      </div>
    </Reveal>
  );
}
