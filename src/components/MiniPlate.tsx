import type { Lane, SpotMark } from "../types";

/**
 * Schematic TLC plate renderer — draws lanes, baseline, solvent front and
 * spots from structured data. Purely a display layer; never touches the
 * original photograph.
 */
export default function MiniPlate({
  lanes,
  spots,
  height = 220,
  animate = false,
  showLabels = true,
  tone = "uv",
  className = "",
  hoverDevelop = false,
}: {
  lanes: Lane[];
  spots: SpotMark[];
  height?: number;
  animate?: boolean;
  showLabels?: boolean;
  tone?: "uv" | "paper";
  className?: string;
  hoverDevelop?: boolean;
}) {
  const W = 200;
  const labelH = showLabels ? 26 : 0;
  const H = height;
  const plateY = 6;
  const plateH = H - labelH - 12;
  const baseline = plateY + plateH - 14;
  const front = plateY + 16;
  const laneW = W / Math.max(1, lanes.length);

  const bg =
    tone === "uv"
      ? { plate: "#c8d39f", plateDark: "#a9b87f", spot: "#1b2312", edge: "#8a9a66" }
      : { plate: "#f3efe4", plateDark: "#e4ddc9", spot: "#8a5a20", edge: "#c9bfa4" };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label="Schematic TLC plate"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`plateGrad-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg.plateDark} />
          <stop offset="100%" stopColor={bg.plate} />
        </linearGradient>
        <filter id="spotBlur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <rect x="4" y={plateY} width={W - 8} height={plateH} rx="4" fill={`url(#plateGrad-${tone})`} stroke={bg.edge} strokeWidth="1" />

      {/* solvent front */}
      <line x1="10" y1={front} x2={W - 10} y2={front} stroke="#5c684a" strokeWidth="1" strokeDasharray="4 3" opacity="0.75" />
      {/* baseline */}
      <line x1="10" y1={baseline} x2={W - 10} y2={baseline} stroke="#5c684a" strokeWidth="1" strokeDasharray="2.5 2.5" opacity="0.9" />

      {/* lane separators */}
      {lanes.slice(1).map((_, i) => (
        <line
          key={i}
          x1={(i + 1) * laneW}
          y1={plateY + 8}
          x2={(i + 1) * laneW}
          y2={plateY + plateH - 8}
          stroke={bg.edge}
          strokeWidth="0.5"
          opacity="0.45"
        />
      ))}

      {/* spots */}
      {spots.map((sp, i) => {
        const cx = (sp.lane - 0.5) * laneW;
        const cy = baseline - sp.rf * (baseline - front - 6);
        const r = 3.2 + sp.intensity * 1.9;
        const fill =
          sp.tint === "iodine" ? "#6b4418" : sp.tint === "stain" ? "#7d4a12" : bg.spot;
        const opacity = 0.45 + sp.intensity * 0.18;
        return (
          <g
            key={i}
            className={animate ? "anim-spot" : hoverDevelop ? "plate-spot-hover" : undefined}
            style={animate ? { animationDelay: `${0.9 + i * 0.5}s` } : undefined}
          >
            <ellipse cx={cx} cy={cy} rx={r * 1.25} ry={r} fill={fill} opacity={opacity} filter="url(#spotBlur)" />
            <ellipse cx={cx} cy={cy} rx={r * 0.62} ry={r * 0.52} fill={fill} opacity={Math.min(1, opacity + 0.25)} />
          </g>
        );
      })}

      {/* lane labels */}
      {showLabels &&
        lanes.map((l, i) => (
          <text
            key={l.id}
            x={(i + 0.5) * laneW}
            y={H - 8}
            textAnchor="middle"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="8.2"
            fontWeight="600"
            fill="#44586e"
          >
            {i + 1}·{l.label.length > 9 ? l.label.slice(0, 8) + "…" : l.label}
          </text>
        ))}
    </svg>
  );
}
