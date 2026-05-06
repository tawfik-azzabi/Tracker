import { useState, useEffect, useContext, createContext, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// Ces valeurs viennent de ton fichier .env (injectées par Vite au build)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── THEME & STYLES ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d0f14;
    --bg2: #161920;
    --bg3: #1e2230;
    --card: #1a1d27;
    --border: #2a2d3d;
    --accent: #6c63ff;
    --accent2: #ff6584;
    --accent3: #43e97b;
    --accent4: #f7b731;
    --text: #e8eaf2;
    --muted: #8890a8;
    --green: #43e97b;
    --red: #ff6b6b;
    --yellow: #f7b731;
    --radius: 16px;
    --nav-h: 72px;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-body); }

  .app {
    max-width: 430px;
    margin: 0 auto;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    background: var(--bg);
  }

  .page {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px calc(var(--nav-h) + 16px);
    -webkit-overflow-scrolling: touch;
  }

  /* APP HEADER — absorbs iPhone notch via safe-area-inset-top */
  .app-header {
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    padding-top: env(safe-area-inset-top);
    flex-shrink: 0;
  }
  .app-title-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px 6px;
  }
  .app-title {
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .app-title span { color: var(--accent); }

  .month-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px 10px;
    background: var(--bg2);
  }
  .month-label {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--text);
    text-transform: uppercase;
  }
  .month-nav-btn {
    background: var(--bg3);
    border: none;
    color: var(--text);
    width: 34px; height: 34px;
    border-radius: 10px;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .month-nav-btn:active { background: var(--accent); }

  /* INHERIT BANNER */
  .inherit-banner {
    background: rgba(108,99,255,0.1);
    border: 1px solid rgba(108,99,255,0.25);
    border-radius: 12px;
    padding: 12px 14px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .inherit-banner-text { font-size: 12px; color: var(--muted); flex: 1; line-height: 1.4; }
  .inherit-banner-text strong { color: var(--text); display: block; margin-bottom: 2px; font-size: 13px; }
  .btn-inherit {
    background: var(--accent);
    color: #fff;
    border: none;
    font-family: var(--font-head);
    font-size: 11px;
    font-weight: 700;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

  /* SYNC STATUS */
  .sync-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
    transition: background 0.3s;
  }
  .sync-ok { background: var(--green); }
  .sync-pending { background: var(--yellow); animation: pulse 1s infinite; }
  .sync-error { background: var(--red); }
  .sync-label { font-size: 10px; color: var(--muted); display: flex; align-items: center; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .bottom-nav {
    position: fixed;
    bottom: 0; left: 50%;
    transform: translateX(-50%);
    width: 100%; max-width: 430px;
    height: var(--nav-h);
    background: var(--bg2);
    border-top: 1px solid var(--border);
    display: flex;
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .nav-item {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px;
    cursor: pointer;
    border: none; background: none;
    color: var(--muted);
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 500;
    transition: color 0.15s;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-item.active { color: var(--accent); }
  .nav-item svg { width: 22px; height: 22px; }
  .nav-dot { width: 4px; height: 4px; border-radius: 2px; background: var(--accent); opacity: 0; transition: opacity 0.15s; }
  .nav-item.active .nav-dot { opacity: 1; }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
  }
  .card-title {
    font-family: var(--font-head);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .dash-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }
  .dash-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
  }
  .dash-card-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .dash-card-main {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 800;
    line-height: 1;
  }
  .dash-card-prev {
    font-size: 11px;
    color: var(--muted);
    margin-top: 4px;
  }
  .pill {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    margin-top: 5px;
  }
  .pill-green { background: rgba(67,233,123,0.15); color: var(--green); }
  .pill-red { background: rgba(255,107,107,0.15); color: var(--red); }
  .pill-yellow { background: rgba(247,183,49,0.15); color: var(--yellow); }

  .chart-wrap { margin-bottom: 16px; }
  .chart-title {
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .bar-group { margin-bottom: 12px; }
  .bar-label { font-size: 11px; color: var(--muted); margin-bottom: 4px; display: flex; justify-content: space-between; }
  .bar-track { background: var(--bg3); border-radius: 4px; height: 8px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }

  /* SWIPEABLE ROW */
  .row-wrap {
    position: relative;
    margin-bottom: 8px;
    border-radius: 12px;
    overflow: hidden;
  }
  .row-delete-bg {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 72px;
    background: var(--red);
    display: flex; align-items: center; justify-content: center;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.04em;
    user-select: none;
  }
  .row-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    align-items: flex-end; /* align on bottom edge so input fields line up */
    gap: 8px;
    position: relative;
    transition: transform 0.2s ease;
    touch-action: pan-y;
    will-change: transform;
  }
  .row-item .label-input {
    margin-bottom: 0; /* sits at same baseline as amount inputs */
  }
  .row-item.swiped { transform: translateX(-72px); }

  .row-badge {
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
  }
  .badge-detail { background: rgba(108,99,255,0.2); color: var(--accent); }
  .badge-simple { background: var(--bg3); color: var(--muted); }

  .input-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
  }
  .input-micro-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    text-align: center;
    line-height: 1;
  }
  .amount-input {
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: 500;
    text-align: right;
    width: 66px; /* fits 6 digits comfortably */
    height: 38px; /* fixed height — same as label-input */
    padding: 0 6px;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .amount-input:focus { border-color: var(--accent); }
  .label-input {
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 16px;
    flex: 1;
    min-width: 0; /* allows flex shrink */
    height: 38px; /* fixed height — same as amount-input */
    padding: 0 10px;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .label-input:focus { border-color: var(--accent); }

  .btn-add {
    width: 100%;
    background: var(--bg3);
    border: 1px dashed var(--border);
    color: var(--muted);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    padding: 11px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s;
    margin-top: 4px;
  }
  .btn-add:active { border-color: var(--accent); color: var(--accent); }
  .btn-delete {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    opacity: 0.5;
    transition: opacity 0.15s;
  }
  .btn-delete:active { opacity: 1; color: var(--red); }
  .btn-primary {
    background: var(--accent);
    color: #fff;
    border: none;
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    padding: 10px 18px;
    border-radius: 10px;
    cursor: pointer;
    letter-spacing: 0.04em;
  }

  .totals-bar {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .totals-col { text-align: center; }
  .totals-val { font-family: var(--font-head); font-size: 15px; font-weight: 700; }
  .totals-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

  .back-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none; color: var(--accent);
    font-family: var(--font-body); font-size: 14px; font-weight: 500;
    cursor: pointer; padding: 0; margin-bottom: 16px;
  }
  .log-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .log-date { font-size: 11px; color: var(--muted); white-space: nowrap; }
  .log-desc { flex: 1; font-size: 13px; }
  .log-amount { font-family: var(--font-head); font-size: 15px; font-weight: 700; color: var(--accent2); }

  .add-log-form {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .form-row { display: flex; gap: 8px; align-items: center; }

  .solde-card {
    background: linear-gradient(135deg, #1e2046 0%, #2a1e46 100%);
    border: 1px solid rgba(108,99,255,0.3);
    border-radius: var(--radius);
    padding: 18px;
    margin-bottom: 16px;
  }

  .export-btn {
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--muted);
    font-family: var(--font-body);
    font-size: 12px;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    display: flex; align-items: center; gap: 6px;
  }

  /* LOADING SCREEN */
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 16px;
    background: var(--bg);
  }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: var(--muted); }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.25s ease both; }
  .empty { text-align: center; color: var(--muted); padding: 32px 0; font-size: 13px; }

  /* ── GAUGE ── */
  .gauge-wrap { margin-top: 5px; display: flex; align-items: center; gap: 6px; }
  .gauge-track { flex: 1; height: 4px; background: var(--bg3); border-radius: 2px; overflow: hidden; }
  .gauge-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease; }
  .gauge-pct { font-size: 10px; font-weight: 600; min-width: 30px; text-align: right; flex-shrink: 0; }

  /* ── ALERT BANNER ── */
  .alert-banner {
    background: rgba(247,183,49,0.1);
    border: 1px solid rgba(247,183,49,0.3);
    border-radius: 12px;
    padding: 12px 14px;
    margin-bottom: 14px;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .alert-banner-icon { font-size: 18px; flex-shrink: 0; line-height: 1.2; }
  .alert-banner-body { flex: 1; }
  .alert-banner-title {
    font-family: var(--font-head); font-size: 12px; font-weight: 700;
    color: var(--yellow); margin-bottom: 3px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .alert-banner-items { font-size: 12px; color: var(--muted); line-height: 1.6; }

  /* ── PROJECTION CARD (Dashboard) ── */
  .proj-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 14px; margin-bottom: 12px;
  }
  .proj-card-title {
    font-family: var(--font-head); font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 10px;
  }
  .proj-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 0; border-bottom: 1px solid var(--border); gap: 8px;
  }
  .proj-row:last-child { border-bottom: none; }
  .proj-row-label { font-size: 13px; flex: 1; }
  .proj-row-val { font-family: var(--font-head); font-size: 13px; font-weight: 700; text-align: right; }
  .proj-row-pct { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; }

  /* ── PROJECTION INLINE (Detail page) ── */
  .proj-inline {
    margin-top: 8px; padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .proj-inline-label { font-size: 11px; color: var(--muted); }
  .proj-inline-val { font-family: var(--font-head); font-size: 14px; font-weight: 700; }
  .proj-inline-pct { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }

  /* ── NAV BADGE ── */
  .nav-item-wrap { position: relative; display: flex; flex-direction: column; align-items: center; flex: 1; }
  .nav-badge {
    position: absolute; top: 2px; right: calc(50% - 18px);
    width: 7px; height: 7px;
    background: var(--red); border-radius: 50%; border: 1.5px solid var(--bg2);
  }
`;

// ─── DATA MODEL ────────────────────────────────────────────────────────────────
const CATEGORIES_TEMPLATE = {
  revenus: [
    { id: "r1", label: "Salaire", budget: 0, reel: 0 },
    { id: "r2", label: "Report", budget: 0, reel: 0 },
  ],
  factures: [
    { id: "f1", label: "Loyer", budget: 0, reel: 0 },
    { id: "f2", label: "Energie CIL", budget: 0, reel: 0 },
    { id: "f3", label: "Energie Faubourgs", budget: 0, reel: 0 },
    { id: "f4", label: "Téléphone", budget: 0, reel: 0 },
    { id: "f5", label: "Drive Sadek", budget: 0, reel: 0 },
    { id: "f6", label: "Nounou", budget: 0, reel: 0 },
    { id: "f7", label: "Syndic CIL", budget: 0, reel: 0 },
    { id: "f8", label: "Abonnements", budget: 0, reel: 0 },
  ],
  depenses: [
    { id: "d1", label: "Starbucks", budget: 0, reel: 0, type: "recurrent", logs: [] },
    { id: "d2", label: "Courses/Glovo", budget: 0, reel: 0, type: "recurrent", logs: [] },
    { id: "d3", label: "Restaurants", budget: 0, reel: 0, type: "recurrent", logs: [] },
    { id: "d4", label: "Vapes", budget: 0, reel: 0, type: "recurrent", logs: [] },
    { id: "d5", label: "Shopping", budget: 0, reel: 0, type: "simple" },
    { id: "d6", label: "Pressing / Lavage", budget: 0, reel: 0, type: "simple" },
    { id: "d7", label: "Lentilles", budget: 0, reel: 0, type: "simple" },
    { id: "d8", label: "Recharge Apple", budget: 0, reel: 0, type: "simple" },
  ],
  epargne: [
    { id: "e1", label: "Voyages", budget: 0, reel: 0 },
    { id: "e2", label: "Scolarité", budget: 0, reel: 0 },
    { id: "e3", label: "IGA", budget: 0, reel: 0 },
  ],
  dettes: [
    { id: "dt1", label: "Crédit Immo", budget: 0, reel: 0 },
    { id: "dt2", label: "Crédit Conso", budget: 0, reel: 0 },
    { id: "dt3", label: "Assurance Auto", budget: 0, reel: 0 },
  ],
};

const toKey = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

function createMonth() {
  return deepClone(CATEGORIES_TEMPLATE);
}

// localStorage comme cache local (fallback offline)
function localLoad(year, month) {
  const raw = localStorage.getItem(`budget_${toKey(year, month)}`);
  return raw ? JSON.parse(raw) : null;
}
function localSave(year, month, data) {
  localStorage.setItem(`budget_${toKey(year, month)}`, JSON.stringify(data));
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── SUPABASE HELPERS ─────────────────────────────────────────────────────────
async function dbLoad(year, month) {
  const { data, error } = await supabase
    .from("budget_months")
    .select("data")
    .eq("month_key", toKey(year, month))
    .single();

  if (error || !data) return null;
  return data.data;
}

async function dbSave(year, month, payload) {
  const month_key = toKey(year, month);
  const { error } = await supabase
    .from("budget_months")
    .upsert({ month_key, data: payload }, { onConflict: "month_key" });
  if (error) throw error;
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
function useApp() { return useContext(AppCtx); }

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("fr-MA", { maximumFractionDigits: 0 }) + " MAD";
};
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ─── TOTALS ───────────────────────────────────────────────────────────────────
function sumSection(items) {
  const budget = items.reduce((s, i) => s + (Number(i.budget) || 0), 0);
  const reel = items.reduce((s, i) => {
    // Use logs if the item has them AND is not in simple mode
    const useLogTotal = Array.isArray(i.logs) && i.logs.length > 0
      && (i.type === "recurrent" || i.type === "ponctuel" || i.type === "detail");
    const r = useLogTotal
      ? i.logs.reduce((a, l) => a + (Number(l.amount) || 0), 0)
      : Number(i.reel) || 0;
    return s + r;
  }, 0);
  return { budget, reel };
}

function calcSolde(data) {
  const rev = sumSection(data.revenus);
  const fac = sumSection(data.factures);
  const dep = sumSection(data.depenses);
  const epa = sumSection(data.epargne);
  const det = sumSection(data.dettes);
  return {
    budget: rev.budget - fac.budget - dep.budget - epa.budget - det.budget,
    reel: rev.reel - fac.reel - dep.reel - epa.reel - det.reel,
  };
}

// ─── PROJECTION HELPER ────────────────────────────────────────────────────────
// Only applies to type="recurrent". "ponctuel" and "detail" (legacy) show no projection.
function calcProjection(item, year, month) {
  if (item.type !== "recurrent") return null;
  const logs = item.logs || [];
  if (logs.length === 0) return null;

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = isCurrentMonth ? now.getDate() : daysInMonth;
  if (today < 3) return { insufficient: true };

  const total = logs.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  if (total === 0) return null;

  const dailyRate = total / today;
  const projected = Math.round(dailyRate * daysInMonth);
  const budget = Number(item.budget) || 0;
  const pct = budget > 0 ? Math.round((projected / budget) * 100) : null;
  const overBudget = budget > 0 && projected > budget;

  return { projected, budget, pct, overBudget, insufficient: false };
}

// Gauge color based on consumption %
function gaugeColor(pct) {
  if (pct >= 100) return "var(--red)";
  if (pct >= 80)  return "var(--yellow)";
  return "var(--green)";
}
const Icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  revenus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  factures: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  depenses: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  epargne: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a7 7 0 0 1 7 7v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V9a7 7 0 0 1 7-7z"/></svg>,
  dettes: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3h18v4H3z"/><path d="M21 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"/><path d="M9 7v10M15 7v10"/></svg>,
  back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>,
  trash: "×",
};

// ─── GAUGE COMPONENT ──────────────────────────────────────────────────────────
function Gauge({ reel, budget }) {
  if (!budget || budget === 0) return null;
  const pct = Math.min(Math.round((reel / budget) * 100), 100);
  const color = gaugeColor(Math.round((reel / budget) * 100));
  return (
    <div className="gauge-wrap">
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="gauge-pct" style={{ color }}>{Math.round((reel / budget) * 100)}%</span>
    </div>
  );
}

// ─── SWIPEABLE ROW ────────────────────────────────────────────────────────────
function SwipeRow({ onDelete, children }) {
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(null);
  const rowRef = useRef(null);

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40) setSwiped(true);   // swipe left → reveal delete
    if (dx > 20)  setSwiped(false);  // swipe right → close
    startX.current = null;
  }

  function handleDeleteClick() {
    setSwiped(false);
    onDelete();
  }

  return (
    <div className="row-wrap">
      <div className="row-delete-bg" onClick={handleDeleteClick}>Suppr.</div>
      <div
        ref={rowRef}
        className={`row-item${swiped ? " swiped" : ""}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => swiped && setSwiped(false)} // tap anywhere to close
      >
        {children}
      </div>
    </div>
  );
}

