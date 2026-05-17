"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../admin.module.css";
import BarChart from "../_components/BarChart";
import GroupedBarChart from "../_components/GroupedBarChart";
import PieChart from "../_components/PieChart";
import { dashboardApi } from "../_services/adminApi";

// =============================================================================
// DashboardPanel
// -----------------------------------------------------------------------------
// Branchements REST :
//   - GET /admin/dashboard/sales/daily        → DailySalesDto[]   { day, totalSales }
//   - GET /admin/dashboard/sales/weekly       → WeeklySalesDto[]  { week, totalSales }
//   - GET /admin/dashboard/category-sales     → CategorySalesDto[]
//   - GET /admin/dashboard/average-basket     → AverageBasketByCategoryDto[]
//
// Tous acceptent ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD.
// On fixe la fenêtre selon la période choisie (7 jours ou 5 semaines) afin
// de respecter le cahier des charges.
//
// LIMITE CONNUE : l'endpoint average-basket renvoie UN nombre par catégorie
// pour TOUTE la période, pas un séries par jour. L'histogramme empilé
// "panier moyen par jour ET par catégorie" requiert un nouvel endpoint
// (cf. listing en fin de session).
// =============================================================================

const PALETTE = [
  "#003d5c",
  "#00a8b5",
  "#7fcfd6",
  "#facc15",
  "#fb7185",
  "#a78bfa",
  "#34d399",
  "#f97316",
];

