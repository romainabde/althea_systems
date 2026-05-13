"use client";

import styles from "../admin.module.css";

// =============================================================================
// GroupedBarChart (SVG) – histogramme multi-couches (empilé) par catégorie
// -----------------------------------------------------------------------------
// data:
//   {
//     labels:   ["Lun","Mar",...],
//     series:   [
//       { key: "imagerie", label: "Imagerie", color: "#003d5c", values: [12,15,...] },
//       { key: "chirurgie", label: "Chirurgie", color: "#00a8b5", values: [8,9,...] },
//       ...
//     ]
//   }
// Stack = empilé (le total représente le panier moyen toutes catégories).
// =============================================================================

export default function GroupedBarChart({
  data,
  height = 280,
  yLabel = "Panier moyen (€)",
}) {
  const width = 760;
  const padding = { top: 20, right: 16, bottom: 40, left: 56 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const labels = data?.labels ?? [];
  const series = data?.series ?? [];

  // Sommes par index (totaux empilés)
  const totals = labels.map((_, idx) =>
    series.reduce((sum, s) => sum + (s.values[idx] ?? 0), 0)
  );
  const maxValue = Math.max(1, ...totals);
  const niceMax = niceCeil(maxValue);

  const barGap = 12;
  const barCount = labels.length;
  const barWidth =
    barCount > 0
      ? Math.max(10, (innerW - barGap * (barCount - 1)) / barCount)
      : 0;

  const yTicks = 5;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((niceMax / yTicks) * i)
  );

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={yLabel}
        style={{ display: "block" }}
      >
        {ticks.map((t, i) => {
          const y = padding.top + innerH - (t / niceMax) * innerH;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={padding.left + innerW}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={i === 0 ? "0" : "3 3"}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
              >
                {formatNumber(t)}
              </text>
            </g>
          );
        })}

        {labels.map((label, idx) => {
          const x = padding.left + idx * (barWidth + barGap);
          let cumulative = 0;
          return (
            <g key={idx}>
              {series.map((s) => {
                const v = s.values[idx] ?? 0;
                const segH = (v / niceMax) * innerH;
                const y =
                  padding.top + innerH - (cumulative + v) * (innerH / niceMax);
                cumulative += v;
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={segH}
                    fill={s.color}
                  >
                    <title>{`${s.label} – ${label} : ${formatNumber(v)} €`}</title>
                  </rect>
                );
              })}
              <text
                x={x + barWidth / 2}
                y={padding.top + innerH + 16}
                textAnchor="middle"
                fontSize="11"
                fill="#475569"
              >
                {label}
              </text>
            </g>
          );
        })}

        <line
          x1={padding.left}
          x2={padding.left + innerW}
          y1={padding.top + innerH}
          y2={padding.top + innerH}
          stroke="#cbd5e1"
        />
      </svg>

      <div className={styles.legend}>
        {series.map((s) => (
          <span key={s.key}>
            <span
              className={styles.legendDot}
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function niceCeil(n) {
  if (n <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / exp;
  let nice;
  if (f <= 1) nice = 1;
  else if (f <= 2) nice = 2;
  else if (f <= 5) nice = 5;
  else nice = 10;
  return nice * exp;
}

function formatNumber(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