// ─── SECTION PAGE ─────────────────────────────────────────────────────────────
function SectionPage({ sectionKey, showType, onDetailOpen }) {
  const { data, updateItem, addItem, deleteItem, isNewMonth, prevMonthKey, inheritPrev } = useApp();
  const items = data[sectionKey] || [];
  const { budget: totalB, reel: totalR } = sumSection(items);

  return (
    <div className="fade-up">
      {/* INHERIT BANNER — shown only on blank new months */}
      {isNewMonth && prevMonthKey && (
        <div className="inherit-banner">
          <div className="inherit-banner-text">
            <strong>Nouveau mois</strong>
            Copier le prévisionnel de {prevMonthKey} ?
          </div>
          <button className="btn-inherit" onClick={inheritPrev}>
            Copier ↗
          </button>
        </div>
      )}
      <div className="totals-bar">
        <div className="totals-col">
          <div className="totals-val">{fmt(totalB)}</div>
          <div className="totals-lbl">Prévisionnel</div>
        </div>
        <div className="totals-col">
          <div className="totals-val" style={{ color: totalR > totalB ? "var(--red)" : "var(--green)" }}>
            {fmt(totalR)}
          </div>
          <div className="totals-lbl">Réel</div>
        </div>
        <div className="totals-col">
          <div className="totals-val" style={{ color: totalB - totalR >= 0 ? "var(--green)" : "var(--red)" }}>
            {fmt(totalB - totalR)}
          </div>
          <div className="totals-lbl">Écart</div>
        </div>
      </div>

      {items.map((item) => {
        // hasLogs = item actually has a logs array (regardless of current type)
        // This preserves logs even if user switches to "simple" temporarily
        const hasLogs = Array.isArray(item.logs) && (
          item.type === "recurrent" || item.type === "ponctuel" || item.type === "detail"
        );
        const reelVal = Array.isArray(item.logs) && item.logs.length > 0
          ? (item.logs).reduce((s, l) => s + (Number(l.amount) || 0), 0)
          : Number(item.reel) || 0;

        // Cycle: simple → recurrent → ponctuel → simple
        // NEVER erase logs or reel — only change the type label
        function cycleType() {
          const next = item.type === "simple" ? "recurrent"
            : item.type === "recurrent" ? "ponctuel"
            : "simple";
          updateItem(sectionKey, item.id, { type: next });
        }

        const badgeLabel = item.type === "recurrent" ? "↻" : item.type === "ponctuel" ? "◎" : "·";
        const badgeClass = item.type === "simple" ? "badge-simple" : "badge-detail";

        return (
          <SwipeRow key={item.id} onDelete={() => deleteItem(sectionKey, item.id)}>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0 }}>
              <input
                className="label-input"
                style={{ width: "100%" }}
                value={item.label}
                onChange={(e) => updateItem(sectionKey, item.id, { label: e.target.value })}
                placeholder="Intitulé"
              />
              <Gauge reel={reelVal} budget={Number(item.budget)} />
            </div>
            <div className="input-group">
              <span className="input-micro-label">Prévu</span>
              <input
                type="number"
                className="amount-input"
                value={item.budget || ""}
                onChange={(e) => updateItem(sectionKey, item.id, { budget: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <span className="input-micro-label">Réel</span>
              {hasLogs ? (
                <button
                  className="amount-input"
                  style={{ cursor: "pointer", background: "rgba(108,99,255,0.1)", borderColor: "rgba(108,99,255,0.3)", color: "var(--accent)", textAlign: "right" }}
                  onClick={() => onDetailOpen && onDetailOpen(item)}
                >
                  {reelVal || "0"}
                </button>
              ) : (
                <input
                  type="number"
                  className="amount-input"
                  value={item.reel || ""}
                  onChange={(e) => updateItem(sectionKey, item.id, { reel: e.target.value })}
                  placeholder="0"
                />
              )}
            </div>
            {showType && (
              <button className={`row-badge ${badgeClass}`} onClick={cycleType} title={
                item.type === "simple" ? "Simple → Récurrente"
                : item.type === "recurrent" ? "Récurrente → Ponctuelle"
                : "Ponctuelle → Simple"
              }>
                {badgeLabel}
              </button>
            )}
          </SwipeRow>
        );
      })}
      <button className="btn-add" onClick={() => addItem(sectionKey, showType)}>
        + Ajouter une ligne
      </button>
    </div>
  );
}

// ─── DETAIL PAGE ──────────────────────────────────────────────────────────────
function DetailPage({ item, onBack }) {
  const { updateItem, year, month } = useApp();
  const sectionKey = "depenses";
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const logs = item.logs || [];
  const total = logs.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const proj = calcProjection(item, year, month);

  function addLog() {
    if (!amount) return;
    const newLog = { id: uid(), date, amount: Number(amount), desc };
    const updatedLogs = [...logs, newLog].sort((a, b) => a.date.localeCompare(b.date));
    updateItem(sectionKey, item.id, { logs: updatedLogs });
    setAmount(""); setDesc("");
  }

  function deleteLog(logId) {
    updateItem(sectionKey, item.id, { logs: logs.filter((l) => l.id !== logId) });
  }

  return (
    <div className="fade-up">
      <button className="back-btn" onClick={onBack}>{Icons.back} Retour</button>
      <div className="solde-card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
          {item.label} — Total réel
        </div>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 30, fontWeight: 800, color: "var(--accent2)" }}>
          {fmt(total)}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          Budget prévu : {fmt(item.budget)} · Écart :{" "}
          <span style={{ color: Number(item.budget) - total >= 0 ? "var(--green)" : "var(--red)" }}>
            {fmt(Number(item.budget) - total)}
          </span>
        </div>
        {/* PROJECTION INLINE */}
        {proj && !proj.insufficient && (
          <div className="proj-inline">
            <span className="proj-inline-label">Projection fin de mois</span>
            <span className="proj-inline-val" style={{ color: proj.overBudget ? "var(--red)" : "var(--green)" }}>
              {fmt(proj.projected)}
            </span>
            {proj.pct !== null && (
              <span className="proj-inline-pct" style={{
                background: proj.overBudget ? "rgba(255,107,107,0.15)" : "rgba(67,233,123,0.15)",
                color: proj.overBudget ? "var(--red)" : "var(--green)"
              }}>
                {proj.pct}%
              </span>
            )}
          </div>
        )}
        {proj?.insufficient && (
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, fontStyle: "italic" }}>
            Données insuffisantes pour projeter
          </div>
        )}
      </div>

      <div className="add-log-form">
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Nouvelle dépense
        </div>
        <div className="form-row">
          <input type="date" className="label-input" style={{ maxWidth: 140 }} value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="number" className="amount-input" placeholder="Montant" value={amount}
            onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLog()} />
        </div>
        <div className="form-row">
          <input className="label-input" placeholder="Description (optionnel)" value={desc}
            onChange={(e) => setDesc(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLog()} />
          <button className="btn-primary" onClick={addLog}>+</button>
        </div>
      </div>

      {logs.length === 0 && <div className="empty">Aucune dépense enregistrée</div>}
      {[...logs].reverse().map((log) => (
        <div key={log.id} className="log-item">
          <span className="log-date">{log.date}</span>
          <span className="log-desc">{log.desc || <span style={{ color: "var(--muted)", fontStyle: "italic" }}>—</span>}</span>
          <span className="log-amount">{fmt(log.amount)}</span>
          <button className="btn-delete" onClick={() => deleteLog(log.id)}>{Icons.trash}</button>
        </div>
      ))}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { data, exportCSV, resetMonth, syncStatus, year, month } = useApp();
  const rev = sumSection(data.revenus);
  const fac = sumSection(data.factures);
  const dep = sumSection(data.depenses);
  const epa = sumSection(data.epargne);
  const det = sumSection(data.dettes);
  const solde = calcSolde(data);

  // Projections: only recurrent items
  const projections = data.depenses
    .filter((i) => i.type === "recurrent")
    .map((i) => ({ item: i, proj: calcProjection(i, year, month) }))
    .filter((r) => r.proj && !r.proj.insufficient)
    .sort((a, b) => (b.proj.overBudget ? 1 : 0) - (a.proj.overBudget ? 1 : 0));

  const tensionItems = projections.filter((r) => r.proj.overBudget);

  const sections = [
    { label: "Revenus", budget: rev.budget, reel: rev.reel, color: "var(--green)" },
    { label: "Factures", budget: fac.budget, reel: fac.reel, color: "var(--accent)" },
    { label: "Dépenses", budget: dep.budget, reel: dep.reel, color: "var(--accent2)" },
    { label: "Épargne", budget: epa.budget, reel: epa.reel, color: "var(--yellow)" },
    { label: "Dettes", budget: det.budget, reel: det.reel, color: "var(--red)" },
  ];
  const maxVal = Math.max(...sections.map((s) => Math.max(s.budget, s.reel)), 1);

  const syncInfo = {
    ok: { cls: "sync-ok", label: "Synchronisé ✓" },
    pending: { cls: "sync-pending", label: "Synchronisation…" },
    error: { cls: "sync-error", label: "Hors ligne — données locales" },
  }[syncStatus];

  return (
    <div className="fade-up">

      {/* ALERT BANNER */}
      {tensionItems.length > 0 && (
        <div className="alert-banner">
          <span className="alert-banner-icon">⚠️</span>
          <div className="alert-banner-body">
            <div className="alert-banner-title">
              {tensionItems.length} rubrique{tensionItems.length > 1 ? "s" : ""} en tension
            </div>
            <div className="alert-banner-items">
              {tensionItems.map((r) => (
                <span key={r.item.id}>
                  {r.item.label} → {fmt(r.proj.projected)} ({r.proj.pct}%){" "}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SOLDE CARD */}
      <div className="solde-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Solde mensuel réel
            </div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 800, color: solde.reel >= 0 ? "var(--green)" : "var(--red)" }}>
              {fmt(solde.reel)}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              Prévisionnel : {fmt(solde.budget)}
            </div>
            <div className="sync-label" style={{ marginTop: 8 }}>
              <span className={`sync-dot ${syncInfo.cls}`} />
              {syncInfo.label}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="export-btn" onClick={exportCSV}>📥 CSV</button>
            <button className="export-btn" onClick={resetMonth} style={{ color: "var(--red)", borderColor: "rgba(255,107,107,0.3)" }}>↺ Reset</button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="dash-grid">
        {sections.slice(0, 4).map((s) => (
          <div className="dash-card" key={s.label}>
            <div className="dash-card-label">{s.label}</div>
            <div className="dash-card-main" style={{ color: s.color }}>{fmt(s.reel)}</div>
            <div className="dash-card-prev">Prévu {fmt(s.budget)}</div>
            <span className={`pill ${s.reel > s.budget ? (s.label === "Revenus" ? "pill-green" : "pill-red") : "pill-green"}`}>
              {s.reel > s.budget ? "▲" : "▼"} {Math.abs(s.reel - s.budget).toLocaleString("fr-MA", { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
      <div className="dash-card" style={{ marginBottom: 12 }}>
        <div className="dash-card-label">Dettes</div>
        <div className="dash-card-main" style={{ color: "var(--red)" }}>{fmt(det.reel)}</div>
        <div className="dash-card-prev">Prévu {fmt(det.budget)}</div>
      </div>

      {/* PROJECTION CARD */}
      {projections.length > 0 && (
        <div className="proj-card">
          <div className="proj-card-title">📈 Projections fin de mois</div>
          {projections.map(({ item, proj }) => (
            <div className="proj-row" key={item.id}>
              <span className="proj-row-label">{item.label}</span>
              <span className="proj-row-val" style={{ color: proj.overBudget ? "var(--red)" : "var(--green)" }}>
                {fmt(proj.projected)}
              </span>
              {proj.pct !== null && (
                <span className="proj-row-pct" style={{
                  background: proj.overBudget ? "rgba(255,107,107,0.15)" : "rgba(67,233,123,0.15)",
                  color: proj.overBudget ? "var(--red)" : "var(--green)"
                }}>
                  {proj.pct}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BAR CHART */}
      <div className="card chart-wrap">
        <div className="chart-title">Prévisionnel vs Réel</div>
        {sections.map((s) => {
          const pct = s.budget > 0 ? Math.round((s.reel / s.budget) * 100) : null;
          const pctColor = pct === null ? "var(--muted)"
            : s.label === "Revenus" ? (pct >= 100 ? "var(--green)" : "var(--yellow)")
            : pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--green)";
          return (
            <div className="bar-group" key={s.label}>
              <div className="bar-label">
                <span>{s.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>{fmt(s.reel)} / {fmt(s.budget)}</span>
                  {pct !== null && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: pctColor, minWidth: 36, textAlign: "right" }}>
                      {pct}%
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(s.budget / maxVal) * 100}%`, background: "var(--muted)", opacity: 0.5 }} />
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.min((s.reel / maxVal) * 100, 100)}%`, background: s.color }} />
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--muted)" }}>
            <div style={{ width: 20, height: 6, background: "var(--border)", borderRadius: 3 }} /> Prévisionnel
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--muted)" }}>
            <div style={{ width: 20, height: 6, background: "var(--accent)", borderRadius: 3 }} /> Réel
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DEPENSES PAGE ─────────────────────────────────────────────────────────────
function DepensesPage() {
  const [detailItem, setDetailItem] = useState(null);
  if (detailItem) {
    return <div className="page"><DetailPage item={detailItem} onBack={() => setDetailItem(null)} /></div>;
  }
  return (
    <div className="page">
      <SectionPage sectionKey="depenses" showType={true} onDetailOpen={(item) => setDetailItem(item)} />
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "dashboard", label: "Tableau",  icon: Icons.dashboard },
  { key: "revenus",   label: "Revenus",  icon: Icons.revenus   },
  { key: "dettes",    label: "Dettes",   icon: Icons.dettes    },
  { key: "factures",  label: "Factures", icon: Icons.factures  },
  { key: "depenses",  label: "Dépenses", icon: Icons.depenses  },
  { key: "epargne",   label: "Épargne",  icon: Icons.epargne   },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(null); // null = loading
  const [syncStatus, setSyncStatus] = useState("ok"); // ok | pending | error
  const [isNewMonth, setIsNewMonth] = useState(false); // true when month has no existing data
  const [prevMonthKey, setPrevMonthKey] = useState(null); // key of previous month for inherit
  const saveTimer = useRef(null);

  // ── Load on mount and month change ─────────────────────────────────────────
  async function loadData(y, m) {
    setData(null); // show spinner
    setIsNewMonth(false);

    // Compute previous month key for inherit banner
    const prevM = m === 0 ? 11 : m - 1;
    const prevY = m === 0 ? y - 1 : y;
    setPrevMonthKey(toKey(prevY, prevM));

    // 1. Try Supabase first
    try {
      const remote = await dbLoad(y, m);
      if (remote) {
        localSave(y, m, remote);
        setData(remote);
        setSyncStatus("ok");
        return;
      } else {
        // Month doesn't exist in Supabase — clear stale local cache if any
        localStorage.removeItem(`budget_${toKey(y, m)}`);
      }
    } catch (e) {
      console.warn("Supabase load failed, falling back to local:", e);
      setSyncStatus("error");
    }
    // 2. Fallback: localStorage (only trusted if Supabase failed, not if it returned null)
    const local = localLoad(y, m);
    if (local && syncStatus === "error") {
      setData(local);
    } else {
      setData(createMonth());
      setIsNewMonth(true); // blank month — offer inherit
    }
  }

  // ── Inherit previsionnel from previous month ────────────────────────────────
  async function inheritPrev() {
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;

    let prev = null;
    try { prev = await dbLoad(prevY, prevM); } catch (e) {}
    if (!prev) prev = localLoad(prevY, prevM);
    if (!prev) return;

    // Copy only label + budget (prévisionnel), reset reel & logs
    const sections = ["revenus", "factures", "depenses", "epargne", "dettes"];
    const inherited = createMonth();
    for (const sec of sections) {
      inherited[sec] = prev[sec].map((item) => ({
        ...item,
        reel: 0,
        logs: [],
        id: item.id, // keep same ids so structure is stable
      }));
    }
    setData(inherited);
    setIsNewMonth(false);
  }

  useEffect(() => { loadData(year, month); }, [year, month]);

  // ── Debounced save — fires 1.5s after last change ──────────────────────────
  useEffect(() => {
    if (!data) return;
    localSave(year, month, data); // instant local save

    setSyncStatus("pending");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await dbSave(year, month, data);
        setSyncStatus("ok");
      } catch (e) {
        console.error("Supabase save failed:", e);
        setSyncStatus("error");
      }
    }, 1500);

    return () => clearTimeout(saveTimer.current);
  }, [data]);

  // ── Month nav ───────────────────────────────────────────────────────────────
  function changeMonth(dir) {
    let newM = month + dir, newY = year;
    if (newM < 0) { newM = 11; newY--; }
    if (newM > 11) { newM = 0; newY++; }
    setMonth(newM); setYear(newY);
  }

  // ── Data mutators ───────────────────────────────────────────────────────────
  function updateItem(section, id, patch) {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => item.id !== id ? item : { ...item, ...patch }),
    }));
  }

  function addItem(section, withType) {
    const newItem = { id: uid(), label: "", budget: 0, reel: 0 };
    if (withType) newItem.type = "simple";
    setData((prev) => ({ ...prev, [section]: [...prev[section], newItem] }));
  }

  function deleteItem(section, id) {
    setData((prev) => ({ ...prev, [section]: prev[section].filter((i) => i.id !== id) }));
  }

  function resetMonth() {
    if (window.confirm(`Réinitialiser ${MONTHS_FR[month]} ${year} ?`)) {
      setData(createMonth());
    }
  }

  function exportCSV() {
    const rows = [["Section", "Intitulé", "Prévisionnel", "Réel"]];
    const secs = { revenus: "Revenus", factures: "Factures", depenses: "Dépenses", epargne: "Épargne", dettes: "Dettes" };
    for (const [key, label] of Object.entries(secs)) {
      for (const item of data[key]) {
        const reel = item.type === "detail"
          ? (item.logs || []).reduce((s, l) => s + Number(l.amount), 0)
          : item.reel;
        rows.push([label, item.label, item.budget, reel]);
      }
    }
    const solde = calcSolde(data);
    rows.push(["", "SOLDE PRÉVISIONNEL", solde.budget, ""]);
    rows.push(["", "SOLDE RÉEL", "", solde.reel]);
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `budget_${year}_${String(month + 1).padStart(2, "0")}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (!data) {
    return (
      <>
        <style>{css}</style>
        <div className="loading-screen">
          <div className="spinner" />
          <div className="loading-text">Chargement de {MONTHS_FR[month]} {year}…</div>
        </div>
      </>
    );
  }

  const ctx = { data, year, month, updateItem, addItem, deleteItem, resetMonth, exportCSV, syncStatus, isNewMonth, prevMonthKey, inheritPrev };

  // Compute which tabs have overbudget items for badge display
  const tabBadges = {
    depenses: data.depenses.some((i) => {
      const useLogTotal = Array.isArray(i.logs) && i.logs.length > 0
        && (i.type === "recurrent" || i.type === "ponctuel" || i.type === "detail");
      const reel = useLogTotal
        ? i.logs.reduce((s, l) => s + Number(l.amount), 0)
        : Number(i.reel) || 0;
      return Number(i.budget) > 0 && reel > Number(i.budget);
    }),
    factures: data.factures.some((i) => Number(i.budget) > 0 && Number(i.reel) > Number(i.budget)),
    revenus: false,
    epargne: data.epargne.some((i) => Number(i.budget) > 0 && Number(i.reel) < Number(i.budget)),
    dettes: data.dettes.some((i) => Number(i.budget) > 0 && Number(i.reel) > Number(i.budget)),
    dashboard: false,
  };

  const renderPage = () => {
    if (tab === "dashboard") return <div className="page"><Dashboard /></div>;
    if (tab === "depenses") return <DepensesPage />;
    const map = { revenus: "revenus", factures: "factures", epargne: "epargne", dettes: "dettes" };
    return <div className="page"><SectionPage sectionKey={map[tab]} showType={false} /></div>;
  };

  return (
    <>
      <style>{css}</style>
      <AppCtx.Provider value={ctx}>
        <div className="app">
          {/* FIXED HEADER: title bar + month selector — handles notch via safe-area */}
          <div className="app-header">
            <div className="app-title-bar">
              <span className="app-title">Budget<span> Tracker</span></span>
            </div>
            <div className="month-bar">
              <button className="month-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
              <span className="month-label">{MONTHS_FR[month]} {year}</span>
              <button className="month-nav-btn" onClick={() => changeMonth(1)}>›</button>
            </div>
          </div>

          {renderPage()}

          <nav className="bottom-nav">
            {TABS.map((t) => (
              <div key={t.key} className="nav-item-wrap">
                {tabBadges[t.key] && <div className="nav-badge" />}
                <button className={`nav-item${tab === t.key ? " active" : ""}`} style={{ flex: "none", width: "100%" }} onClick={() => setTab(t.key)}>
                  {t.icon}
                  <span>{t.label}</span>
                  <div className="nav-dot" />
                </button>
              </div>
            ))}
          </nav>
        </div>
      </AppCtx.Provider>
    </>
  );
}