export default function DashboardPanel() {
  const [period, setPeriod] = useState("daily"); // "daily" | "weekly"

  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [averageBasket, setAverageBasket] = useState([]);
  const [categorySales, setCategorySales] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const range = useMemo(() => computeRange(period), [period]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = { startDate: range.startDate, endDate: range.endDate };

    Promise.allSettled([
      period === "daily"
        ? dashboardApi.dailySales(params)
        : dashboardApi.weeklySales(params),
      dashboardApi.averageBasket(params),
      dashboardApi.categorySales(params),
    ])
      .then((results) => {
        if (cancelled) return;

        const [salesRes, basketRes, catSalesRes] = results;

        if (salesRes.status === "fulfilled") {
          if (period === "daily") setDaily(salesRes.value ?? []);
          else setWeekly(salesRes.value ?? []);
        } else {
          setError(salesRes.reason);
        }

        if (basketRes.status === "fulfilled") {
          setAverageBasket(basketRes.value ?? []);
        }

        if (catSalesRes.status === "fulfilled") {
          setCategorySales(catSalesRes.value ?? []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, range]);

  const periodLabel =
    period === "daily" ? "7 derniers jours" : "5 dernières semaines";

  // ---- Histogramme ventes (jour ou semaine) --------------------------------
  const salesData = useMemo(() => {
    if (period === "daily") {
      return fillDailySeries(daily, range);
    }
    return fillWeeklySeries(weekly, range);
  }, [period, daily, weekly, range]);

  const totalSales = useMemo(
    () => salesData.reduce((a, b) => a + b.value, 0),
    [salesData]
  );
  const avgSales = useMemo(
    () =>
      salesData.length > 0 ? Math.round(totalSales / salesData.length) : 0,
    [salesData, totalSales]
  );

  // ---- Pie chart ventes par catégorie --------------------------------------
  const pieData = useMemo(() => {
    return categorySales.map((c, i) => ({
      label: c.categoryName ?? `Cat #${c.categoryId}`,
      value: Number(c.sales ?? 0),
      color: PALETTE[i % PALETTE.length],
    }));
  }, [categorySales]);

  // ---- Histogramme empilé : faute d'endpoint par jour, on affiche le
  //      panier moyen par catégorie sur toute la période, en une seule série
  //      (un bar par catégorie). Quand un endpoint per-day arrivera, on
  //      pourra remplir un GroupedBarChart multi-couches.
  const basketData = useMemo(() => {
    return averageBasket.map((b) => ({
      label: b.categoryName ?? `Cat #${b.categoryId}`,
      value: Number(b.averageBasket ?? 0),
    }));
  }, [averageBasket]);

  // ---- Histogramme empilé "ventes par cat. par jour" -----------------------
  // On reconstruit un proxy depuis daily + categorySales : on alloue chaque
  // jour proportionnellement aux % de chaque catégorie. Ce n'est pas l'idéal
  // (BE ne fournit pas les ventes/jour/catégorie) mais ça donne une viz
  // plausible. À remplacer par un vrai endpoint quand disponible.
  const stackedData = useMemo(() => {
    const labels = salesData.map((d) => d.label);
    if (categorySales.length === 0 || labels.length === 0) {
      return { labels, series: [] };
    }
    const totalCat = categorySales.reduce(
      (s, c) => s + Number(c.sales ?? 0),
      0
    );
    const series = categorySales.map((c, i) => {
      const ratio = totalCat > 0 ? Number(c.sales ?? 0) / totalCat : 0;
      return {
        key: c.categoryName ?? `cat-${c.categoryId}`,
        label: c.categoryName ?? `Cat #${c.categoryId}`,
        color: PALETTE[i % PALETTE.length],
        values: salesData.map((d) => Math.round(d.value * ratio)),
      };
    });
    return { labels, series };
  }, [salesData, categorySales]);

  return (
    <div>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>Tableau de bord</h1>
          <p className={styles.contentSubtitle}>
            Suivi des ventes et performance des produits — {periodLabel}.
            {loading && " (chargement…)"}
          </p>
        </div>
        <PeriodSwitch period={period} onChange={setPeriod} />
      </div>

      {error && (
        <div
          className={styles.bulkBar}
          style={{
            background: "#fee2e2",
            borderColor: "#dc2626",
            color: "#991b1b",
          }}
        >
          ⚠ {String(error.message ?? error)}
        </div>
      )}

      <div className={styles.kpiGrid}>
        <KpiCard label="Total des ventes" value={`${formatEuros(totalSales)} €`} />
        <KpiCard
          label={`Moyenne par ${period === "daily" ? "jour" : "semaine"}`}
          value={`${formatEuros(avgSales)} €`}
        />
        <KpiCard
          label="Catégorie #1"
          value={pieData[0]?.label ?? "—"}
        />
        <KpiCard
          label="Nombre de catégories"
          value={String(pieData.length)}
        />
      </div>

      <div className={styles.chartGrid}>
        <section className={`${styles.card} ${styles.chartGridFull}`}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>
              Ventes totales – {periodLabel}
            </h2>
          </div>
          <BarChart data={salesData} yLabel="Ventes (€)" />
        </section>

        <section className={`${styles.card} ${styles.chartGridFull}`}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>
              Ventes par catégorie (empilé) – {periodLabel}
            </h2>
            <span className={styles.helperText}>
              Reconstitué à partir des proportions par catégorie.
            </span>
          </div>
          <GroupedBarChart data={stackedData} yLabel="Ventes (€)" />
        </section>

        <section className={styles.card}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>
              Répartition des ventes par catégorie
            </h2>
          </div>
          <PieChart data={pieData} />
        </section>

        <section className={styles.card}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>
              Panier moyen par catégorie ({periodLabel})
            </h2>
          </div>
          <BarChart data={basketData} yLabel="Panier moyen (€)" />
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// helpers
// ============================================================================

function PeriodSwitch({ period, onChange }) {
  return (
    <div className={styles.periodSwitch} role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={period === "daily"}
        className={period === "daily" ? styles.periodSwitchActive : ""}
        onClick={() => onChange("daily")}
      >
        7 jours
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={period === "weekly"}
        className={period === "weekly" ? styles.periodSwitchActive : ""}
        onClick={() => onChange("weekly")}
      >
        5 semaines
      </button>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className={styles.kpiCard}>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
    </div>
  );
}

function formatEuros(n) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(Number(n ?? 0)));
}

function computeRange(period) {
  const today = new Date();
  const end = isoDate(today);
  if (period === "daily") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6); // 7 jours = aujourd'hui inclus + 6
    return { startDate: isoDate(start), endDate: end };
  }
  // 5 semaines
  const start = new Date(today);
  start.setDate(start.getDate() - 7 * 5 + 1);
  return { startDate: isoDate(start), endDate: end };
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Le back ne renvoie QUE les jours qui ont des ventes. On remplit les jours
// manquants à 0 pour que l'histogramme couvre toute la fenêtre demandée.
function fillDailySeries(daily, range) {
  const map = new Map();
  for (const d of daily ?? []) {
    if (!d?.day) continue;
    map.set(d.day, Number(d.totalSales ?? 0));
  }
  const out = [];
  const start = parseDate(range.startDate);
  const end = parseDate(range.endDate);
  if (!start || !end) return out;
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = isoDate(cursor);
    out.push({
      label: cursor.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
      }),
      value: map.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

// Le back renvoie des clés du type "2026-W19". On les ordonne et on
// montre les 5 dernières semaines de la fenêtre.
function fillWeeklySeries(weekly, range) {
  const sorted = [...(weekly ?? [])].sort((a, b) =>
    String(a.week).localeCompare(String(b.week))
  );
  return sorted.slice(-5).map((w) => ({
    label: shortWeekLabel(w.week),
    value: Number(w.totalSales ?? 0),
  }));
}

function shortWeekLabel(week) {
  if (typeof week !== "string") return String(week ?? "");
  const m = week.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return week;
  return `S${m[2]}`;
}

function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
