import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Wallet, Upload, TrendingUp, DollarSign, Activity,
  ChevronRight, FileText, Trash2, Zap, LayoutGrid,
  LogOut, User, Lock, Mail, Eye, EyeOff, Calendar, BarChart2,
  Sparkles, AlertTriangle, Lightbulb, ThumbsUp, Brain
} from 'lucide-react';

/* ─── Fonts & Global CSS ─── */
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap';
document.head.appendChild(fontLink);

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #080808;
    --surface:   #0f0f0f;
    --surface2:  #161616;
    --border:    rgba(255,255,255,0.07);
    --border2:   rgba(255,255,255,0.12);
    --text:      #f0ece4;
    --muted:     #555;
    --gold:      #d4a843;
    --gold2:     #f0c460;
    --green:     #1fff8e;
    --blue:      #3dc8ff;
    --rose:      #ff4f6e;
    --purple:    #a78bfa;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }

  /* ─── AUTH SCREEN ─── */
  .auth-shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 24px;
    padding: 44px 40px;
    position: relative;
    z-index: 1;
    animation: fadeUp 0.5s ease both;
  }

  .auth-logo {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 36px;
  }

  .auth-logo-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #d4a843 0%, #7a5520 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 30px rgba(212,168,67,0.3);
    flex-shrink: 0;
  }

  .auth-title {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .auth-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 1.5px;
    line-height: 1;
  }
  .auth-heading span { color: var(--gold); }

  .auth-tabs {
    display: flex;
    gap: 4px;
    background: var(--surface2);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 28px;
  }

  .auth-tab {
    flex: 1;
    padding: 9px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .auth-tab.active {
    background: var(--surface);
    color: var(--gold2);
    border: 1px solid var(--border2);
  }

  .auth-field-wrap {
    position: relative;
    margin-bottom: 14px;
  }

  .auth-field-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
  }

  .auth-field-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .auth-field {
    width: 100%;
    padding: 13px 16px 13px 42px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .auth-field::placeholder { color: var(--muted); }
  .auth-field:focus { border-color: rgba(212,168,67,0.5); }

  .auth-btn {
    width: 100%;
    margin-top: 8px;
    padding: 14px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #d4a843, #a07420);
    color: #000;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(212,168,67,0.25);
  }
  .auth-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .auth-error {
    background: rgba(255,79,110,0.08);
    border: 1px solid rgba(255,79,110,0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12px;
    color: var(--rose);
    margin-bottom: 14px;
    font-family: 'DM Mono', monospace;
  }

  .auth-success {
    background: rgba(31,255,142,0.06);
    border: 1px solid rgba(31,255,142,0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12px;
    color: var(--green);
    margin-bottom: 14px;
    font-family: 'DM Mono', monospace;
  }

  .auth-back-btn {
    background: none;
    border: none;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    padding: 0;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s;
    width: 100%;
    justify-content: center;
  }
  .auth-back-btn:hover { color: var(--gold2); }

  .forgot-link {
    background: none;
    border: none;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    padding: 0;
    margin-top: 10px;
    display: block;
    text-align: right;
    transition: color 0.2s;
    letter-spacing: 0.08em;
  }
  .forgot-link:hover { color: var(--gold2); }

  /* ─── APP SHELL ─── */
  .app-shell {
    min-height: 100vh;
    padding: 0;
    position: relative;
    overflow: hidden;
  }

  .grid-bg {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .glow-orb {
    position: fixed;
    width: 600px; height: 600px;
    border-radius: 50%;
    filter: blur(140px);
    pointer-events: none;
    z-index: 0;
  }

  .inner {
    position: relative;
    z-index: 1;
    max-width: 1120px;
    margin: 0 auto;
    padding: 36px 28px 60px;
  }

  /* ─── HEADER ─── */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 48px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }

  .logo-group { display: flex; align-items: center; gap: 14px; }

  .logo-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #d4a843 0%, #7a5520 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 30px rgba(212,168,67,0.3);
  }

  .logo-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 2px; line-height: 1; }
  .logo-title span { color: var(--gold); }

  .logo-sub { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 0.18em; margin-top: 3px; }

  .header-right { display: flex; align-items: center; gap: 12px; }

  .user-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px;
    border: 1px solid var(--border2);
    border-radius: 999px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--gold2);
    background: rgba(212,168,67,0.04);
  }

  .logout-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    border: 1px solid rgba(255,79,110,0.2);
    border-radius: 999px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--rose);
    background: rgba(255,79,110,0.04);
    cursor: pointer;
    transition: all 0.2s;
  }
  .logout-btn:hover { background: rgba(255,79,110,0.1); border-color: rgba(255,79,110,0.4); }

  /* ─── STAT ROW ─── */
  .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 22px 24px;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeUp 0.5s ease both;
  }
  .stat-card:hover { border-color: var(--border2); transform: translateY(-2px); }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  .stat-label {
    font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted);
    letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .stat-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 1px; line-height: 1; }

  /* ─── MAIN LAYOUT ─── */
  .main-grid { display: grid; grid-template-columns: 340px 1fr; gap: 20px; align-items: start; }

  /* ─── CARD ─── */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; animation: fadeUp 0.5s ease both; }

  .card-title {
    font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted);
    letter-spacing: 0.14em; text-transform: uppercase;
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px; margin-bottom: 22px;
  }

  .card-title-left { display: flex; align-items: center; gap: 8px; }
  .card-title-left::before { content: ''; display: block; width: 3px; height: 12px; background: var(--gold); border-radius: 2px; }

  /* ─── CHART PERIOD TOGGLES ─── */
  .period-toggles {
    display: flex;
    gap: 4px;
  }

  .period-btn {
    padding: 4px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .period-btn.active { background: rgba(212,168,67,0.1); border-color: rgba(212,168,67,0.4); color: var(--gold2); }

  /* ─── UPLOAD ZONE ─── */
  .upload-zone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border: 1.5px dashed rgba(255,255,255,0.1); border-radius: 14px;
    padding: 32px 20px; cursor: pointer; transition: all 0.25s; text-align: center;
    background: var(--surface2);
  }
  .upload-zone:hover, .upload-zone.dragover { border-color: var(--gold); background: rgba(212,168,67,0.04); }
  .upload-zone input[type="file"] { display: none; }
  .upload-zone p { font-size: 13px; margin-top: 12px; color: var(--muted); }
  .upload-zone p.has-file { color: var(--gold2); font-weight: 500; }

  /* ─── INPUT ─── */
  .field {
    width: 100%; padding: 12px 16px; margin-top: 14px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text); font-family: 'Outfit', sans-serif;
    font-size: 14px; outline: none; transition: border-color 0.2s;
  }
  .field::placeholder { color: var(--muted); }
  .field:focus { border-color: rgba(212,168,67,0.5); }

  /* ─── BUTTON ─── */
  .btn {
    width: 100%; margin-top: 16px; padding: 14px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #d4a843, #a07420); color: #000;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: 0.04em; cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(212,168,67,0.25);
  }
  .btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 32px rgba(212,168,67,0.35); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.25); border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── TABS ─── */
  .tabs { display: flex; gap: 4px; background: var(--surface2); border-radius: 10px; padding: 4px; margin-bottom: 20px; }
  .tab-btn {
    flex: 1; padding: 8px 12px; border: none; border-radius: 8px; background: transparent;
    color: var(--muted); font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s;
  }
  .tab-btn.active { background: var(--surface); color: var(--gold2); border: 1px solid var(--border2); }

  /* ─── TX ROW ─── */
  .tx-row {
    display: grid; grid-template-columns: 1fr auto auto auto;
    align-items: center; gap: 16px; padding: 14px 0;
    border-bottom: 1px solid var(--border); transition: background 0.15s;
  }
  .tx-row:last-child { border-bottom: none; }
  .tx-name { font-size: 14px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tx-date { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); margin-top: 3px; }
  .tx-badge { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; padding: 4px 8px; border-radius: 5px; background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid var(--border); white-space: nowrap; }
  .tx-badge.high { background: rgba(255,79,110,0.08); color: var(--rose); border-color: rgba(255,79,110,0.2); }
  .tx-amount { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: var(--rose); white-space: nowrap; }
  .delete-btn { background: none; border: none; color: #333; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; transition: color 0.2s, background 0.2s; }
  .delete-btn:hover { color: var(--rose); background: rgba(255,79,110,0.08); }

  /* ─── TOP TX ─── */
  .top-tx { margin-top: 18px; padding: 16px 18px; background: var(--surface2); border-radius: 12px; border: 1px solid var(--border); }
  .top-tx-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px; }
  .top-tx-amount { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: var(--gold); letter-spacing: 1px; line-height: 1; }
  .top-tx-recipient { font-size: 12px; color: var(--muted); margin-top: 4px; }

  /* ─── EMPTY ─── */
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: var(--muted); gap: 10px; }
  .empty p { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; }

  /* ─── SCROLL AREA ─── */
  .scroll-area { max-height: 320px; overflow-y: auto; padding-right: 4px; }

  /* ─── PIE TOOLTIP ─── */
  .pie-tooltip {
    background: #111;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    min-width: 160px;
  }
  .pie-tooltip-name { color: var(--muted); font-size: 10px; margin-bottom: 4px; }
  .pie-tooltip-amount { color: var(--gold); font-size: 15px; font-weight: 500; }
  .pie-tooltip-pct { color: var(--muted); font-size: 10px; margin-top: 2px; }

  /* ─── BAR TOOLTIP ─── */
  .bar-tooltip { padding: 9px 14px; background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-family: 'DM Mono', monospace; font-size: 13px; color: var(--gold); }

  /* ─── CATEGORY LEGEND ─── */
  .cat-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .cat-item { display: flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); }
  .cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* ─── PULSE DOT ─── */
  .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* ─── AI ADVISOR ─── */
  .ai-btn {
    width: 100%; padding: 13px; border: 1px solid rgba(167,139,250,0.3);
    border-radius: 12px; background: rgba(167,139,250,0.06);
    color: var(--purple); font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 0.03em;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    gap: 8px; transition: all 0.2s; margin-top: 12px;
  }
  .ai-btn:hover:not(:disabled) { background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.5); }
  .ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .ai-spinner { width: 14px; height: 14px; border: 2px solid rgba(167,139,250,0.2); border-top-color: var(--purple); border-radius: 50%; animation: spin 0.7s linear infinite; }

  .advice-card {
    margin-top: 14px; padding: 18px;
    background: var(--surface2); border-radius: 14px;
    border: 1px solid rgba(167,139,250,0.15);
    animation: fadeUp 0.4s ease both;
  }

  .advice-summary {
    font-size: 13px; color: #aaa; line-height: 1.6;
    margin-bottom: 16px; padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
  }

  .advice-score {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
  }
  .score-label { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 0.1em; }
  .score-bar { flex: 1; height: 4px; background: #1e1e1e; border-radius: 2px; overflow: hidden; }
  .score-fill { height: 100%; border-radius: 2px; transition: width 0.8s ease; }
  .score-num { font-family: 'Bebas Neue', sans-serif; font-size: 20px; }

  .advice-item {
    padding: 12px 14px; border-radius: 10px;
    margin-bottom: 8px; border: 1px solid transparent;
  }
  .advice-item:last-child { margin-bottom: 0; }
  .advice-item.warning { background: rgba(255,79,110,0.05); border-color: rgba(255,79,110,0.15); }
  .advice-item.tip     { background: rgba(61,200,255,0.05); border-color: rgba(61,200,255,0.15); }
  .advice-item.positive{ background: rgba(31,255,142,0.05); border-color: rgba(31,255,142,0.15); }

  .advice-title {
    font-size: 12px; font-weight: 600; margin-bottom: 4px;
    display: flex; align-items: center; gap: 6px;
  }
  .advice-item.warning  .advice-title { color: var(--rose); }
  .advice-item.tip      .advice-title { color: var(--blue); }
  .advice-item.positive .advice-title { color: var(--green); }
  .advice-detail { font-size: 12px; color: #666; line-height: 1.5; }

  /* ─── AI ADVISOR EXTRA ─── */
  .income-input-wrap {
    display: flex; gap: 10px; margin: 14px 0 0;
  }
  .income-input {
    flex: 1; padding: 11px 14px; background: var(--surface2);
    border: 1px solid var(--border); border-radius: 10px;
    color: var(--text); font-family: 'Outfit', sans-serif;
    font-size: 14px; outline: none; transition: border-color 0.2s;
  }
  .income-input::placeholder { color: var(--muted); }
  .income-input:focus { border-color: rgba(167,139,250,0.5); }

  .advisor-section-title {
    font-family: 'DM Mono', monospace; font-size: 10px;
    color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
    margin: 20px 0 12px;
  }
  .advisor-section-title::before { content: ''; display: block; width: 3px; height: 10px; background: var(--purple); border-radius: 2px; }

  .savings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px; }
  .savings-stat { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; padding: 14px; }
  .savings-stat-label { font-family: 'DM Mono', monospace; font-size: 9px; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .savings-stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.5px; }

  .cut-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .cut-row:last-child { border-bottom: none; }
  .cut-cat { font-size: 13px; font-weight: 500; color: var(--text); }
  .cut-reason { font-size: 11px; color: #555; margin-top: 2px; }
  .cut-amounts { text-align: right; flex-shrink: 0; margin-left: 12px; }
  .cut-current { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--rose); text-decoration: line-through; }
  .cut-suggested { font-family: 'DM Mono', monospace; font-size: 13px; color: var(--green); }
  .cut-save { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--muted); margin-top: 2px; }

  .stock-card {
    background: #111; border: 1px solid #1e1e1e; border-radius: 12px;
    padding: 14px 16px; margin-bottom: 8px;
    transition: border-color 0.2s;
  }
  .stock-card:last-child { margin-bottom: 0; }
  .stock-card:hover { border-color: rgba(167,139,250,0.2); }
  .stock-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .stock-symbol { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: var(--gold); letter-spacing: 1px; }
  .stock-name { font-size: 11px; color: #555; margin-top: 1px; }
  .stock-price { text-align: right; }
  .stock-price-val { font-family: 'DM Mono', monospace; font-size: 14px; color: var(--text); }
  .stock-change { font-family: 'DM Mono', monospace; font-size: 11px; margin-top: 2px; }
  .stock-alloc { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #1a1a1a; }
  .stock-alloc-amount { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--purple); }
  .stock-alloc-shares { font-family: 'DM Mono', monospace; font-size: 11px; color: #444; }
  .stock-risk { font-family: 'DM Mono', monospace; font-size: 9px; padding: 3px 8px; border-radius: 4px; }
  .stock-risk.Low { background: rgba(31,255,142,0.08); color: var(--green); border: 1px solid rgba(31,255,142,0.2); }
  .stock-risk.Medium { background: rgba(249,115,22,0.08); color: #f97316; border: 1px solid rgba(249,115,22,0.2); }
  .stock-risk.High { background: rgba(255,79,110,0.08); color: var(--rose); border: 1px solid rgba(255,79,110,0.2); }
  .stock-reason { font-size: 12px; color: #555; margin-top: 8px; line-height: 1.5; }

  .priority-box {
    margin-top: 16px; padding: 14px 16px;
    background: rgba(212,168,67,0.05); border: 1px solid rgba(212,168,67,0.2);
    border-radius: 10px;
  }
  .priority-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--gold); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 6px; }
  .priority-text { font-size: 13px; color: var(--text); line-height: 1.6; }

  .disclaimer-text { font-family: 'DM Mono', monospace; font-size: 9px; color: #333; margin-top: 14px; line-height: 1.6; text-align: center; }

  @media (max-width: 860px) { .main-grid { grid-template-columns: 1fr; } .stat-row { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 580px) { .stat-row { grid-template-columns: 1fr 1fr; } .header { flex-direction: column; align-items: flex-start; gap: 16px; } .auth-card { padding: 32px 24px; margin: 16px; } .savings-grid { grid-template-columns: 1fr; } }
`;
document.head.appendChild(style);

const API_BASE = "http://127.0.0.1:5001/api";
const CHART_COLORS = ['#d4a843', '#1fff8e', '#3dc8ff', '#ff4f6e', '#a78bfa', '#f97316', '#facc15', '#06b6d4', '#84cc16'];

/* ─── Category classifier ─── */
const CATEGORY_KEYWORDS = {
  'Grocery': ['grocery','grocer','supermarket','bigbasket','dmart','blinkit','zepto','swiggy instamart','nature basket','reliance fresh','more supermarket','spencers','metro cash','walmart','costco','food bazaar'],
  'Food & Dining': ['swiggy','zomato','uber eats','mcdonald','burger king','kfc','pizza','restaurant','cafe','hotel','dhaba','biryani','eat','food','kitchen','meals','lunch','dinner','breakfast'],
  'Travel': ['ola','uber','rapido','redbus','irctc','railway','airport','flight','indigo','airindia','makemytrip','goibibo','yatra','bus','cab','taxi','metro','train','travel','trip','booking.com'],
  'Shopping': ['amazon','flipkart','myntra','ajio','meesho','nykaa','snapdeal','shopsy','tatacliq','shop','store','mall','purchase','buy','retail'],
  'Bills & Utilities': ['electricity','water','gas','internet','broadband','airtel','jio','vodafone','vi','bsnl','tata sky','dish','recharge','topup','bill','utility','postpaid','prepaid'],
  'Entertainment': ['netflix','prime','hotstar','spotify','youtube','gaana','jiocinema','bookmyshow','pvr','inox','cinepolis','game','gaming','steam'],
  'Health': ['pharmacy','medicine','hospital','clinic','doctor','lab','diagnostic','apollo','medplus','1mg','netmeds','cipla','health'],
  'Education': ['udemy','coursera','byjus','unacademy','vedantu','tuition','school','college','course','class','learning','book'],
  'Transfer': ['transfer','sent to','paid to','send money','bank transfer','neft','imps','upi','paytm','phonepe','gpay','google pay','bhim','wallet'],
};

const classifyCategory = (recipient) => {
  const lower = (recipient || '').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'Others';
};

/* ─── Helpers ─── */
const getMonthName = (m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m];

/* ─── Auth storage ─── */
const getToken = () => localStorage.getItem('drfinance_token');
const getUser  = () => { try { return JSON.parse(localStorage.getItem('drfinance_user')); } catch { return null; } };
const setAuth  = (token, user) => { localStorage.setItem('drfinance_token', token); localStorage.setItem('drfinance_user', JSON.stringify(user)); };
const clearAuth = () => { localStorage.removeItem('drfinance_token'); localStorage.removeItem('drfinance_user'); };

/* ─── Axios interceptor ─── */
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

/* ─── Pie Tooltip ─── */
const PieCustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
  return (
    <div className="pie-tooltip">
      <div className="pie-tooltip-name">{entry.name}</div>
      <div className="pie-tooltip-amount">₹{Number(entry.value).toLocaleString('en-IN')}</div>
      <div className="pie-tooltip-pct">{pct}% of total</div>
    </div>
  );
};

/* ─── Bar Tooltip ─── */
const BarCustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bar-tooltip">
      <div style={{ color: '#666', fontSize: 10, marginBottom: 3 }}>{label}</div>
      ₹{Number(payload[0].value).toLocaleString('en-IN')}
    </div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, accent, delay = 0 }) => (
  <div className="stat-card" style={{ animationDelay: `${delay * 0.1}s` }}>
    <div className="stat-label">
      {label}
      <div className="stat-icon" style={{ background: `${accent}16` }}>
        <Icon size={13} color={accent} />
      </div>
    </div>
    <div className="stat-value" style={{ color: accent }}>{value}</div>
  </div>
);

/* ─── AUTH SCREEN ─── */
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode]       = useState('login'); // 'login' | 'register' | 'forgot' | 'reset' | 'sent'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [newPass, setNewPass] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Read reset token from URL query param
  const resetToken = new URLSearchParams(window.location.search).get('token');

  // If URL has a token, go straight to reset screen
  useState(() => { if (resetToken) setMode('reset'); }, []);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const switchMode = (m) => { clearMessages(); setMode(m); };

  // ── Login / Register ──
  const submitAuth = async () => {
    clearMessages();
    if (!email || !password) return setError('Email and password are required.');
    if (mode === 'register' && !name) return setError('Name is required.');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload  = mode === 'login' ? { email, password } : { name, email, password };
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      setAuth(res.data.token, res.data.user);
      onAuth(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ──
  const submitForgot = async () => {
    clearMessages();
    if (!email) return setError('Please enter your email address.');
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      setMode('sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password ──
  const submitReset = async () => {
    clearMessages();
    if (!newPass) return setError('Please enter a new password.');
    if (newPass.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, { token: resetToken, password: newPass });
      setSuccess('Password reset successfully!');
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        switchMode('login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const Logo = () => (
    <div className="auth-logo">
      <div className="auth-logo-icon"><Wallet size={22} color="#fff" /></div>
      <div>
        <div className="auth-title">Personal Finance</div>
        <div className="auth-heading">Dr. Finance <span>AI</span></div>
      </div>
    </div>
  );

  return (
    <div className="auth-shell">
      <div className="grid-bg" />
      <div className="glow-orb" style={{ top: -200, left: -200, background: 'rgba(212,168,67,0.05)' }} />
      <div className="glow-orb" style={{ bottom: -300, right: -200, background: 'rgba(61,200,255,0.03)' }} />

      <div className="auth-card">
        <Logo />

        {/* ── Login / Register ── */}
        {(mode === 'login' || mode === 'register') && (<>
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Login</button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>Register</button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {mode === 'register' && (
            <div className="auth-field-wrap">
              <span className="auth-field-icon"><User size={15} /></span>
              <input className="auth-field" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="auth-field-wrap">
            <span className="auth-field-icon"><Mail size={15} /></span>
            <input className="auth-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitAuth()} />
          </div>

          <div className="auth-field-wrap">
            <span className="auth-field-icon"><Lock size={15} /></span>
            <input className="auth-field" type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitAuth()} />
            <button className="auth-field-toggle" onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>

          {mode === 'login' && (
            <button className="forgot-link" onClick={() => switchMode('forgot')}>Forgot password?</button>
          )}

          <button className="auth-btn" onClick={submitAuth} disabled={loading}>
            {loading ? <><div className="spinner" style={{ borderTopColor: '#000' }} /> Processing…</> : <><ChevronRight size={16} />{mode === 'login' ? 'Sign In' : 'Create Account'}</>}
          </button>
        </>)}

        {/* ── Forgot Password ── */}
        {mode === 'forgot' && (<>
          <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 20 }}>RESET PASSWORD</div>

          {error && <div className="auth-error">{error}</div>}

          <p style={{ fontSize: 13, color: '#666', marginBottom: 18, lineHeight: 1.6 }}>Enter your email and we'll send you a link to reset your password.</p>

          <div className="auth-field-wrap">
            <span className="auth-field-icon"><Mail size={15} /></span>
            <input className="auth-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitForgot()} />
          </div>

          <button className="auth-btn" onClick={submitForgot} disabled={loading}>
            {loading ? <><div className="spinner" style={{ borderTopColor: '#000' }} /> Sending…</> : <><ChevronRight size={16} /> Send Reset Link</>}
          </button>

          <button className="auth-back-btn" onClick={() => switchMode('login')}>← Back to Login</button>
        </>)}

        {/* ── Email Sent ── */}
        {mode === 'sent' && (<>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
            <div className="auth-success" style={{ textAlign: 'left' }}>Reset link sent! Check your inbox.</div>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>
              We've sent a password reset link to <strong style={{ color: 'var(--gold2)' }}>{email}</strong>. The link expires in 1 hour.
            </p>
            <button className="auth-back-btn" onClick={() => switchMode('login')}>← Back to Login</button>
          </div>
        </>)}

        {/* ── Reset Password ── */}
        {mode === 'reset' && (<>
          <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 20 }}>SET NEW PASSWORD</div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          {!success && (<>
            <div className="auth-field-wrap">
              <span className="auth-field-icon"><Lock size={15} /></span>
              <input className="auth-field" type={showPw ? 'text' : 'password'} placeholder="New password (min 6 chars)" value={newPass} onChange={e => setNewPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitReset()} />
              <button className="auth-field-toggle" onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>

            <button className="auth-btn" onClick={submitReset} disabled={loading}>
              {loading ? <><div className="spinner" style={{ borderTopColor: '#000' }} /> Updating…</> : <><ChevronRight size={16} /> Set New Password</>}
            </button>
          </>)}
        </>)}

      </div>
    </div>
  );
};

/* ─── MAIN APP ─── */
export default function App() {
  const [user, setUser]               = useState(getUser);
  const [transactions, setTransactions] = useState([]);
  const [file, setFile]               = useState(null);
  const [email, setEmail]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [dragover, setDragover]       = useState(false);
  const [tab, setTab]                 = useState('pie');        // 'pie' | 'bar'
  const [piePeriod, setPiePeriod]     = useState('monthly');   // 'monthly' | 'yearly' | 'all'
  const [barPeriod, setBarPeriod]     = useState('monthly');   // 'monthly' | 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [aiAdvice, setAiAdvice]           = useState(null);
  const [aiLoading, setAiLoading]         = useState(false);
  const [aiError, setAiError]             = useState('');

  const fetchHistory = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await axios.get(`${API_BASE}/transactions`);
      setTransactions(res.data);
    } catch (err) {
      if (err.response?.status === 401) { clearAuth(); setUser(null); }
    }
  }, []);

  useEffect(() => { if (user) fetchHistory(); }, [user, fetchHistory]);

  const handleAuth  = (u) => setUser(u);
  const handleLogout = () => { clearAuth(); setUser(null); setTransactions([]); };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this transaction?")) return;
    try {
      await axios.delete(`${API_BASE}/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch { alert("Delete failed. Try again."); }
  };

  const handleProcess = async () => {
    if (!file) return alert('Please select a PDF or image first.');
    setLoading(true);
    const formData = new FormData();
    formData.append('payout_screenshot', file);
    formData.append('email', email || user?.email || 'user@example.com');
    try {
      const response = await axios.post(`${API_BASE}/upload`, formData);
      alert(`✅ Extracted ${response.data.data.length} record(s) successfully.`);
      setFile(null);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'AI processing failed. Check the server console.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Chart data builders ─── */

  // PIE: category breakdown
  const buildPieData = () => {
    let filtered = [...transactions];
    const now = new Date();

    if (piePeriod === 'monthly') {
      filtered = filtered.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      });
    } else if (piePeriod === 'yearly') {
      filtered = filtered.filter(tx => new Date(tx.date).getFullYear() === selectedYear);
    }
    // 'all' = no filter

    const cats = {};
    filtered.forEach(tx => {
      const cat = tx.category || classifyCategory(tx.recipient);
      cats[cat] = (cats[cat] || 0) + (Number(tx.amount) || 0);
    });

    return Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
  };

  // BAR: trend data
  const buildBarData = () => {
    if (barPeriod === 'monthly') {
      // Daily spending in selectedMonth/selectedYear
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const dayMap = {};
      for (let d = 1; d <= daysInMonth; d++) dayMap[d] = 0;

      transactions.forEach(tx => {
        const d = new Date(tx.date);
        if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
          dayMap[d.getDate()] = (dayMap[d.getDate()] || 0) + (Number(tx.amount) || 0);
        }
      });

      return Object.entries(dayMap).map(([day, amount]) => ({ label: `${day}`, amount: Math.round(amount) }));
    } else {
      // Yearly: monthly totals for selectedYear
      const monthMap = {};
      for (let m = 0; m < 12; m++) monthMap[m] = 0;
      transactions.forEach(tx => {
        const d = new Date(tx.date);
        if (d.getFullYear() === selectedYear) {
          monthMap[d.getMonth()] = (monthMap[d.getMonth()] || 0) + (Number(tx.amount) || 0);
        }
      });
      return Object.entries(monthMap).map(([m, amount]) => ({ label: getMonthName(Number(m)), amount: Math.round(amount) }));
    }
  };

  const [monthlyIncome, setMonthlyIncome] = useState('');

  const fetchAdvisor = async () => {
    if (!monthlyIncome || isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0)
      return setAiError('Please enter your monthly income to get personalised advice.');
    setAiLoading(true);
    setAiError('');
    setAiAdvice(null);
    try {
      const res = await axios.post(`${API_BASE}/ai/advisor`, { monthlyIncome: Number(monthlyIncome) });
      setAiAdvice(res.data);
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI analysis failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const totalSpend = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const avgTx      = transactions.length ? totalSpend / transactions.length : 0;
  const topTx      = transactions.length ? [...transactions].sort((a, b) => b.amount - a.amount)[0] : null;
  const pieData    = buildPieData();
  const barData    = buildBarData();
  const pieTotal   = pieData.reduce((s, d) => s + d.value, 0);

  const availableYears = [...new Set(transactions.map(tx => new Date(tx.date).getFullYear()))].sort((a, b) => b - a);
  if (!availableYears.includes(selectedYear)) availableYears.unshift(selectedYear);

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div className="app-shell">
      <div className="grid-bg" />
      <div className="glow-orb" style={{ top: -200, left: -200, background: 'rgba(212,168,67,0.04)' }} />
      <div className="glow-orb" style={{ bottom: -300, right: -200, background: 'rgba(61,200,255,0.03)' }} />

      <div className="inner">

        {/* ─── HEADER ─── */}
        <header className="header">
          <div className="logo-group">
            <div className="logo-icon"><Wallet size={22} color="#fff" /></div>
            <div>
              <div className="logo-title">Dr. Finance <span>AI</span></div>
              <div className="logo-sub">MULTIMODAL EXPENSE TRACKER</div>
            </div>
          </div>
          <div className="header-right">
            <div className="user-chip">
              <User size={11} />
              {user.name || user.email}
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={11} /> Sign Out
            </button>
          </div>
        </header>

        {/* ─── STATS ─── */}
        <div className="stat-row">
          <StatCard icon={DollarSign} label="Total Outflow"  value={`₹${totalSpend.toLocaleString('en-IN')}`} accent="#d4a843" delay={1} />
          <StatCard icon={Activity}   label="Transactions"   value={transactions.length}                       accent="#1fff8e" delay={2} />
          <StatCard icon={TrendingUp} label="Avg Ticket"     value={`₹${Math.round(avgTx).toLocaleString('en-IN')}`} accent="#3dc8ff" delay={3} />
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="main-grid">

          {/* LEFT: Upload */}
          <div className="card" style={{ animationDelay: '0.1s' }}>
            <div className="card-title"><div className="card-title-left"><Zap size={11} />AI Document Parser</div></div>

            <label
              className={`upload-zone ${dragover ? 'dragover' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onDrop={e => { e.preventDefault(); setDragover(false); setFile(e.dataTransfer.files[0]); }}
            >
              <input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files[0])} />
              {file ? <FileText size={34} color="#d4a843" /> : <Upload size={34} color="#333" />}
              <p className={file ? 'has-file' : ''}>{file ? file.name : 'Drop PDF or screenshot here'}</p>
              {!file && <p style={{ fontSize: 11, marginTop: 4 }}>PNG · JPG · PDF · max 10 MB</p>}
            </label>

            <input type="email" className="field" placeholder="Report email (optional)" value={email} onChange={e => setEmail(e.target.value)} />

            <button className="btn" onClick={handleProcess} disabled={loading}>
              {loading ? <><div className="spinner" /> Analyzing…</> : <><ChevronRight size={16} /> Run AI Extraction</>}
            </button>

            {topTx && (
              <div className="top-tx">
                <div className="top-tx-label">Highest Transaction</div>
                <div className="top-tx-amount">₹{Number(topTx.amount).toLocaleString('en-IN')}</div>
                <div className="top-tx-recipient">→ {topTx.recipient}</div>
              </div>
            )}
          </div>

          {/* RIGHT: Charts + History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Chart card */}
            <div className="card" style={{ animationDelay: '0.2s' }}>

              {/* Tab row + period controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="tabs" style={{ margin: 0, flex: 1, marginRight: 12 }}>
                  <button className={`tab-btn ${tab === 'pie' ? 'active' : ''}`} onClick={() => setTab('pie')}>
                    <LayoutGrid size={10} style={{ marginRight: 5, verticalAlign: 'middle' }} />Category
                  </button>
                  <button className={`tab-btn ${tab === 'bar' ? 'active' : ''}`} onClick={() => setTab('bar')}>
                    <BarChart2 size={10} style={{ marginRight: 5, verticalAlign: 'middle' }} />Trend
                  </button>
                </div>

                {/* Period + Year/Month selectors */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {tab === 'pie' ? (
                    <>
                      {['monthly','yearly','all'].map(p => (
                        <button key={p} className={`period-btn ${piePeriod === p ? 'active' : ''}`} onClick={() => setPiePeriod(p)}>
                          {p === 'all' ? 'ALL' : p === 'monthly' ? 'MON' : 'YR'}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['monthly','yearly'].map(p => (
                        <button key={p} className={`period-btn ${barPeriod === p ? 'active' : ''}`} onClick={() => setBarPeriod(p)}>
                          {p === 'monthly' ? 'MON' : 'YR'}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Year selector */}
                  {((tab === 'pie' && piePeriod !== 'all') || tab === 'bar') && (
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#888', fontFamily: 'DM Mono', fontSize: 10, padding: '4px 6px', outline: 'none', cursor: 'pointer' }}
                    >
                      {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  )}

                  {/* Month selector */}
                  {((tab === 'pie' && piePeriod === 'monthly') || (tab === 'bar' && barPeriod === 'monthly')) && (
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(Number(e.target.value))}
                      style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#888', fontFamily: 'DM Mono', fontSize: 10, padding: '4px 6px', outline: 'none', cursor: 'pointer' }}
                    >
                      {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{getMonthName(i)}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div style={{ height: 240 }}>
                {(tab === 'pie' ? pieData : barData).length === 0 ? (
                  <div className="empty"><Activity size={24} /><p>NO DATA FOR THIS PERIOD</p></div>
                ) : tab === 'pie' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={90} paddingAngle={4} stroke="none">
                        {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<PieCustomTooltip total={pieTotal} />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ left: -20, right: 4 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#444', fontSize: 9, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} interval={barPeriod === 'monthly' ? 3 : 0} />
                      <YAxis tick={{ fill: '#444', fontSize: 9, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, i) => <Cell key={i} fill={entry.amount > 0 ? '#d4a843' : '#1e1e1e'} />)}
                      </Bar>
                      <Tooltip content={<BarCustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Category legend for pie */}
              {tab === 'pie' && pieData.length > 0 && (
                <div className="cat-legend">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="cat-item">
                      <div className="cat-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Bar period label */}
              {tab === 'bar' && (
                <div style={{ marginTop: 10, fontFamily: 'DM Mono', fontSize: 10, color: '#444' }}>
                  {barPeriod === 'monthly'
                    ? `Daily spend — ${getMonthName(selectedMonth)} ${selectedYear}`
                    : `Monthly spend — ${selectedYear}`}
                </div>
              )}
            </div>

            {/* Transaction log */}
            <div className="card" style={{ animationDelay: '0.3s' }}>
              <div className="card-title">
                <div className="card-title-left"><Activity size={11} />Transaction Log</div>
                <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: '#333' }}>{transactions.length} RECORDS</span>
              </div>

              {transactions.length === 0 ? (
                <div className="empty"><FileText size={22} /><p>UPLOAD A DOCUMENT TO BEGIN</p></div>
              ) : (
                <div className="scroll-area">
                  {transactions.map(tx => {
                    const cat = tx.category || classifyCategory(tx.recipient);
                    const catIndex = CHART_COLORS[Object.keys(CATEGORY_KEYWORDS).indexOf(cat) % CHART_COLORS.length] || '#555';
                    const displayDate = tx.dateTime
                      ? tx.dateTime
                      : new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                    return (
                      <div className="tx-row" key={tx._id}>
                        <div style={{ minWidth: 0 }}>
                          <div className="tx-name">{tx.recipient}</div>
                          <div className="tx-date">
                            {displayDate}
                            <span style={{ marginLeft: 8, color: '#383838' }}>·</span>
                            <span style={{ marginLeft: 6, color: catIndex }}>{cat}</span>
                          </div>
                        </div>
                        <div className={`tx-badge ${tx.amount > 1000 ? 'high' : ''}`}>{tx.amount > 1000 ? 'HIGH' : 'NORMAL'}</div>
                        <div className="tx-amount">−₹{Number(tx.amount).toLocaleString('en-IN')}</div>
                        <button className="delete-btn" onClick={() => handleDelete(tx._id)} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── AI FINANCIAL ADVISOR CARD ─── */}
            <div className="card" style={{ animationDelay: '0.4s' }}>
              <div className="card-title">
                <div className="card-title-left"><Brain size={11} />AI Financial Advisor</div>
                <div style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'var(--purple)', letterSpacing: '0.1em' }}>LIVE STOCKS · LLAMA AI</div>
              </div>

              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                Enter your monthly income and get a complete financial plan — savings targets, spending cuts, and personalised NSE stock recommendations with live prices.
              </p>

              {/* Income input */}
              <div className="income-input-wrap">
                <input
                  className="income-input"
                  type="number"
                  placeholder="Monthly income (₹)"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchAdvisor()}
                  disabled={aiLoading}
                />
                <button className="ai-btn" style={{ width: 'auto', marginTop: 0, padding: '11px 18px' }}
                  onClick={fetchAdvisor} disabled={aiLoading || transactions.length === 0}>
                  {aiLoading
                    ? <><div className="ai-spinner" /> Analyzing…</>
                    : <><Sparkles size={13} /> {aiAdvice ? 'Re-analyse' : 'Analyse'}</>}
                </button>
              </div>

              {aiError && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,79,110,0.06)', border: '1px solid rgba(255,79,110,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--rose)', fontFamily: 'DM Mono' }}>
                  {aiError}
                </div>
              )}

              {transactions.length === 0 && !aiLoading && (
                <div style={{ marginTop: 10, fontFamily: 'DM Mono', fontSize: 10, color: '#2a2a2a', textAlign: 'center' }}>
                  Upload a statement first to enable AI analysis
                </div>
              )}

              {aiAdvice && (() => {
                const sa    = aiAdvice.savingsAdvice || {};
                const cuts  = aiAdvice.cutSpendings  || [];
                const ip    = aiAdvice.investmentPlan|| {};
                const score = aiAdvice.overallScore  || 0;
                const scoreColor = score >= 7 ? 'var(--green)' : score >= 4 ? '#f97316' : 'var(--rose)';
                return (
                  <div style={{ marginTop: 18 }}>

                    {/* ── Health Score ── */}
                    <div className="advice-score">
                      <span className="score-label">FINANCIAL HEALTH</span>
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${score * 10}%`, background: scoreColor }} />
                      </div>
                      <span className="score-num" style={{ color: scoreColor }}>{score}/10</span>
                    </div>

                    {/* ── Savings Section ── */}
                    <div className="advisor-section-title"><DollarSign size={10} />Savings Plan</div>
                    <div className="advice-summary">{sa.summary}</div>
                    <div className="savings-grid" style={{ marginTop: 12 }}>
                      <div className="savings-stat">
                        <div className="savings-stat-label">Current Rate</div>
                        <div className="savings-stat-value" style={{ color: 'var(--rose)' }}>{sa.currentSavingsRate ?? '--'}%</div>
                      </div>
                      <div className="savings-stat">
                        <div className="savings-stat-label">Target Rate</div>
                        <div className="savings-stat-value" style={{ color: 'var(--green)' }}>{sa.recommendedSavingsRate ?? '--'}%</div>
                      </div>
                      <div className="savings-stat">
                        <div className="savings-stat-label">Save Monthly</div>
                        <div className="savings-stat-value" style={{ color: 'var(--gold)' }}>₹{Number(sa.monthlySavingsAmount || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className="savings-stat">
                        <div className="savings-stat-label">Emergency Fund</div>
                        <div className="savings-stat-value" style={{ color: 'var(--blue)' }}>₹{Number(sa.emergencyFundTarget || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* ── Cut Spending ── */}
                    {cuts.length > 0 && (<>
                      <div className="advisor-section-title"><AlertTriangle size={10} />Where to Cut</div>
                      <div>
                        {cuts.map((c, i) => (
                          <div key={i} className="cut-row">
                            <div>
                              <div className="cut-cat">{c.category}</div>
                              <div className="cut-reason">{c.reason}</div>
                            </div>
                            <div className="cut-amounts">
                              <div className="cut-current">₹{Number(c.currentAmount || 0).toLocaleString('en-IN')}</div>
                              <div className="cut-suggested">₹{Number(c.suggestedAmount || 0).toLocaleString('en-IN')}</div>
                              <div className="cut-save">save ₹{Number(c.savingAmount || 0).toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>)}

                    {/* ── Investment Plan ── */}
                    {ip.stocks?.length > 0 && (<>
                      <div className="advisor-section-title"><TrendingUp size={10} />Stock Recommendations</div>
                      <div style={{ marginBottom: 8, fontFamily: 'DM Mono', fontSize: 10, color: '#444' }}>
                        Monthly investment: <span style={{ color: 'var(--purple)' }}>₹{Number(ip.monthlyInvestmentAmount || 0).toLocaleString('en-IN')}</span>
                        &nbsp;·&nbsp; Expected return: <span style={{ color: 'var(--green)' }}>{ip.expectedMonthlyReturn || '--'}</span>
                      </div>
                      {ip.stocks.map((s, i) => (
                        <div key={i} className="stock-card">
                          <div className="stock-header">
                            <div>
                              <div className="stock-symbol">{s.symbol}</div>
                              <div className="stock-name">{s.name}</div>
                            </div>
                            <div className="stock-price">
                              <div className="stock-price-val">₹{Number(s.currentPrice || 0).toLocaleString('en-IN')}</div>
                              <div className="stock-risk" style={{ marginTop: 4 }}>{s.riskLevel}</div>
                            </div>
                          </div>
                          <div className="stock-reason">{s.reason}</div>
                          <div className="stock-alloc">
                            <div>
                              <div className="stock-alloc-amount">₹{Number(s.allocationAmount || 0).toLocaleString('en-IN')} · {s.allocationPercent}%</div>
                              <div className="stock-alloc-shares">~{s.sharesCanBuy || 0} shares</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>)}

                    {/* ── Top Priority ── */}
                    {aiAdvice.topPriority && (
                      <div className="priority-box">
                        <div className="priority-label">⚡ Top Priority This Month</div>
                        <div className="priority-text">{aiAdvice.topPriority}</div>
                      </div>
                    )}

                    {/* ── Disclaimer ── */}
                    <div className="disclaimer-text">
                      {ip.disclaimer || 'Investments are subject to market risks. This is AI-generated advice, not SEBI-registered financial advice.'}
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}