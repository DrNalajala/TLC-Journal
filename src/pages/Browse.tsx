import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/AppStore";
import MiniPlate from "../components/MiniPlate";
import { EmptyState, IArrow, ISearch, IX, Reveal, StatusBadge, Tag } from "../components/ui";
import { ARTICLE_TYPES, PLATE_TYPES, VISUALIZATION_METHODS } from "../data/constants";

export default function Browse() {
  const { submissions } = useStore();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [type, setType] = useState("");
  const [viz, setViz] = useState("");
  const [plate, setPlate] = useState("");
  const [country, setCountry] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState<"new" | "old" | "title">("new");

  const published = useMemo(() => submissions.filter((s) => s.status === "published"), [submissions]);

  const countries = useMemo(
    () => [...new Set(published.flatMap((p) => p.authors.map((a) => a.country).filter(Boolean)))].sort(),
    [published],
  );
  const years = useMemo(
    () => [...new Set(published.map((p) => p.publishedAt.slice(0, 4)))].sort().reverse(),
    [published],
  );

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = published.filter((s) => {
      if (type && s.articleType !== type) return false;
      if (viz && !s.visualization.some((v) => v.method === viz)) return false;
      if (plate && s.plateType !== plate) return false;
      if (country && !s.authors.some((a) => a.country === country)) return false;
      if (year && !s.publishedAt.startsWith(year)) return false;
      if (!needle) return true;
      const hay = [
        s.title,
        s.articleId ?? "",
        s.reactionDescription,
        s.keywords.join(" "),
        s.authors.map((a) => `${a.fullName} ${a.institution}`).join(" "),
        s.mobilePhase.map((m) => m.solvent).join(" "),
        s.visualization.map((v) => v.method).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return needle.split(/\s+/).every((w) => hay.includes(w));
    });
    list = [...list].sort((a, b) =>
      sort === "new"
        ? b.publishedAt.localeCompare(a.publishedAt)
        : sort === "old"
          ? a.publishedAt.localeCompare(b.publishedAt)
          : a.title.localeCompare(b.title),
    );
    return list;
  }, [published, q, type, viz, plate, country, year, sort]);

  const filtersActive = q || type || viz || plate || country || year;

  return (
    <div className="graph-paper min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="border border-navy/50 px-2 py-0.5 font-mono text-[0.65rem] font-bold tracking-[0.18em] text-navy">DATABASE</span>
            <span className="h-px w-16 bg-ink/15" />
          </div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">Browse TLCs</h1>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-inkfaint">
              {results.length} of {published.length} communications · Vol. 1
            </p>
          </div>
        </Reveal>

        {/* search + filters */}
        <Reveal delay={80}>
          <div className="mt-8 border border-line bg-sheet p-4 shadow-sm sm:p-5">
            <div className="relative">
              <ISearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-inkfaint" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, author, keyword, reaction, reagent or solvent…"
                className="field-input pl-11 pr-10 text-[0.95rem]"
              />
              {q && (
                <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-inkfaint hover:text-ink">
                  <IX size={16} />
                </button>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <FilterSelect label="Reaction type" value={type} onChange={setType} options={ARTICLE_TYPES} />
              <FilterSelect label="Visualization" value={viz} onChange={setViz} options={[...VISUALIZATION_METHODS]} />
              <FilterSelect label="Stationary phase" value={plate} onChange={setPlate} options={PLATE_TYPES} />
              <FilterSelect label="Country" value={country} onChange={setCountry} options={countries} />
              <FilterSelect label="Year" value={year} onChange={setYear} options={years} />
              <div>
                <label className="field-label mb-1.5 block">Sort</label>
                <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field-input">
                  <option value="new">Newest first</option>
                  <option value="old">Oldest first</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>
            </div>
            {filtersActive && (
              <button
                onClick={() => {
                  setQ(""); setType(""); setViz(""); setPlate(""); setCountry(""); setYear("");
                }}
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#a33327] hover:underline"
              >
                <IX size={12} /> Clear all filters
              </button>
            )}
          </div>
        </Reveal>

        {/* results */}
        {results.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No TLC communications match"
              desc="Try broadening the search term or clearing a filter. New communications are published continuously."
              action={
                filtersActive ? (
                  <button onClick={() => { setQ(""); setType(""); setViz(""); setPlate(""); setCountry(""); setYear(""); }} className="border border-navy px-4 py-2 font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-navy hover:bg-navy hover:text-white">
                    Reset filters
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 70}>
                <Link to={`/article/${p.articleId}`} className="plate-card group flex h-full flex-col border border-line bg-sheet shadow-[0_10px_30px_-22px_rgba(16,35,59,0.5)]">
                  <div className="relative border-b border-line bg-[#eef1ea] p-4">
                    <div className="absolute left-3 top-3 z-10"><StatusBadge status="published" /></div>
                    <div className="absolute right-3 top-3 z-10 font-mono text-[0.6rem] font-bold tracking-[0.1em] text-uvdeep">{p.articleId}</div>
                    <MiniPlate lanes={p.lanes} spots={p.spots} height={190} hoverDevelop className="mx-auto w-full max-w-[220px]" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap gap-1.5">
                      <Tag tone="blue">{p.articleType}</Tag>
                      <Tag tone="green">{p.plateType}</Tag>
                    </div>
                    <h2 className="mt-2.5 font-display text-lg font-bold leading-snug text-ink transition-colors group-hover:text-navy">{p.title}</h2>
                    <p className="mt-1.5 text-[0.78rem] text-inksoft">{p.authors.map((a) => a.fullName).join(", ")}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.keywords.slice(0, 4).map((k) => (
                        <span key={k} className="bg-paper px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.06em] text-inkfaint">{k}</span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="font-mono text-[0.62rem] text-inkfaint">{p.mobilePhase.map((m) => `${m.solvent} ${m.parts}`).join(" : ")}</span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-navy">
                        Read <IArrow size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="field-label mb-1.5 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field-input">
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
