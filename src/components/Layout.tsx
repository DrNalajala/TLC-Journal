import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useStore, hasRole } from "../store/AppStore";
import { EDITORIAL_EMAIL, JOURNAL_MOTTO, JOURNAL_SUBTITLE } from "../data/constants";
import { IMenu, IPlate, IX, Toasts } from "./ui";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/browse", label: "Browse TLCs" },
  { to: "/submit", label: "Submit TLC" },
  { to: "/guidelines", label: "Author Guidelines" },
  { to: "/knowledge", label: "Knowledge Hub" },
  { to: "/contact", label: "Contact" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useStore();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setOpen(false);
  }, [loc.pathname]);

  const links = currentUser && hasRole(currentUser.role, ["admin", "editor", "reviewer"])
    ? [...NAV, { to: "/dashboard", label: "Editorial" }]
    : NAV;

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `relative px-1 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
      isActive ? "text-navy" : "text-inksoft hover:text-navy"
    } after:absolute after:inset-x-0 after:-bottom-[13px] after:h-[2.5px] after:origin-left after:bg-uvdeep after:transition-transform after:duration-300 ${
      isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      {/* top info strip */}
      <div className="border-b border-line bg-navydeep text-[#c6d2e0]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 font-mono text-[0.64rem] tracking-[0.08em] sm:px-6">
          <span className="hidden font-semibold uppercase tracking-[0.16em] sm:inline">{JOURNAL_MOTTO}</span>
          <span className="sm:hidden">Vol. 1 · 2026</span>
          <span className="flex items-center gap-4">
            <span className="hidden md:inline">Vol. 1 · Continuous publication</span>
            {currentUser ? (
              <span className="flex items-center gap-3">
                <Link to="/dashboard" className="hover:text-white">
                  {currentUser.name.split(" ").slice(-1)[0]} · {currentUser.role}
                </Link>
                <button onClick={logout} className="text-[#9db1c7] underline-offset-2 hover:text-white hover:underline">
                  Sign out
                </button>
              </span>
            ) : (
              <Link to="/auth" className="hover:text-white hover:underline underline-offset-2">
                Sign in / Register
              </Link>
            )}
          </span>
        </div>
      </div>

      {/* masthead nav */}
      <header className="sticky top-0 z-[60] border-b border-line bg-paper/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="group flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border-2 border-ink bg-uvglow text-ink transition-colors duration-300 group-hover:bg-uv group-hover:text-navydeep">
              <IPlate size={22} strokeWidth={2} />
            </span>
            <span>
              <span className="block font-display text-[1.35rem] font-black leading-none tracking-tight text-ink">
                TLC <span className="text-navy">Journal</span>
              </span>
              <span className="mt-0.5 block font-mono text-[0.56rem] uppercase tracking-[0.16em] text-inkfaint">
                Practical TLC Communications
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navCls}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <Link
                to="/submit"
                className="hidden items-center gap-2 border border-uvdeep bg-uvdeep px-3.5 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#f5f8ef] transition-colors hover:bg-[#3a6b1f] sm:inline-flex"
              >
                <IPlate size={14} /> Submit TLC
              </Link>
            ) : (
              <Link
                to="/auth"
                className="hidden border border-navy px-3.5 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-navy transition-colors hover:bg-navy hover:text-[#f2f4f0] sm:inline-flex"
              >
                Sign in
              </Link>
            )}
            <button
              className="grid h-10 w-10 place-items-center border border-line bg-white text-ink lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <IX size={18} /> : <IMenu size={18} />}
            </button>
          </div>
        </div>
        <div className="masthead-rule mx-auto max-w-7xl" />

        {open && (
          <nav className="border-t border-line bg-sheet px-4 py-4 lg:hidden">
            <div className="grid gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `border-l-2 px-3 py-2 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] ${
                      isActive ? "border-uvdeep bg-sky text-navy" : "border-transparent text-inksoft"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {currentUser && (
                <Link to="/submit" className="mt-2 border border-uvdeep bg-uvdeep px-3 py-2 text-center font-mono text-[0.75rem] font-bold uppercase tracking-[0.12em] text-[#f5f8ef]">
                  Submit your TLC
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* footer */}
      <footer className="graph-paper-dark mt-20 border-t-4 border-ink bg-navydeep text-[#c6d2e0]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center border border-uv/50 bg-uv/10 text-uv">
                <IPlate size={19} />
              </span>
              <span className="font-display text-xl font-black text-[#f2f4f0]">TLC Journal</span>
            </div>
            <p className="mt-4 max-w-xs text-[0.82rem] leading-relaxed text-[#9db1c7]">
              {JOURNAL_SUBTITLE}. Capturing the small observations that guide chemical reactions.
            </p>
            <p className="mt-4 border-l-2 border-uv pl-3 font-display text-[0.95rem] italic text-uvglow">
              "One TLC. One Observation. One Page."
            </p>
          </div>
          <div>
            <h4 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.18em] text-uv">Journal</h4>
            <ul className="mt-4 space-y-2.5 text-[0.82rem]">
              {[
                ["About the journal", "/about"],
                ["Editorial board", "/about"],
                ["Browse published TLCs", "/browse"],
                ["Latest communications", "/browse"],
                ["Knowledge hub", "/knowledge"],
              ].map(([t, to]) => (
                <li key={t}>
                  <Link to={to} className="transition-colors hover:text-white">{t}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.18em] text-uv">For authors</h4>
            <ul className="mt-4 space-y-2.5 text-[0.82rem]">
              {[
                ["Submit your TLC", "/submit"],
                ["Instructions for authors", "/guidelines"],
                ["Image quality guidance", "/guidelines"],
                ["Ethics & originality", "/guidelines"],
                ["Rf calculator", "/knowledge"],
              ].map(([t, to]) => (
                <li key={t}>
                  <Link to={to} className="transition-colors hover:text-white">{t}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.18em] text-uv">Editorial office</h4>
            <p className="mt-4 text-[0.82rem] leading-relaxed text-[#9db1c7]">
              TLC Journal Editorial Office<br />
              <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-uv transition-colors hover:text-uvglow">{EDITORIAL_EMAIL}</a>
            </p>
            <p className="mt-4 text-[0.7rem] leading-relaxed text-[#7a90a8]">
              Practical TLC Communications are concise laboratory observations — not
              substitutes for full peer-reviewed research articles.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 font-mono text-[0.62rem] tracking-[0.08em] text-[#7a90a8] sm:flex-row sm:px-6">
            <span>© 2026 TLC Journal · Open access · CC BY 4.0</span>
            <span>One TLC. One observation. One page.</span>
          </div>
        </div>
      </footer>
      <Toasts />
    </div>
  );
}
