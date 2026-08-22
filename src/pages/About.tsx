import { Link } from "react-router-dom";
import { useStore } from "../store/AppStore";
import { IPlate, IStamp, IUsers, Reveal, SectionHead, Tag } from "../components/ui";
import { JOURNAL_MOTTO, JOURNAL_SUBTITLE } from "../data/constants";

const BOARD = [
  { name: "Dr. Elena Marsh", role: "Editor-in-Chief", aff: "Institute of Practical Chromatography, Zürich", field: "Analytical methodology", initials: "EM" },
  { name: "Prof. Tomás Richter", role: "Senior Editor", aff: "Institute of Process Chemistry, Heidelberg", field: "Process & medicinal chemistry", initials: "TR" },
  { name: "Dr. Kenji Sato", role: "Review Editor", aff: "Kyoto Pharmaceutical University", field: "Synthetic organic chemistry", initials: "KS" },
  { name: "Dr. Amara Osei", role: "Associate Editor", aff: "University of Cape Coast", field: "Natural products & teaching labs", initials: "AO" },
  { name: "Dr. Marta Kowalska", role: "Associate Editor", aff: "Gdańsk University of Technology", field: "Stability & degradation studies", initials: "MK" },
  { name: "Dr. Chidera Eze", role: "Early-Career Editor", aff: "University of Nigeria, Nsukka", field: "Reaction mechanism observation", initials: "CE" },
];

