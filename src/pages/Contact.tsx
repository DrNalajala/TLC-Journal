import { useState } from "react";
import { useStore } from "../store/AppStore";
import { EDITORIAL_EMAIL } from "../data/constants";
import { Btn, Field, IMail, IUsers, Reveal, SectionHead } from "../components/ui";

const FAQS = [
  {
    q: "How long does review take?",
    a: "Technical check is usually completed within 2–3 working days; editorial review within 7–10 days. The median from submission to decision in Volume 1 is under two weeks. A premium rapid-review track is planned for a future release — it will never influence editorial decisions.",
  },
  {
    q: "Is there a publication fee?",
    a: "No. Submissions and publication are free in Volume 1. Future sustainability options (institutional memberships, educational courses) are architected but deliberately kept separate from editorial decisions.",
  },
  {
    q: "Can I submit industrial work?",
    a: "Yes — provided you are authorized to publish it. Select 'Industrial research — authorized for publication' in the declarations and never include trade secrets or regulated undisclosed data.",
  },
  {
    q: "What if my plate is unusual or the chemistry is incomplete?",
    a: "That is often the most valuable kind of communication. Unexpected spots, ambiguous completions and visualization surprises are exactly what this journal exists to preserve — just describe them honestly.",
  },
  {
    q: "Do you accept co-spots and multi-lane plates?",
    a: "Enthusiastically. The lane designer supports any number of lanes, and co-spots are recommended for every monitoring study.",
  },
];

export default function Contact() {
  const { toast } = useStore();
  const [form, setForm] = useState({ name: "", email: "", topic: "General enquiry", message: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const send = () => {
    if (form.name.trim().length < 2) return setErr("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr("Please enter a valid email.");
    if (form.message.trim().length < 10) return setErr("Please write at least a sentence.");
    setErr(null);
    setSent(true);
    toast("Message recorded — the editorial office replies within 3 working days.", "ok");
  };

  return (
    <div className="graph-paper min-h-screen">
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <Reveal>
          <SectionHead
            code="§ CONTACT"
            title="Editorial office"
            desc="Questions about a submission, a revision, licensing, or the journal itself — write to us. Every message is read by a human editor."
          />
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal delay={80}>
            <div className="space-y-4">
              {[
                {
                  icon: <IMail size={18} />,
                  t: "Editorial office",
                  d: (
                    <>
                      <a href={`mailto:${EDITORIAL_EMAIL}`} className="font-mono text-[0.8rem] font-bold text-navy underline decoration-uv decoration-2 underline-offset-4 transition-colors hover:text-uvdeep">
                        {EDITORIAL_EMAIL}
                      </a>{" "}
                      — submissions, decisions, corrections.
                    </>
                  ),
                },
                { icon: <IUsers size={18} />, t: "Editor-in-Chief", d: <>For appeals, board matters and special collections, write to <a href={`mailto:${EDITORIAL_EMAIL}`} className="font-mono text-[0.8rem] font-bold text-navy underline decoration-uv decoration-2 underline-offset-4 transition-colors hover:text-uvdeep">{EDITORIAL_EMAIL}</a>.</> },
              ].map((c, i) => (
                <div key={c.t} className="flex gap-4 border border-line bg-sheet p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <span className="grid h-11 w-11 shrink-0 place-items-center border border-navy/40 bg-sky text-navy">{c.icon}</span>
                  <div>
                    <h3 className="font-display text-[1.05rem] font-bold text-ink">{c.t}</h3>
                    <p className="mt-1 text-[0.8rem] leading-relaxed text-inksoft">{c.d}</p>
                  </div>
                </div>
              ))}

              <div className="border border-line bg-navydeep p-5 text-[#f2f4f0]">
                <h3 className="font-display text-lg font-bold">Frequently asked</h3>
                <div className="mt-3 space-y-3">
                  {FAQS.map((f) => (
                    <details key={f.q} className="group border border-white/15 bg-white/5 px-3.5 py-2.5">
                      <summary className="cursor-pointer list-none font-mono text-[0.72rem] font-bold uppercase tracking-[0.08em] text-uv transition-colors group-open:text-uvglow">
                        {f.q}
                      </summary>
                      <p className="mt-2 text-[0.78rem] leading-relaxed text-[#c6d2e0]">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="border border-line bg-sheet p-6 sm:p-7">
              {sent ? (
                <div className="py-10 text-center">
                  <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.2em] text-uvdeep">Message received</p>
                  <h2 className="mt-3 font-display text-3xl font-black text-ink">Thank you, {form.name.split(" ")[0]}.</h2>
                  <p className="mx-auto mt-3 max-w-sm text-[0.88rem] leading-relaxed text-inksoft">
                    Your enquiry about <strong className="text-ink">{form.topic.toLowerCase()}</strong> is in the
                    editorial queue. Expect a reply to <strong className="text-ink">{form.email}</strong> within
                    three working days.
                  </p>
                  <Btn variant="outline" className="mt-6" onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "General enquiry", message: "" }); }}>
                    Send another message
                  </Btn>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-ink">Write to the journal</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Your name" required>
                      <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Doe" />
                    </Field>
                    <Field label="Email" required>
                      <input className="field-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@lab.org" />
                    </Field>
                  </div>
                  <Field label="Topic">
                    <select className="field-input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                      {["General enquiry", "Submission status", "Revision question", "Correction request", "Editorial board", "Licensing & reuse", "Institutional membership", "Press"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Message" required>
                    <textarea rows={6} className="field-input resize-y" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can the editorial office help?" />
                  </Field>
                  {err && <p className="border border-[#ecc4be] bg-[#faece9] px-3 py-2 text-[0.78rem] font-medium text-[#7c2b22]">{err}</p>}
                  <Btn variant="accent" size="lg" onClick={send}>Send message</Btn>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
