import { Link } from "react-router-dom";
import { IAlert, ICheck, IUV, IDrop, IEye, Reveal } from "../components/ui";

const INSTRUCTIONS = [
  {
    t: "Submit real TLC observations",
    d: "Only submit TLC observations obtained from genuine laboratory work — reaction monitoring, work-ups, purifications, stability tests. Fabricated or simulated plates have no place here and lead to rejection.",
  },
  {
    t: "Original photograph required",
    d: "Upload the original TLC photograph from your laboratory. Screenshots taken from websites, figures copied from papers, or stock images are not acceptable as the primary image. You will confirm originality with a signed declaration.",
  },
  {
    t: "Maximum one A4 page",
    d: "The complete contribution — scheme, photograph, conditions, visualization, interpretation — should normally fit on one A4 page. The submission editor shows a live estimate; editors may override the limit only when scientifically justified.",
  },
  {
    t: "Show the chemistry",
    d: "Provide a clear, chemically accurate reaction scheme: starting material, reagents, solvent, temperature, time and product. PNG, JPG or SVG exports from any drawing tool are fine.",
  },
  {
    t: "Explain briefly",
    d: "Describe what was done and what the TLC demonstrates. One compact paragraph — the journal values clarity over exhaustive experimental detail.",
  },
  {
    t: "Report TLC conditions",
    d: "Always provide the four pillars: plate (stationary phase), mobile phase with ratios, sample lanes, and visualization. A plate without conditions is an anecdote; with conditions it becomes reusable science.",
  },
  {
    t: "Visualization order",
    d: "Where applicable, report visualization in the canonical order: 1. UV (254/365 nm) → 2. Iodine → 3. Other visualization/charring reagents. The editor enforces this order so plates are comparable across articles.",
  },
  {
    t: "Do not overinterpret",
    d: "TLC is a qualitative to semi-quantitative technique. Do not claim exact conversion, purity or kinetics from a plate alone unless supported by appropriate analytical data. Say 'approximately' and mean it.",
  },
  {
    t: "Label the image",
    d: "Lane assignments must be clearly identifiable. Use the lane designer — your labels are printed directly beneath the photograph in the published article.",
  },
  {
    t: "Ethical responsibility",
    d: "Authors are responsible for the accuracy and originality of their submission, for having the right to publish the material, and for excluding confidential or proprietary information they are not authorized to disclose.",
  },
];

