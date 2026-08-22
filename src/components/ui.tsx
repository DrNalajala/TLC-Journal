import React, { useEffect, useRef, useState } from "react";
import type { ArticleStatus } from "../types";
import { STATUS_META } from "../data/constants";
import { useStore } from "../store/AppStore";

/* ------------------------------ icons ------------------------------ */
type IconProps = { size?: number; className?: string; strokeWidth?: number };
const mk =
  (path: React.ReactNode) =>
  ({ size = 18, className = "", strokeWidth = 1.7 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );

export const IPlate = mk(
  <>
    <rect x="6" y="3" width="12" height="18" rx="1.5" />
    <line x1="8.5" y1="18" x2="15.5" y2="18" strokeDasharray="1.6 1.6" />
    <circle cx="10" cy="8" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="13.6" cy="12.4" r="1.5" fill="currentColor" stroke="none" />
  </>,
);
export const IFlask = mk(
  <>
    <path d="M10 3v6L4.6 18a2 2 0 0 0 1.8 3h11.2a2 2 0 0 0 1.8-3L14 9V3" />
    <line x1="8.5" y1="3" x2="15.5" y2="3" />
    <path d="M7.5 15h9" />
  </>,
);
export const ISearch = mk(
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.2" y2="16.2" />
  </>,
);
export const IDoc = mk(
  <>
    <path d="M6 2.5h8.5L19 7v14.5H6z" />
    <path d="M14 3v4.5h4.5" />
    <line x1="9" y1="12" x2="15.5" y2="12" />
    <line x1="9" y1="15.5" x2="15.5" y2="15.5" />
  </>,
);
export const IDownload = mk(
  <>
    <path d="M12 3v11" />
    <path d="M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4 17v3h16v-3" />
  </>,
);
export const IUpload = mk(
  <>
    <path d="M12 15V4" />
    <path d="M7.5 8.5 12 4l4.5 4.5" />
    <path d="M4 17v3h16v-3" />
  </>,
);
export const ICheck = mk(<path d="M4.5 12.5 10 18 19.5 6.5" />);
export const IX = mk(
  <>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </>,
);
export const IArrow = mk(
  <>
    <line x1="4" y1="12" x2="19" y2="12" />
    <path d="m14 7 5 5-5 5" />
  </>,
);
export const IChevron = mk(<path d="m8 5 8 7-8 7" />);
export const IPlus = mk(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
);
export const ITrash = mk(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6.5 7 8 20h8l1.5-13" />
  </>,
);
export const IEdit = mk(
  <>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" />
    <line x1="14" y1="7" x2="17" y2="10" />
  </>,
);
export const IUV = mk(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
  </>,
);
export const IDrop = mk(<path d="M12 3s6.5 7.2 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.2 12 3 12 3z" />);
export const IEye = mk(
  <>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);
export const IShare = mk(
  <>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <line x1="8.2" y1="10.8" x2="15.8" y2="7.2" />
    <line x1="8.2" y1="13.2" x2="15.8" y2="16.8" />
  </>,
);
export const IQuote = mk(
  <>
    <path d="M5 13.5V10a4 4 0 0 1 4-4v2.5A1.8 1.8 0 0 0 7.3 10H10v6H5z" />
    <path d="M14 13.5V10a4 4 0 0 1 4-4v2.5a1.8 1.8 0 0 0-1.7 1.5H19v6h-5z" />
  </>,
);
export const IMenu = mk(
  <>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </>,
);
export const ILock = mk(
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </>,
);
export const IUsers = mk(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M15.6 14.6A4.8 4.8 0 0 1 20.8 19.4" />
  </>,
);
export const IRotate = mk(
  <>
    <path d="M20 12a8 8 0 1 1-2.5-5.8" />
    <path d="M20 3v4h-4" />
  </>,
);
export const IRuler = mk(
  <>
    <rect x="2.5" y="9" width="19" height="6" rx="1" transform="rotate(-15 12 12)" />
    <line x1="8" y1="9.3" x2="8.8" y2="11.4" />
    <line x1="12" y1="8.2" x2="12.8" y2="10.3" />
    <line x1="16" y1="7.2" x2="16.8" y2="9.3" />
  </>,
);
export const IStamp = mk(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="5.2" strokeDasharray="2 2" />
    <path d="m9.3 12.2 2 2 3.7-4.2" />
  </>,
);
export const IAlert = mk(
  <>
    <path d="M12 3 2.5 20h19z" />
    <line x1="12" y1="9.5" x2="12" y2="14" />
    <circle cx="12" cy="16.8" r="0.4" fill="currentColor" />
  </>,
);
export const ILayers = mk(
  <>
    <path d="m12 3 9 5-9 5-9-5z" />
    <path d="m4.5 12.5 7.5 4.2 7.5-4.2" />
    <path d="m4.5 16.5 7.5 4.2 7.5-4.2" />
  </>,
);
export const IMail = mk(
  <>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </>,
);
export const IBell = mk(
  <>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </>,
);

export const IPin = mk(
  <>
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 1 1 13 0c0 5-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.2" />
  </>,
);

/* --------------------------- scroll reveal -------------------------- */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, seen };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, seen } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${seen ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------ badges ------------------------------ */
const TONES: Record<string, string> = {
  slate: "bg-[#eef1f4] text-[#44586e] border-[#cfd8e0]",
  blue: "bg-[#e7eff6] text-[#1d5c9c] border-[#bcd3e6]",
  amber: "bg-[#f7edd8] text-[#8a5a12] border-[#e5d2a4]",
  red: "bg-[#f9e7e4] text-[#a33327] border-[#ecc4be]",
  green: "bg-[#e5f0e6] text-[#2f6b41] border-[#bfdcc4]",
  navy: "bg-[#14365c] text-[#f2f4f0] border-[#14365c]",
  violet: "bg-[#ece8f5] text-[#5b4a8f] border-[#d3c9e8]",
};

export function StatusBadge({ status, pulse }: { status: ArticleStatus; pulse?: boolean }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${TONES[meta.tone]}`}
    >
      {pulse && <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {meta.label}
    </span>
  );
}

export function Tag({ children, tone = "slate" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] ${TONES[tone] ?? TONES.slate}`}
    >
      {children}
    </span>
  );
}

