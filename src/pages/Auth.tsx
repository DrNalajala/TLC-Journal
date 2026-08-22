import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../store/AppStore";
import { Btn, Field, IPlate } from "../components/ui";
import { DEMO_USERS } from "../data/seed";

export default function Auth() {
  const { login, register } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setError(null);
    if (busy) return;
    if (mode === "register") {
      if (name.trim().length < 3) return setError("Please enter your full name.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
    } else {
      if (!email || !password) return setError("Email and password are required.");
    }
    setBusy(true);
    // small latency for a realistic feel
    window.setTimeout(() => {
      const err = mode === "login" ? login(email, password) : register(name, email, password, affiliation);
      setBusy(false);
      if (err) return setError(err);
      navigate(next);
    }, 550);
  };

  return (
    <div className="graph-paper flex min-h-[80vh] items-center justify-center px-4 py-14">
      <div className="grid w-full max-w-4xl overflow-hidden border-2 border-ink bg-sheet shadow-[10px_10px_0_#10233b22] md:grid-cols-[0.9fr_1.1fr]">
        {/* left — journal pitch + demo accounts */}
        <div className="graph-paper-dark flex flex-col bg-navydeep p-8 text-[#f2f4f0]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center border border-uv/60 bg-uv/10 text-uv"><IPlate size={20} /></span>
            <span className="font-display text-xl font-black">TLC Journal</span>
          </div>
          <h1 className="mt-6 font-display text-3xl font-black leading-tight">
            Where reaction progress becomes a <span className="text-uv">scientific record.</span>
          </h1>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-[#aebdd0]">
            Authors submit and track communications; editors and reviewers run the technical check,
            editorial review and publication workflow.
          </p>
          <div className="mt-8">
            <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-uv">Demonstration accounts</p>
            <div className="mt-3 space-y-2">
              {DEMO_USERS.filter((u) => u.role !== "reviewer").map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setMode("login"); setEmail(u.email); setPassword("tlc-demo"); setError(null); }}
                  className="flex w-full items-center justify-between border border-white/15 bg-white/5 px-3 py-2 text-left transition-colors hover:border-uv hover:bg-uv/10"
                >
                  <span>
                    <span className="block text-[0.82rem] font-semibold">{u.name}</span>
                    <span className="block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#9db1c7]">{u.role} · {u.email}</span>
                  </span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-uv">use →</span>
                </button>
              ))}
              <p className="font-mono text-[0.6rem] text-[#7a90a8]">All demo passwords: <span className="text-[#c6d2e0]">tlc-demo</span></p>
            </div>
          </div>
        </div>

        {/* right — form */}
        <div className="p-8">
          <div className="flex border border-line">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] transition-colors ${
                  mode === m ? "bg-navy text-white" : "bg-white text-inksoft hover:text-navy"
                }`}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <Field label="Full name" required>
                  <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Doe" />
                </Field>
                <Field label="Affiliation (optional)">
                  <input className="field-input" value={affiliation} onChange={(e) => setAffiliation(e.target.value)} placeholder="University / Company" />
                </Field>
              </>
            )}
            <Field label="Email" required>
              <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@laboratory.org" onKeyDown={(e) => e.key === "Enter" && submit()} />
            </Field>
            <Field label="Password" required hint={mode === "register" ? "Minimum 6 characters." : undefined}>
              <input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && submit()} />
            </Field>
            {error && (
              <p className="border border-[#ecc4be] bg-[#faece9] px-3 py-2 text-[0.78rem] font-medium text-[#7c2b22]">{error}</p>
            )}
            <Btn variant="accent" size="lg" className="w-full" onClick={submit} disabled={busy}>
              {busy ? "Verifying…" : mode === "login" ? "Sign in" : "Create author account"}
            </Btn>
            <p className="text-center text-[0.72rem] text-inkfaint">
              Role-based access: author · reviewer · editor · admin. Accounts are created with the{" "}
              <strong className="text-inksoft">author</strong> role; editors are appointed by the editorial office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