export default function About() {
  const { submissions } = useStore();
  const published = submissions.filter((s) => s.status === "published").length;

  return (
    <div className="graph-paper min-h-screen">
      {/* opening */}
      <section className="border-b border-line bg-sheet">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <Reveal>
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-uvdeep">About the journal</p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight tracking-tight text-ink sm:text-[3.2rem]">
              A publishing category that
              <br /> did not exist — <span className="text-navy">until now.</span>
            </h1>
            <p className="mt-5 max-w-3xl font-display text-xl italic leading-relaxed text-navy">{JOURNAL_SUBTITLE}.</p>
            <p className="mt-4 max-w-3xl text-[0.95rem] leading-relaxed text-inksoft">
              Every working chemist runs TLC plates that contain genuinely useful information — a
              hidden intermediate, an unexpected impurity, a visualization trick that settled an
              ambiguous reaction — and then photographs them, decides something, and discards the
              evidence. <strong className="text-ink">TLC Journal exists to stop that loss.</strong> We publish
              concise, structured <em>Practical TLC Communications</em>: one original photograph, one
              reaction, one honest interpretation, on one A4 page.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
              {[
                { n: published, l: "Communications published", d: "continuously, Vol. 1" },
                { n: "1", l: "A4 page maximum", d: "per contribution, by design" },
                { n: "100%", l: "Original photographs", d: "declaration required from every author" },
              ].map((x) => (
                <div key={x.l} className="bg-sheet p-5 text-center">
                  <div className="font-display text-4xl font-black tabular text-navy">{x.n}</div>
                  <div className="mt-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-ink">{x.l}</div>
                  <div className="mt-0.5 text-[0.72rem] text-inkfaint">{x.d}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* positioning — the crucial distinction */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <Reveal>
          <SectionHead code="§ POSITIONING" title="What a TLC communication is — and is not" />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal delay={80}>
            <div className="h-full border-2 border-uvdeep bg-uvglow/30 p-6">
              <div className="flex items-center gap-2">
                <IPlate size={18} className="text-uvdeep" />
                <h3 className="font-display text-xl font-bold text-ink">Practical TLC Communication</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-[0.85rem] leading-relaxed text-ink">
                {[
                  "A single, real observation from genuine bench work",
                  "Original photograph with lane assignments",
                  "Structured conditions: plate, mobile phase, visualization",
                  "Honest semi-quantitative reading — no overinterpretation",
                  "Technical check + editorial review, one-page format",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-uvdeep" />{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="h-full border border-line bg-sheet p-6">
              <div className="flex items-center gap-2">
                <IStamp size={18} className="text-inkfaint" />
                <h3 className="font-display text-xl font-bold text-inksoft">Full Research Article</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-[0.85rem] leading-relaxed text-inksoft">
                {[
                  "Complete mechanistic & analytical validation",
                  "Spectroscopic characterization of compounds",
                  "Quantitative kinetics and statistics",
                  "Full conventional peer review",
                  "Multi-figure, multi-page manuscripts",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#b9c4ce]" />{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <p className="mt-6 border-l-[3px] border-navy bg-sky px-4 py-3 text-[0.85rem] leading-relaxed text-navy">
            We do <strong>not</strong> claim that a TLC photograph is equivalent to a peer-reviewed research
            article. Our value is narrower and deliberate:{" "}
            <strong>capturing practical experimental observations that are often useful but rarely published.</strong>
          </p>
        </Reveal>
      </section>

      {/* identifier + volumes */}
      <section className="border-y border-line bg-sheet">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
          <Reveal>
            <div>
              <SectionHead code="§ IDENTIFIERS" title="Every article gets a permanent ID" />
              <div className="border-2 border-dashed border-[#b9c4ce] bg-paper p-5 text-center">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-inkfaint">Identifier structure</p>
                <p className="mt-2 font-mono text-2xl font-bold tracking-[0.06em] text-navy">TLCJ-2026-00001</p>
                <div className="mx-auto mt-3 grid max-w-xs grid-cols-3 gap-1 font-mono text-[0.58rem] uppercase text-inkfaint">
                  <span className="border-t-2 border-navy pt-1">Journal</span>
                  <span className="border-t-2 border-navy pt-1">Year</span>
                  <span className="border-t-2 border-navy pt-1">Article №</span>
                </div>
              </div>
              <p className="mt-4 text-[0.82rem] leading-relaxed text-inksoft">
                Identifiers are assigned on acceptance. The architecture is prepared for DOI
                registration — a DOI will only be displayed once a registration agency is formally
                integrated; we never imply one exists beforehand.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <SectionHead code="§ VOLUMES" title="Volume & issue architecture" />
              <div className="space-y-2.5">
                {[
                  { v: "Volume 1 · 2026", i: "Continuous publication — articles published as accepted", active: true },
                  { v: "Volume 1 · Issue compilations", i: "Quarterly printable collections of published communications", active: false },
                  { v: "Volume 2 · 2027", i: "Opens January 2027", active: false },
                ].map((x) => (
                  <div key={x.v} className={`flex items-center justify-between border px-4 py-3 ${x.active ? "border-uvdeep bg-uvglow/30" : "border-line bg-white"}`}>
                    <div>
                      <p className="font-display text-[0.98rem] font-bold text-ink">{x.v}</p>
                      <p className="text-[0.72rem] text-inksoft">{x.i}</p>
                    </div>
                    {x.active && <Tag tone="green">Now publishing</Tag>}
                  </div>
                ))}
              </div>
              <p className="mt-4 font-display text-[1.05rem] italic text-navy">{JOURNAL_MOTTO}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* editorial board */}
      <section id="board" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-14 sm:px-6">
        <Reveal>
          <SectionHead code="§ BOARD" title="Editorial board" desc="Practising chemists who still run plates every week — and who read every submission themselves." />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOARD.map((b, i) => (
            <Reveal key={b.name} delay={i * 70}>
              <div className="group h-full border border-line bg-sheet p-5 transition-all hover:-translate-y-1 hover:border-navy hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center border-2 border-ink bg-uvglow font-display text-lg font-black text-ink transition-colors group-hover:bg-uv">
                    {b.initials}
                  </span>
                  <div>
                    <p className="font-display text-[1.02rem] font-bold text-ink">{b.name}</p>
                    <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-uvdeep">{b.role}</p>
                  </div>
                </div>
                <p className="mt-3 text-[0.78rem] text-inksoft">{b.aff}</p>
                <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-inkfaint">{b.field}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-navydeep px-6 py-5 text-[#f2f4f0]">
            <p className="font-display text-xl font-bold">Seen a plate worth preserving?</p>
            <Link to="/submit" className="border border-uv bg-uv px-5 py-2.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-navydeep hover:bg-uvglow">
              Submit your TLC
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
