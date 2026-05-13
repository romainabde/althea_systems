"use client";

import styles from "../admin.module.css";

// =============================================================================
// PieChart (SVG)
// -----------------------------------------------------------------------------
// data: [{ label, value, color }, ...]
// =============================================================================

export default function PieChart({ data, size = 260 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;
  const slices = data.map((d) => {
    const start = cumulative;
    const portion = total === 0 ? 0 : d.value / total;
    cumulative += portion;
    const end = cumulative;
    return { ...d, start, end, portion };
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "1.25rem",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Répartition par catégorie"
      >
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={radius} fill="#e2e8f0" />
        ) : slices.length === 1 ? (
          <circle cx={cx} cy={cy} r={radius} fill={slices[0].color}>
            <title>{`${slices[0].label} : 100%`}</title>
          </circle>
        ) : (
          slices.map((s, i) => {
            const path = describeArc(cx, cy, radius, s.start, s.end);
            const pct = (s.portion * 100).toFixed(1);
            return (
              <path key={i} d={path} fill={s.color} stroke="#ffffff" strokeWidth="1">
                <title>{`${s.label} : ${pct}%`}</title>
              </path>
            );
          })
        )}
      </svg>

      <div style={{ minWidth: "160px" }}>
        {slices.map((s) => {
          const pct = total === 0 ? 0 : (s.portion * 100).toFixed(1);
          return (
            <div
              key={s.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.5rem",
                marginBottom: "0.35rem",
                fontSize: "0.85rem",
              }}
            >
              <span>
                <span
                  className={styles.legendDot}
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <strong style={{ color: "#003d5c" }}>{pct}%</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function polarToCartesian(cx, cy, r, fraction) {
  const angle = fraction * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function describeArc(cx, cy, r, startFraction, endFraction) {
  const start = polarToCartesian(cx, cy, r, startFraction);
  const end = polarToCartesian(cx, cy, r, endFraction);
  const largeArc = endFraction - startFraction > 0.5 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}