export default function Guidelines() {
  return (
    <div className="graph-paper min-h-screen">
      <section className="border-b border-line bg-sheet">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <Reveal>
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-uvdeep">For authors</p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">Instructions for Authors</h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-inksoft">
              Ten rules, deliberately short. A contribution that follows them can move from
              submission to publication in days — because there is nothing for the editor to guess.
            </p>
            <Link to="/submit" className="mt-6 inline-block border border-uvdeep bg-uvdeep px-6 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#f5f8ef] shadow-[4px_4px_0_#10233b] transition-all hover:-translate-y-0.5">
              Start a submission
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ten instructions */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {INSTRUCTIONS.map((x, i) => (
            <Reveal key={x.t} delay={(i % 2) * 90}>
              <div className="group h-full border border-line bg-sheet p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-black leading-none text-line transition-colors group-hover:text-uv">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-xl font-bold text-ink">{x.t}</h2>
                </div>
                <p className="mt-3 text-[0.85rem] leading-relaxed text-inksoft">{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* image quality */}
      <section className="border-y border-line bg-sheet">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
          <Reveal>
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Image quality guidance</h2>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-inksoft">
                Use a clear, well-focused photograph of the whole plate, taken square-on with even
                illumination. The original file is archived untouched; mild brightness/contrast
                correction is allowed for the display copy only if it does not alter the scientific
                interpretation.
              </p>
              <p className="mt-4 border-l-2 border-navy bg-sky px-3 py-2 text-[0.78rem] italic text-navy">
                "Please upload the original photograph in addition to any processed/display version."
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Excessive glare or reflections",
                "Severe shadows across lanes",
                "Unreadable or saturated spots",
                "Cropped or missing lanes",
                "Excessive image processing",
                "Misleading enhancement",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2 border border-[#ecc4be] bg-[#faece9] px-3 py-2.5">
                  <IAlert size={15} className="mt-0.5 shrink-0 text-[#a33327]" />
                  <span className="text-[0.75rem] font-medium leading-snug text-[#7c2b22]">{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* declarations + confidentiality */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="border border-line bg-sheet p-6">
              <h2 className="font-display text-2xl font-bold text-ink">Author declarations</h2>
              <p className="mt-1.5 text-[0.82rem] text-inksoft">Six confirmations, collected at submission and archived with the manuscript:</p>
              <ul className="mt-4 space-y-2">
                {[
                  "This work is original.",
                  "The TLC image is an original laboratory photograph.",
                  "The information submitted is accurate to the best of my knowledge.",
                  "I have permission to submit this work.",
                  "The submission does not knowingly contain confidential proprietary information.",
                  "The reaction scheme and description are my own or appropriately cited.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 border border-line bg-white px-3 py-2 text-[0.8rem] text-ink">
                    <ICheck size={15} className="mt-0.5 shrink-0 text-uvdeep" strokeWidth={2.4} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex h-full flex-col gap-6">
              <div className="border-2 border-[#a33327] bg-[#faece9] p-5">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[#7c2b22]">
                  <IAlert size={17} /> Confidentiality warning
                </h3>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-[#7c2b22]">
                  Authors must <strong>not</strong> upload confidential, proprietary, unpublished company
                  information, trade secrets, regulated information, or data that they are not
                  authorized to disclose. Industrial contributions require explicit authorization for
                  publication.
                </p>
              </div>
              <div className="flex-1 border border-line bg-navydeep p-5 text-[#f2f4f0]">
                <h3 className="font-display text-lg font-bold text-uv">AI assistance policy</h3>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-[#aebdd0]">
                  Optional AI help is welcome for grammar, formatting, summarization and keywords.
                  AI must <strong className="text-white">never</strong> invent spots, Rf values, reaction
                  conditions or experimental results.
                </p>
                <p className="mt-3 border-l-2 border-uv pl-3 font-display text-[0.9rem] italic text-uvglow">
                  "AI assistance may improve presentation, but all scientific observations must
                  originate from the author's actual experiment."
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[0.6rem] uppercase tracking-[0.08em]">
                  <span className="flex items-center gap-1.5 text-[#9fd66f]"><ICheck size={11} /> Grammar & clarity</span>
                  <span className="flex items-center gap-1.5 text-[#f0b3ab]"><IAlert size={11} /> Invented spots</span>
                  <span className="flex items-center gap-1.5 text-[#9fd66f]"><ICheck size={11} /> Keyword suggestions</span>
                  <span className="flex items-center gap-1.5 text-[#f0b3ab]"><IAlert size={11} /> Fake Rf values</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* future AI */}
        <Reveal delay={150}>
          <div className="mt-8 border border-dashed border-[#b9c4ce] bg-white/70 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-11 w-11 place-items-center border border-navy bg-sky text-navy"><IUV size={20} /></span>
              <div className="min-w-[240px] flex-1">
                <h3 className="font-display text-xl font-bold text-ink">Coming later: TLC Image AI</h3>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-inksoft">
                  Assisted lane & spot detection, approximate Rf reading, spot-intensity summaries and
                  reaction-scheme ↔ TLC correlation. Every AI reading will carry the label{" "}
                  <span className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.08em] text-navy">"AI interpretation — verify experimentally."</span>
                </p>
              </div>
              <div className="flex gap-4 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-inkfaint">
                <span className="flex items-center gap-1.5"><IEye size={13} /> spot detection</span>
                <span className="flex items-center gap-1.5"><IDrop size={13} /> Rf reading</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