export function DemoTag() {
  return (
    <span className="inline-flex items-center gap-1 border border-[#ecc4be] bg-[#f9e7e4] px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#a33327]">
      <IAlert size={11} /> Demo · Not a real experiment
    </span>
  );
}

/* ----------------------------- section head ------------------------- */
export function SectionHead({
  code,
  title,
  desc,
  light,
}: {
  code: string;
  title: string;
  desc?: string;
  light?: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-3">
        <span
          className={`border px-2 py-0.5 font-mono text-[0.65rem] font-bold tracking-[0.18em] ${
            light ? "border-uv/60 text-uv" : "border-navy/50 text-navy"
          }`}
        >
          {code}
        </span>
        <span
          className={`h-px flex-1 ${light ? "bg-white/15" : "bg-ink/15"}`}
        />
      </div>
      <h2
        className={`font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          light ? "text-[#f2f4f0]" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p className={`mt-2 max-w-2xl text-[0.95rem] leading-relaxed ${light ? "text-[#aebdd0]" : "text-inksoft"}`}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ------------------------------- buttons ---------------------------- */
export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "accent" | "ghost" | "danger" | "outline" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-[0.78rem]",
    md: "px-4 py-2.5 text-[0.85rem]",
    lg: "px-6 py-3 text-[0.95rem]",
  };
  const variants = {
    primary: "bg-navy text-[#f2f4f0] hover:bg-ink border border-navy hover:border-ink",
    accent: "bg-uvdeep text-[#f5f8ef] hover:bg-[#3a6b1f] border border-uvdeep",
    ghost: "bg-transparent text-navy hover:bg-navy/5 border border-line",
    outline: "bg-transparent text-navy hover:bg-navy hover:text-[#f2f4f0] border border-navy/50 hover:border-navy",
    danger: "bg-transparent text-[#a33327] hover:bg-[#a33327] hover:text-white border border-[#e0b3ad]",
    dark: "bg-[#f2f4f0] text-ink hover:bg-white border border-[#3d5268]",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-[3px] font-semibold tracking-wide transition-all duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------- field ------------------------------ */
export function Field({
  label,
  children,
  error,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="field-label mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-[#a33327]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[0.72rem] text-inkfaint">{hint}</p>}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[0.72rem] font-medium text-[#a33327]">
          <IAlert size={12} /> {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------ toasts ------------------------------ */
export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-2.5 border px-3.5 py-3 text-[0.82rem] font-medium shadow-lg backdrop-blur-sm ${
            t.kind === "ok"
              ? "border-[#bfdcc4] bg-[#eef6ef]/95 text-[#234f31]"
              : t.kind === "warn"
                ? "border-[#e5d2a4] bg-[#faf3e0]/95 text-[#6d4a0d]"
                : "border-[#ecc4be] bg-[#faece9]/95 text-[#7c2b22]"
          }`}
          style={{ animation: "fade-up 0.3s ease-out" }}
        >
          <span className="mt-0.5">
            {t.kind === "ok" ? <ICheck size={14} /> : <IAlert size={14} />}
          </span>
          <span className="flex-1">{t.text}</span>
          <button onClick={() => dismissToast(t.id)} className="opacity-50 hover:opacity-100">
            <IX size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- modal ------------------------------ */
export function Modal({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#0b1c30]/60 p-4 backdrop-blur-[3px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`my-8 w-full ${wide ? "max-w-4xl" : "max-w-xl"} border border-line bg-sheet shadow-2xl`}
        style={{ animation: "fade-up 0.25s ease-out" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------------------- page gauge ---------------------------- */
export function PageGauge({ pct, compact }: { pct: number; compact?: boolean }) {
  const over = pct > 100;
  const near = pct > 88 && pct <= 100;
  const color = over ? "#a33327" : near ? "#8a5a12" : "#2f7d4f";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="field-label">Estimated length</span>
        <span className="font-mono text-[0.8rem] font-bold tabular" style={{ color }}>
          {pct}% of one A4 page
        </span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-sm border border-line bg-white">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: `${Math.min(100, pct)}%`,
            backgroundColor: color,
            backgroundImage: over
              ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 12px)"
              : undefined,
          }}
        />
      </div>
      {!compact && (
        <p className="mt-1.5 text-[0.72rem] leading-snug text-inkfaint">
          {over
            ? "Content exceeds the one-page limit — shorten the description or ask the editor for an override."
            : near
              ? "Approaching the limit. Keep the interpretation concise."
              : "Comfortably within the one-A4-page format."}
        </p>
      )}
    </div>
  );
}

/* ------------------------------ dot scale --------------------------- */
export function DotScale({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= value;
        const inner = (
          <span
            className={`inline-block h-3 w-3 rounded-full border transition-all duration-200 ${
              on ? "border-navy bg-navy" : "border-[#b9c4ce] bg-white"
            } ${readOnly ? "" : "group-hover:scale-110"}`}
          />
        );
        return readOnly ? (
          <span key={i}>{inner}</span>
        ) : (
          <button
            key={i}
            type="button"
            aria-label={`Set to ${i}`}
            className="group p-0.5"
            onClick={() => onChange?.(i)}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="dot-grid flex flex-col items-center justify-center border border-dashed border-[#b9c4ce] bg-white/60 px-6 py-14 text-center">
      <IPlate size={34} className="text-[#8ea0b5]" />
      <h3 className="mt-4 font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-[0.85rem] text-inksoft">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
