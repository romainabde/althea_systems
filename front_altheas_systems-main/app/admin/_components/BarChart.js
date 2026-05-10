"use client";

// =============================================================================
// BarChart (SVG) – histogramme simple
// -----------------------------------------------------------------------------
// data: [{ label: "Lun", value: 1234 }, ...]
// =============================================================================

export default function BarChart({
  data,
  height = 260,
  color = "#003d5c",
  yLabel = "Valeur",
}) {
  const width = 720;
  const padding = { top: 20, right: 16, bottom: 40, left: 56 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxValue = Math.max(1, ...data.map((d) => d.value));
  const niceMax = niceCeil(maxValue);
  const barCount = data.length;
  const barGap = 8;
  const barWidth =
    barCount > 0 ? Math.max(8, (innerW - barGap * (barCount - 1)) / barCount) : 0;

  // Échelle Y : 5 ticks
  const yTicks = 5;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((niceMax / yTicks) * i)
  );

  return (
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

      {data.map((d, i) => {
        const x = padding.left + i * (barWidth + barGap);
        const h = (d.value / niceMax) * innerH;
        const y = padding.top + innerH - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              fill={color}
              rx="3"
            >
              <title>{`${d.label} : ${formatNumber(d.value)}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={padding.top + innerH + 16}
              textAnchor="middle"
              fontSize="11"
              fill="#475569"
            >
              {d.label}
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
