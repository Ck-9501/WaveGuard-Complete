import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, Legend
} from "recharts";
import {
  Radio, LayoutDashboard, ScanLine, Activity, BrainCircuit, History,
  Bell, BarChart3, FileText, Settings, Info, ChevronRight, ChevronDown,
  Search, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle, X,
  Package, MapPin, Truck, Wifi, WifiOff, User, LogOut, Menu,
  Download, Printer, Share2, Plus, Filter, ShieldCheck, ShieldAlert,
  Cpu, Waves, GitBranch, ClipboardList, ArrowRight, Circle, Dot,
  ChevronLeft, Zap, Server, SlidersHorizontal, CircleAlert, Eye
} from "lucide-react";

/* ============================================================
   GLOBAL STYLE / DESIGN TOKENS
   Deep instrument-panel dark theme. Monospace used for all
   live/numeric readouts to give a lab-equipment feel; Inter
   for UI chrome. Signature motif: a cyan "scanline" sweep on
   live signal panels + a subcarrier pulse strip in the sidebar
   footer, signalling the sensor is always listening.
   ============================================================ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    :root{
      --void:#090c11;
      --bg:#0b0f15;
      --panel:#10151d;
      --panel2:#141b25;
      --panel3:#182029;
      --hair:#1f2732;
      --hair-bright:#2a3441;
      --cyan:#2dd4ee;
      --cyan-dim:#1c7f92;
      --cyan-glow:rgba(45,212,238,0.35);
      --blue:#4f8fef;
      --text:#e7edf4;
      --text2:#93a0b2;
      --text3:#5b6779;
      --green:#3ddc97;
      --green-dim:#173829;
      --amber:#f0a83c;
      --amber-dim:#3a2c14;
      --red:#f0524a;
      --red-dim:#3a1817;
      --radius:10px;
    }
    *{box-sizing:border-box;}
    .wg-root{
      font-family:'Inter',system-ui,sans-serif;
      background:var(--bg);
      color:var(--text);
      min-height:100vh;
      width:100%;
      -webkit-font-smoothing:antialiased;
    }
    .mono{ font-family:'JetBrains Mono', monospace; }
    .wg-root ::selection{ background:var(--cyan-glow); }
    .scroll-thin::-webkit-scrollbar{ width:6px; height:6px; }
    .scroll-thin::-webkit-scrollbar-thumb{ background:var(--hair-bright); border-radius:4px; }
    .scroll-thin::-webkit-scrollbar-track{ background:transparent; }

    button{ font-family:inherit; cursor:pointer; }
    input, select, textarea{ font-family:inherit; }

    @keyframes fadeUp{ from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:translateY(0);} }
    .fade-up{ animation:fadeUp .35s ease both; }
    @keyframes pulseDot{ 0%,100%{opacity:1;} 50%{opacity:.35;} }
    @keyframes sweep{ 0%{ left:-8%; } 100%{ left:108%; } }
    @keyframes spin{ to{ transform:rotate(360deg); } }
    @keyframes barPulse{ 0%,100%{ transform:scaleY(0.5); } 50%{ transform:scaleY(1); } }
    @keyframes ringPulse{ 0%{ box-shadow:0 0 0 0 var(--cyan-glow);} 100%{ box-shadow:0 0 0 10px rgba(45,212,238,0);} }
    @keyframes shimmer{ 0%{ background-position:-200px 0;} 100%{ background-position:200px 0;} }

    .btn{
      display:inline-flex; align-items:center; gap:8px;
      padding:10px 16px; border-radius:8px; border:1px solid var(--hair-bright);
      background:var(--panel2); color:var(--text); font-size:13.5px; font-weight:600;
      transition:all .15s ease; white-space:nowrap;
    }
    .btn:hover{ background:var(--panel3); border-color:var(--text3); }
    .btn-primary{
      background:linear-gradient(180deg, #29b9d4, #1c93ab); border-color:#1c93ab; color:#04181c;
    }
    .btn-primary:hover{ filter:brightness(1.08); }
    .btn-ghost{ background:transparent; border-color:transparent; color:var(--text2); }
    .btn-ghost:hover{ background:var(--panel2); color:var(--text); }
    .btn-danger{ background:var(--red-dim); border-color:#5c2422; color:#ffb4af; }
    .btn:disabled{ opacity:.45; cursor:not-allowed; }

    .card{
      background:var(--panel); border:1px solid var(--hair); border-radius:var(--radius);
    }
    .badge{
      display:inline-flex; align-items:center; gap:6px; padding:3px 9px; border-radius:100px;
      font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
    }
    .field-label{ font-size:11.5px; font-weight:600; color:var(--text2); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; display:block; }
    .field-input{
      width:100%; background:var(--panel2); border:1px solid var(--hair); border-radius:8px;
      padding:10px 12px; color:var(--text); font-size:13.5px; outline:none;
    }
    .field-input:focus{ border-color:var(--cyan-dim); box-shadow:0 0 0 3px rgba(45,212,238,0.1); }
  `}</style>
);

/* ============================================================
   MOCK DATA / SIGNAL GENERATION
   ============================================================ */
const SUBCARRIERS = 64;

function seededNoise(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const SCENARIOS = {
  normal: {
    key: "normal", label: "Normal Package", classification: "NORMAL",
    anomalyScore: 6.8, risk: "LOW", color: "var(--green)",
    driftAmp: 0.06, driftPhase: 0.05, spikeChance: 0.02,
    reasons: [
      "CSI signature closely matches baseline profile",
      "Amplitude and phase variance within expected tolerance",
      "No abnormal subcarrier correlation detected",
      "Temporal signal stability nominal"
    ],
    action: "RELEASE — NO FURTHER ACTION REQUIRED",
  },
  structural: {
    key: "structural", label: "Structural Anomaly", classification: "STRUCTURAL ANOMALY",
    anomalyScore: 87.4, risk: "HIGH", color: "var(--red)",
    driftAmp: 0.42, driftPhase: 0.38, spikeChance: 0.22,
    reasons: [
      "Significant deviation from baseline CSI signature",
      "Increased phase instability across subcarriers 18–34",
      "Abnormal subcarrier correlation detected",
      "Temporal signal variation exceeds prototype threshold"
    ],
    action: "HOLD SHIPMENT FOR SECONDARY INSPECTION",
  },
  displacement: {
    key: "displacement", label: "Possible Internal Displacement", classification: "POSSIBLE INTERNAL DISPLACEMENT",
    anomalyScore: 61.2, risk: "MEDIUM", color: "var(--amber)",
    driftAmp: 0.24, driftPhase: 0.30, spikeChance: 0.14,
    reasons: [
      "Localized temporal pattern shift mid-scan window",
      "Subcarrier response asymmetry between early/late frames",
      "Amplitude center-of-mass shifted from baseline",
      "Moderate phase drift consistent with content movement"
    ],
    action: "FLAG FOR VISUAL RE-CHECK BEFORE DISPATCH",
  },
  liquid: {
    key: "liquid", label: "Possible Liquid / Content Anomaly", classification: "POSSIBLE LIQUID/CONTENT ANOMALY",
    anomalyScore: 54.5, risk: "MEDIUM", color: "var(--amber)",
    driftAmp: 0.20, driftPhase: 0.12, spikeChance: 0.08,
    reasons: [
      "Elevated signal absorption pattern across mid-band subcarriers",
      "Smoothed high-frequency phase response vs. baseline",
      "Amplitude damping consistent with dielectric content shift",
      "Spectral energy redistribution in bands 24–40"
    ],
    action: "ROUTE TO MANUAL CONTENT VERIFICATION",
  },
  unknown: {
    key: "unknown", label: "Unknown Anomaly", classification: "UNKNOWN ANOMALY",
    anomalyScore: 45.0, risk: "MEDIUM", color: "var(--blue)",
    driftAmp: 0.30, driftPhase: 0.22, spikeChance: 0.16,
    reasons: [
      "Deviation pattern does not match any trained anomaly class",
      "Mixed amplitude/phase irregularities across the frame window",
      "Model confidence split across multiple anomaly classes",
      "Recommend manual review — insufficient pattern match"
    ],
    action: "MANUAL REVIEW REQUIRED — LOW MODEL CONFIDENCE",
  },
};

function genSeries(scenario, len = 40, seed = 1) {
  const rnd = seededNoise(seed * 977 + 13);
  const out = [];
  for (let i = 0; i < len; i++) {
    const base = Math.sin(i / 3.1) * 0.5 + Math.sin(i / 7.3) * 0.2;
    const drift = scenario.driftAmp * Math.sin(i / 4 + seed) * (i / len);
    const spike = rnd() < scenario.spikeChance ? (rnd() - 0.5) * scenario.driftAmp * 3 : 0;
    const amplitude = 1.4 + base * 0.35 + drift + spike + (rnd() - 0.5) * 0.05;
    const phaseBase = Math.cos(i / 2.7) * 0.6;
    const phaseDrift = scenario.driftPhase * Math.sin(i / 5 + seed * 1.3) * (i / len);
    const phase = phaseBase + phaseDrift + (rnd() - 0.5) * 0.08;
    out.push({ t: i, amplitude: +amplitude.toFixed(3), phase: +phase.toFixed(3) });
  }
  return out;
}

function genSubcarrierResponse(scenario, seed = 1) {
  const rnd = seededNoise(seed * 331 + 7);
  const out = [];
  for (let i = 0; i < SUBCARRIERS; i++) {
    const envelope = Math.exp(-Math.pow((i - SUBCARRIERS / 2) / (SUBCARRIERS / 2.4), 2));
    const anomalyBand = i > 17 && i < 41 ? scenario.driftAmp : scenario.driftAmp * 0.25;
    const val = envelope * (1 + (rnd() - 0.5) * 0.15) + (rnd() - 0.5) * anomalyBand;
    out.push({ sc: i + 1, response: +Math.max(0.05, val).toFixed(3) });
  }
  return out;
}

function genEnergySeries(scenario, len = 24, seed = 1) {
  const rnd = seededNoise(seed * 551 + 41);
  const out = [];
  for (let i = 0; i < len; i++) {
    const val = 0.4 + Math.abs(Math.sin(i / 3)) * 0.3 + scenario.driftAmp * rnd() * 0.6;
    out.push({ t: i, energy: +val.toFixed(3) });
  }
  return out;
}

function computeFeatures(scenario) {
  const base = scenario.driftAmp + scenario.driftPhase;
  return [
    { label: "Amplitude Variance", value: Math.min(98, 8 + base * 130) },
    { label: "Phase Variance", value: Math.min(98, 6 + scenario.driftPhase * 160) },
    { label: "Temporal Instability", value: Math.min(98, 5 + scenario.driftAmp * 110) },
    { label: "Subcarrier Correlation", value: Math.min(98, 10 + base * 95) },
    { label: "Spectral Energy Δ", value: Math.min(98, 7 + scenario.driftAmp * 120) },
    { label: "Signal Deviation", value: Math.min(98, scenario.anomalyScore * 0.92) },
  ];
}

function computeClassProbs(scenario) {
  const s = scenario.anomalyScore;
  const rest = 100 - s;
  const table = {
    normal: [s, rest * 0.5, rest * 0.3, rest * 0.2],
    structural: [rest * 0.55, s, rest * 0.25, rest * 0.2],
    displacement: [rest * 0.35, rest * 0.25, s, rest * 0.4],
    liquid: [rest * 0.35, rest * 0.25, rest * 0.35, s],
    unknown: [rest * 0.3, rest * 0.28, rest * 0.24, rest * 0.18],
  };
  const raw = table[scenario.key] || table.unknown;
  const labels = ["Normal", "Structural Anomaly", "Possible Displacement", "Possible Liquid/Content Anomaly"];
  let vals = raw;
  if (scenario.key === "unknown") {
    const total = raw.reduce((a, b) => a + b, 0);
    vals = raw.map((v) => (v / total) * (100 - s));
    vals[0] += 0;
  }
  const sum = vals.reduce((a, b) => a + b, 0);
  vals = vals.map((v) => +((v / sum) * 100).toFixed(1));
  return labels.map((label, i) => ({ label, value: vals[i] }));
}

const PRODUCT_TYPES = ["Automotive Component", "Lithium Battery Pack", "Solar PV Component", "Industrial Casting", "Electronics", "Other"];
const PACKAGE_TYPES = ["Cardboard", "Plastic", "Wood", "Metal", "Composite", "Other"];
const ZONES = ["Zone A — Inbound Dock", "Zone B — Pre-Dispatch", "Zone C — QA Bay"];

function randPkgId(n) { return `PKG-${10480 + n}`; }
function randInspId(n) { return `INS-${77210 + n}`; }

function buildInitialHistory() {
  const rows = [
    { id: 0, pkg: "PKG-10491", product: "Automotive Component", scenario: "normal", conf: 96.2, time: "10:42 AM", date: "18 Aug 2026", inspector: "Demo Operator" },
    { id: 1, pkg: "PKG-10492", product: "Industrial Casting", scenario: "structural", conf: 93.7, time: "10:44 AM", date: "18 Aug 2026", inspector: "Demo Operator" },
    { id: 2, pkg: "PKG-10493", product: "Solar PV Component", scenario: "normal", conf: 98.1, time: "10:46 AM", date: "18 Aug 2026", inspector: "Demo Operator" },
    { id: 3, pkg: "PKG-10494", product: "Lithium Battery Pack", scenario: "liquid", conf: 88.9, time: "10:51 AM", date: "18 Aug 2026", inspector: "Demo Operator" },
    { id: 4, pkg: "PKG-10495", product: "Electronics", scenario: "displacement", conf: 79.4, time: "10:58 AM", date: "18 Aug 2026", inspector: "Demo Operator" },
    { id: 5, pkg: "PKG-10496", product: "Automotive Component", scenario: "normal", conf: 97.0, time: "11:05 AM", date: "18 Aug 2026", inspector: "Demo Operator" },
    { id: 6, pkg: "PKG-10497", product: "Industrial Casting", scenario: "unknown", conf: 71.2, time: "11:12 AM", date: "18 Aug 2026", inspector: "Demo Operator" },
  ].map((r) => ({
    ...r,
    inspId: randInspId(r.id),
    result: SCENARIOS[r.scenario].classification === "NORMAL" ? "PASS" : "ANOMALY",
    risk: SCENARIOS[r.scenario].risk,
  }));
  return rows;
}

function buildInspection(scenarioKey, form, seed) {
  const scenario = SCENARIOS[scenarioKey];
  return {
    inspectionId: randInspId(seed),
    packageId: form.packageId || randPkgId(seed),
    shipmentId: form.shipmentId || `SHP-${20500 + seed}`,
    productType: form.productType || PRODUCT_TYPES[0],
    packageType: form.packageType || PACKAGE_TYPES[0],
    origin: form.origin || "Pune, MH",
    destination: form.destination || "Bengaluru, KA",
    zone: form.zone || ZONES[0],
    timestamp: new Date(),
    scenarioKey,
    scenario,
    amplitudePhase: genSeries(scenario, 40, seed),
    subcarrier: genSubcarrierResponse(scenario, seed),
    energy: genEnergySeries(scenario, 24, seed),
    features: computeFeatures(scenario),
    classProbs: computeClassProbs(scenario),
    anomalyScore: scenario.anomalyScore,
    risk: scenario.risk,
    result: scenario.classification === "NORMAL" ? "PASS" : "ANOMALY DETECTED",
    inspector: "Demo Operator",
  };
}

/* ============================================================
   SMALL UI PRIMITIVES
   ============================================================ */
const riskColor = (risk) => risk === "HIGH" ? "var(--red)" : risk === "MEDIUM" ? "var(--amber)" : "var(--green)";
const riskBg = (risk) => risk === "HIGH" ? "var(--red-dim)" : risk === "MEDIUM" ? "var(--amber-dim)" : "var(--green-dim)";

function RiskBadge({ risk }) {
  return (
    <span className="badge" style={{ color: riskColor(risk), background: riskBg(risk), border: `1px solid ${riskColor(risk)}33` }}>
      <Dot size={14} style={{ marginLeft: -4 }} /> {risk}
    </span>
  );
}
function ResultBadge({ result }) {
  const pass = result === "PASS";
  return (
    <span className="badge" style={{
      color: pass ? "var(--green)" : "var(--red)",
      background: pass ? "var(--green-dim)" : "var(--red-dim)",
      border: `1px solid ${pass ? "var(--green)" : "var(--red)"}33`
    }}>
      {pass ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />} {pass ? "PASS" : "ANOMALY"}
    </span>
  );
}

function KPICard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="card fade-up" style={{ padding: 18, flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
        <Icon size={16} color={accent || "var(--text3)"} />
      </div>
      <div className="mono" style={{ fontSize: 26, fontWeight: 700, marginTop: 10, color: accent || "var(--text)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>{subtitle}</div>}
      </div>
      {right && <div style={{ display: "flex", gap: 10 }}>{right}</div>}
    </div>
  );
}

function DemoTag() {
  return (
    <span className="badge mono" style={{ color: "var(--cyan)", background: "rgba(45,212,238,0.08)", border: "1px solid var(--cyan-dim)" }}>
      <Circle size={7} fill="var(--cyan)" stroke="none" style={{ animation: "pulseDot 1.6s infinite" }} />
      DEMO / SIMULATED CSI DATA
    </span>
  );
}

function ProgressBar({ value, color = "var(--cyan)" }) {
  return (
    <div style={{ height: 6, background: "var(--panel3)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 10, transition: "width .5s ease" }} />
    </div>
  );
}

/* ============================================================
   SIDEBAR + TOPBAR
   ============================================================ */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "new-inspection", label: "New Inspection", icon: Plus },
  { id: "live-monitor", label: "Live Monitor", icon: ScanLine },
  { id: "ai-analysis", label: "AI Analysis", icon: BrainCircuit },
  { id: "history", label: "Inspection History", icon: History },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "report", label: "Reports", icon: FileText },
  { id: "config", label: "System Configuration", icon: Settings },
  { id: "about", label: "About", icon: Info },
];

function SubcarrierPulseStrip() {
  const bars = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20 }}>
      {bars.map((i) => (
        <div key={i} style={{
          width: 3, height: "100%", background: "var(--cyan-dim)", borderRadius: 2,
          animation: `barPulse ${0.6 + (i % 5) * 0.15}s ease-in-out infinite`,
          animationDelay: `${(i % 7) * 0.08}s`, transformOrigin: "bottom"
        }} />
      ))}
    </div>
  );
}

function Sidebar({ page, setPage, collapsed, setCollapsed, alertCount }) {
  return (
    <div style={{
      width: collapsed ? 68 : 236, flexShrink: 0, background: "var(--void)", borderRight: "1px solid var(--hair)",
      display: "flex", flexDirection: "column", transition: "width .18s ease", height: "100vh", position: "sticky", top: 0
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 16px", borderBottom: "1px solid var(--hair)" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1c93ab,#0b3a44)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <Radio size={17} color="#bdf3ff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 800, fontSize: 14.5, letterSpacing: ".01em", whiteSpace: "nowrap" }}>WaveGuard AI</div>
            <div style={{ fontSize: 9.5, color: "var(--text3)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".06em" }}>Package Integrity Intel</div>
          </div>
        )}
      </div>

      <div className="scroll-thin" style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {NAV.map((n) => {
          const active = page === n.id;
          const Icon = n.icon;
          return (
            <button key={n.id} onClick={() => setPage(n.id)} title={collapsed ? n.label : undefined} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", marginBottom: 2,
              borderRadius: 8, border: "none", background: active ? "var(--panel2)" : "transparent",
              color: active ? "var(--cyan)" : "var(--text2)", fontSize: 13.2, fontWeight: 600, textAlign: "left",
              borderLeft: active ? "2px solid var(--cyan)" : "2px solid transparent", position: "relative"
            }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--panel)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.label}</span>}
              {!collapsed && n.id === "alerts" && alertCount > 0 && (
                <span className="mono" style={{ marginLeft: "auto", background: "var(--red)", color: "#2a0605", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 20 }}>{alertCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--hair)" }}>
        {!collapsed && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9.5, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Sensor Array — Live</div>
            <SubcarrierPulseStrip />
          </div>
        )}
        <button className="btn btn-ghost" style={{ width: "100%", justifyContent: collapsed ? "center" : "flex-start", padding: "8px 10px" }} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Collapse</>}
        </button>
      </div>
    </div>
  );
}

function Topbar({ user, onLogout, page }) {
  const titleMap = Object.fromEntries(NAV.map((n) => [n.id, n.label]));
  return (
    <div style={{
      height: 58, borderBottom: "1px solid var(--hair)", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 22px", position: "sticky", top: 0, background: "rgba(11,15,21,0.92)",
      backdropFilter: "blur(6px)", zIndex: 20
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text2)", fontSize: 13 }}>
        <span style={{ color: "var(--text3)" }}>WaveGuard AI</span>
        <ChevronRight size={13} color="var(--text3)" />
        <span style={{ color: "var(--text)", fontWeight: 600 }}>{titleMap[page]}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="badge mono" style={{ color: "var(--green)", background: "var(--green-dim)", border: "1px solid #1c4a35" }}>
          <Wifi size={12} /> SYSTEM NOMINAL
        </div>
        <Bell size={17} color="var(--text2)" />
        <div style={{ width: 1, height: 22, background: "var(--hair)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--panel3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={14} color="var(--text2)" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{user}</span>
          <button className="btn-ghost btn" style={{ padding: 6 }} onClick={onLogout} title="Sign out"><LogOut size={15} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOGIN PAGE
   ============================================================ */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% -10%, #132029 0%, #090c11 55%)", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.5,
        backgroundImage: "linear-gradient(var(--hair) 1px, transparent 1px), linear-gradient(90deg, var(--hair) 1px, transparent 1px)",
        backgroundSize: "42px 42px", maskImage: "radial-gradient(ellipse at 50% 30%, black 0%, transparent 70%)"
      }} />
      <div className="fade-up card" style={{ width: 400, padding: 36, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#1c93ab,#0b3a44)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
            animation: "ringPulse 2.4s infinite"
          }}>
            <Radio size={26} color="#bdf3ff" />
          </div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: ".01em" }}>WaveGuard AI</div>
          <div style={{ fontSize: 12.5, color: "var(--text2)", marginTop: 4, textAlign: "center" }}>Non-Invasive Package Integrity Intelligence</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Email</label>
          <input className="field-input" placeholder="operator@waveguard.ai" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="field-label">Password</label>
          <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px 0", marginBottom: 10 }} onClick={() => onLogin(email || "operator@waveguard.ai")}>
          Sign In
        </button>
        <button className="btn" style={{ width: "100%", justifyContent: "center", padding: "11px 0" }} onClick={() => onLogin("Demo Operator")}>
          <Zap size={15} /> Demo Login
        </button>

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--hair)", fontSize: 11, color: "var(--text3)", textAlign: "center", lineHeight: 1.6 }}>
          SIH Prototype — AI-based anomaly screening platform.<br />Not a certified replacement for X-ray / NDT inspection.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function MiniLineChart({ data, dataKey, color, height = 46 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DashboardPage({ history, setPage, openInspection, runDemo }) {
  const activityData = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`, inspections: Math.round(30 + Math.sin(i / 3) * 20 + (i > 9 && i < 18 ? 35 : 5) + (i % 4) * 3)
  })), []);
  const donutData = [
    { name: "Normal", value: 1197, color: "var(--green)" },
    { name: "Structural", value: 34, color: "var(--red)" },
    { name: "Displacement", value: 22, color: "var(--amber)" },
    { name: "Liquid/Content", value: 19, color: "var(--blue)" },
    { name: "Unknown", value: 12, color: "var(--text3)" },
  ];
  return (
    <div className="fade-up">
      <SectionHeader
        title="Inspection Control Center"
        subtitle="Fleet-wide package integrity overview — updated in real time"
        right={<>
          <button className="btn" onClick={() => setPage("new-inspection")}><Plus size={15} /> New Inspection</button>
          <button className="btn btn-primary" onClick={() => runDemo("structural")}><Zap size={15} /> Run Demo Inspection</button>
        </>}
      />

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <KPICard icon={Package} label="Packages Inspected Today" value="1,284" sub="+6.2% vs yesterday" />
        <KPICard icon={ShieldCheck} label="Passed" value="1,197" sub="93.2% pass rate" accent="var(--green)" />
        <KPICard icon={AlertTriangle} label="Anomalies Detected" value="87" sub="6.8% of total" accent="var(--amber)" />
        <KPICard icon={ShieldAlert} label="High Risk" value="12" sub="Held for secondary inspection" accent="var(--red)" />
        <KPICard icon={BrainCircuit} label="Inspection Accuracy" value="91.4%" sub="Prototype demo metric" accent="var(--cyan)" />
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 2, minWidth: 340, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Inspection Activity</div>
            <div style={{ fontSize: 11.5, color: "var(--text3)" }}>Last 24 hours</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--hair)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#5b6779", fontSize: 10 }} interval={3} axisLine={{ stroke: "var(--hair)" }} tickLine={false} />
              <YAxis tick={{ fill: "#5b6779", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="inspections" stroke="var(--cyan)" fill="url(#actGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 260, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Detection Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
                {donutData.map((d, i) => <Cell key={i} fill={d.color} stroke="var(--panel)" strokeWidth={2} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            {donutData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text2)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} /> {d.name}
                </span>
                <span className="mono" style={{ color: "var(--text)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hair)", fontWeight: 700, fontSize: 14 }}>Recent Inspections</div>
        <div className="scroll-thin" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text3)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em" }}>
                {["Package ID", "Product Type", "Status", "Confidence", "Risk", "Time", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 18px", fontWeight: 600, borderBottom: "1px solid var(--hair)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 7).map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--hair)", cursor: "pointer" }}
                  onClick={() => openInspection(r)}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--panel2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td className="mono" style={{ padding: "12px 18px", fontWeight: 600 }}>{r.pkg}</td>
                  <td style={{ padding: "12px 18px", color: "var(--text2)" }}>{r.product}</td>
                  <td style={{ padding: "12px 18px" }}><ResultBadge result={r.result} /></td>
                  <td className="mono" style={{ padding: "12px 18px" }}>{r.conf}%</td>
                  <td style={{ padding: "12px 18px" }}><RiskBadge risk={r.risk} /></td>
                  <td className="mono" style={{ padding: "12px 18px", color: "var(--text3)" }}>{r.time}</td>
                  <td style={{ padding: "12px 18px" }}><ChevronRight size={15} color="var(--text3)" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   NEW INSPECTION
   ============================================================ */
function NewInspectionPage({ form, setForm, runDemo, startLive }) {
  const [scenario, setScenario] = useState("structural");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fillSample = () => setForm({
    packageId: randPkgId(Math.floor(Math.random() * 900)),
    shipmentId: `SHP-${20000 + Math.floor(Math.random() * 900)}`,
    productType: "Lithium Battery Pack",
    packageType: "Composite",
    origin: "Chennai, TN",
    destination: "Bengaluru, KA",
    zone: ZONES[0],
  });

  return (
    <div className="fade-up">
      <SectionHeader title="New Inspection" subtitle="Register a package and begin non-invasive CSI screening" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 2, minWidth: 340, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>Package Details</div>
            <button className="btn btn-ghost" onClick={fillSample}><Package size={14} /> Use Sample Package</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="field-label">Package ID</label>
              <input className="field-input" placeholder="PKG-10498" value={form.packageId} onChange={set("packageId")} />
            </div>
            <div>
              <label className="field-label">Shipment ID</label>
              <input className="field-input" placeholder="SHP-20501" value={form.shipmentId} onChange={set("shipmentId")} />
            </div>
            <div>
              <label className="field-label">Product Type</label>
              <select className="field-input" value={form.productType} onChange={set("productType")}>
                {PRODUCT_TYPES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Package Type</label>
              <select className="field-input" value={form.packageType} onChange={set("packageType")}>
                {PACKAGE_TYPES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Origin</label>
              <input className="field-input" placeholder="Pune, MH" value={form.origin} onChange={set("origin")} />
            </div>
            <div>
              <label className="field-label">Destination</label>
              <input className="field-input" placeholder="Bengaluru, KA" value={form.destination} onChange={set("destination")} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="field-label">Inspection Zone</label>
              <select className="field-input" value={form.zone} onChange={set("zone")}>
                {ZONES.map((z) => <option key={z}>{z}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={startLive}>
              <Radio size={15} /> Start Live Inspection
            </button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => runDemo(scenario)}>
              <Play size={15} /> Run Demo Inspection
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--text3)" }}>
            "Start Live Inspection" requires a connected CSI receiver — in this prototype it falls back to Demo Mode automatically.
          </div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 260, padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>Demo Scenario</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>Choose the simulated CSI outcome for this inspection.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.values(SCENARIOS).map((s) => (
              <button key={s.key} onClick={() => setScenario(s.key)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px",
                borderRadius: 8, border: `1px solid ${scenario === s.key ? s.color : "var(--hair)"}`,
                background: scenario === s.key ? "var(--panel2)" : "transparent", color: "var(--text)", fontSize: 12.8, fontWeight: 600, textAlign: "left"
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} /> {s.label}
                </span>
                {scenario === s.key && <CheckCircle2 size={15} color={s.color} />}
              </button>
            ))}
          </div>
          <div className="card" style={{ marginTop: 16, padding: 12, background: "var(--panel2)" }}>
            <DemoTag />
            <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 8, lineHeight: 1.5 }}>
              No hardware connected. All CSI frames in this session are synthetically generated for demonstration purposes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DEMO RUN PROGRESS (shared overlay strip)
   ============================================================ */
const DEMO_STEPS = [
  "Initializing inspection node",
  "Connecting to CSI receiver",
  "Collecting CSI frames",
  "Filtering signal noise",
  "Normalizing signal",
  "Extracting features",
  "Running anomaly model",
  "Generating inspection result",
];

function DemoRunStrip({ stepIndex, total, running }) {
  const pct = Math.min(100, Math.round(((stepIndex + 1) / total) * 100));
  return (
    <div className="card fade-up" style={{ padding: "14px 18px", marginBottom: 16, borderColor: "var(--cyan-dim)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700 }}>
          <Cpu size={14} color="var(--cyan)" />
          {running ? DEMO_STEPS[stepIndex] + "…" : "Analysis complete"}
        </div>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--text3)" }}>{pct}%</span>
      </div>
      <ProgressBar value={pct} />
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {DEMO_STEPS.map((s, i) => (
          <span key={s} className="mono" style={{
            fontSize: 10, padding: "3px 7px", borderRadius: 5,
            color: i < stepIndex || (!running) ? "var(--green)" : i === stepIndex ? "var(--cyan)" : "var(--text3)",
            background: i < stepIndex || (!running) ? "var(--green-dim)" : i === stepIndex ? "rgba(45,212,238,0.08)" : "var(--panel2)",
            border: `1px solid ${i === stepIndex && running ? "var(--cyan-dim)" : "var(--hair)"}`
          }}>
            {i < stepIndex || !running ? "✓" : i + 1} {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   LIVE CSI MONITOR
   ============================================================ */
function LiveMonitorPage({ inspection, demo, connected, setConnected }) {
  const [subFilter, setSubFilter] = useState("All Subcarriers");
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [series, setSeries] = useState(() => genSeries(inspection.scenario, 40, tick + 1));
  const [subResp, setSubResp] = useState(() => genSubcarrierResponse(inspection.scenario, tick + 1));
  const [energy, setEnergy] = useState(() => genEnergySeries(inspection.scenario, 24, tick + 1));
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeries(genSeries(inspection.scenario, 40, tick + 1));
    setSubResp(genSubcarrierResponse(inspection.scenario, tick + 1));
    setEnergy(genEnergySeries(inspection.scenario, 24, tick + 1));
    // eslint-disable-next-line
  }, [inspection]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
      }, 1200);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    setSeries(genSeries(inspection.scenario, 40, tick + 2));
    setSubResp(genSubcarrierResponse(inspection.scenario, tick + 2));
    setEnergy(genEnergySeries(inspection.scenario, 24, tick + 2));
    // eslint-disable-next-line
  }, [tick]);

  const filteredSub = subFilter === "All Subcarriers" ? subResp : subResp.filter((s) => {
    const n = parseInt(subFilter.replace(/\D/g, ""), 10);
    return s.sc >= n - 3 && s.sc <= n + 3;
  });

  return (
    <div className="fade-up">
      <SectionHeader
        title="Live CSI Monitor"
        subtitle="Wi-Fi Channel State Information — amplitude, phase & subcarrier response"
        right={<DemoTag />}
      />

      {demo?.active && demo.page === "live-monitor" && <DemoRunStrip stepIndex={demo.stepIndex} total={DEMO_STEPS.length} running={demo.running} />}

      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 190 }}>
          {connected ? <Wifi size={16} color="var(--green)" /> : <WifiOff size={16} color="var(--text3)" />}
          <div>
            <div style={{ fontSize: 10.5, color: "var(--text3)", textTransform: "uppercase" }}>CSI Sensor Status</div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: connected ? "var(--green)" : "var(--cyan)" }}>{connected ? "CONNECTED" : "DEMO MODE"}</div>
          </div>
        </div>
        {[
          { label: "Packets Received", value: (1200 + tick * 37).toLocaleString() },
          { label: "CSI Frames", value: (340 + tick * 12).toLocaleString() },
          { label: "Sampling Rate", value: "100 Hz" },
          { label: "Active Subcarriers", value: "64" },
          { label: "Signal Quality", value: `${(89 + (tick % 5)).toFixed(0)}%` },
        ].map((m) => (
          <div key={m.label} className="card" style={{ padding: "12px 16px", flex: 1, minWidth: 130 }}>
            <div style={{ fontSize: 10.5, color: "var(--text3)", textTransform: "uppercase" }}>{m.label}</div>
            <div className="mono" style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <SlidersHorizontal size={14} color="var(--text3)" />
        {["All Subcarriers", "Subcarrier 1", "Subcarrier 10", "Subcarrier 20", "Subcarrier 30", "Subcarrier 40", "Subcarrier 50", "Subcarrier 60"].map((s) => (
          <button key={s} onClick={() => setSubFilter(s)} className="mono" style={{
            padding: "5px 10px", borderRadius: 6, fontSize: 11.5, border: `1px solid ${subFilter === s ? "var(--cyan-dim)" : "var(--hair)"}`,
            background: subFilter === s ? "rgba(45,212,238,0.08)" : "transparent", color: subFilter === s ? "var(--cyan)" : "var(--text2)", fontWeight: 600
          }}>{s}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Start"}</button>
          <button className="btn" onClick={() => setTick((t) => t + 1)}><RotateCcw size={14} /> Reset</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SignalPanel title="CSI Amplitude vs Time" data={series} dataKey="amplitude" color="var(--cyan)" live={playing} />
        <SignalPanel title="CSI Phase vs Time" data={series} dataKey="phase" color="var(--blue)" live={playing} />
        <div className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Subcarrier Response — {subFilter}</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={filteredSub}>
              <CartesianGrid stroke="var(--hair)" vertical={false} />
              <XAxis dataKey="sc" tick={{ fill: "#5b6779", fontSize: 9 }} axisLine={{ stroke: "var(--hair)" }} tickLine={false} interval={filteredSub.length > 20 ? 6 : 0} />
              <YAxis tick={{ fill: "#5b6779", fontSize: 9 }} axisLine={false} tickLine={false} width={26} />
              <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="response" fill="var(--cyan-dim)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Signal Energy / Variation</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={energy}>
              <defs>
                <linearGradient id="enGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--amber)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--hair)" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fill: "#5b6779", fontSize: 9 }} axisLine={false} tickLine={false} width={26} />
              <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="energy" stroke="var(--amber)" fill="url(#enGrad)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SignalProcessingPanel demo={demo} inspection={inspection} />
    </div>
  );
}

function SignalPanel({ title, data, dataKey, color, live }) {
  return (
    <div className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{title}</div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <CartesianGrid stroke="var(--hair)" vertical={false} />
          <XAxis dataKey="t" hide />
          <YAxis tick={{ fill: "#5b6779", fontSize: 9 }} axisLine={false} tickLine={false} width={26} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      {live && (
        <div style={{
          position: "absolute", top: 34, bottom: 10, width: "6%", left: "-8%",
          background: `linear-gradient(90deg, transparent, ${color}22, transparent)`,
          animation: "sweep 2.4s linear infinite", pointerEvents: "none"
        }} />
      )}
    </div>
  );
}

function SignalProcessingPanel({ demo, inspection }) {
  const active = demo?.active;
  const stepIndex = demo?.stepIndex ?? 8;
  const stages = [
    { label: "CSI Acquisition", at: 2 },
    { label: "Noise Filtering", at: 3 },
    { label: "Phase Correction", at: 4 },
    { label: "Normalization", at: 4 },
    { label: "Feature Extraction", at: 5 },
  ];
  const metrics = [
    { label: "Noise Level", value: `${(2 + inspection.scenario.driftAmp * 8).toFixed(1)} dB` },
    { label: "Signal Variance", value: (inspection.scenario.driftAmp * 1.8).toFixed(3) },
    { label: "Mean Amplitude", value: "1.42" },
    { label: "Phase Stability", value: `${(96 - inspection.scenario.driftPhase * 80).toFixed(1)}%` },
    { label: "SNR", value: `${(28 - inspection.scenario.driftAmp * 20).toFixed(1)} dB` },
  ];
  return (
    <div className="card" style={{ padding: 18, marginTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Signal Processing Pipeline</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {stages.map((s, i) => {
          const done = !active || stepIndex >= s.at || !demo?.running;
          return (
            <React.Fragment key={s.label}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8,
                border: `1px solid ${done ? "var(--green-dim)" : "var(--hair)"}`, background: done ? "var(--green-dim)" : "var(--panel2)",
                color: done ? "var(--green)" : "var(--text3)", fontSize: 12, fontWeight: 600
              }}>
                {done ? <CheckCircle2 size={13} /> : <Circle size={13} />} {s.label}
              </div>
              {i < stages.length - 1 && <ArrowRight size={14} color="var(--hair-bright)" />}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ background: "var(--panel2)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--hair)" }}>
            <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase" }}>{m.label}</div>
            <div className="mono" style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   AI ANALYSIS PAGE
   ============================================================ */
function AIAnalysisPage({ inspection, demo, goResult }) {
  const s = inspection.scenario;
  const running = demo?.active && demo.page === "ai-analysis" && demo.running;
  return (
    <div className="fade-up">
      <SectionHeader
        title="AI-Powered Package Integrity Analysis"
        subtitle={`Model: WaveGuard Anomaly Engine · Mode: Prototype / Demo`}
        right={<DemoTag />}
      />
      {demo?.active && demo.page === "ai-analysis" && <DemoRunStrip stepIndex={demo.stepIndex} total={DEMO_STEPS.length} running={demo.running} />}

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <div className="card" style={{ flex: 1, minWidth: 300, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Extracted Features</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {inspection.features.map((f) => (
              <div key={f.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: "var(--text2)" }}>{f.label}</span>
                  <span className="mono" style={{ fontWeight: 700 }}>{f.value.toFixed(1)}%</span>
                </div>
                <ProgressBar value={f.value} color={f.value > 60 ? "var(--red)" : f.value > 30 ? "var(--amber)" : "var(--cyan)"} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 300, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Classification Probabilities</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {inspection.classProbs.map((c) => (
              <div key={c.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: "var(--text2)" }}>{c.label}</span>
                  <span className="mono" style={{ fontWeight: 700 }}>{c.value.toFixed(1)}%</span>
                </div>
                <ProgressBar value={c.value} color={c.label === s.classification.replace("STRUCTURAL ANOMALY", "Structural Anomaly") || c.label.toUpperCase() === s.classification ? s.color : "var(--hair-bright)"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 240, padding: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 11.5, color: "var(--text3)", textTransform: "uppercase", marginBottom: 8 }}>Overall Anomaly Score</div>
          <div className="mono" style={{ fontSize: 42, fontWeight: 800, color: s.color }}>{s.anomalyScore.toFixed(1)}%</div>
          <div style={{ marginTop: 10 }}><RiskBadge risk={s.risk} /></div>
        </div>
        <div className="card" style={{ flex: 2, minWidth: 320, padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Why was this package flagged?</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {s.reasons.map((r) => (
              <li key={r} style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>{r}</li>
            ))}
          </ul>
          <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--panel2)", borderRadius: 8, fontSize: 11.5, color: "var(--text3)", lineHeight: 1.5, border: "1px solid var(--hair)" }}>
            AI-generated screening result. Secondary physical inspection is recommended for high-risk cases.
          </div>
          {!running && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={goResult}>
              View Inspection Result <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INSPECTION RESULT
   ============================================================ */
function ResultPage({ inspection, setPage, addNote }) {
  const pass = inspection.result === "PASS";
  const s = inspection.scenario;
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  return (
    <div className="fade-up">
      <SectionHeader title="Inspection Result" subtitle={`Inspection ${inspection.inspectionId}`} right={<DemoTag />} />

      <div className="card" style={{ padding: 30, textAlign: "center", marginBottom: 16, border: `1px solid ${pass ? "var(--green-dim)" : "var(--red-dim)"}` }}>
        {pass ? <CheckCircle2 size={46} color="var(--green)" /> : <AlertTriangle size={46} color="var(--red)" />}
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 12, color: pass ? "var(--green)" : "var(--red)" }}>
          {pass ? "PACKAGE CLEARED" : "ANOMALY DETECTED"}
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>{s.classification}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        {[
          ["Package ID", inspection.packageId],
          ["Inspection ID", inspection.inspectionId],
          ["Timestamp", inspection.timestamp.toLocaleString()],
          ["Product Type", inspection.productType],
          ["Anomaly Score", `${inspection.anomalyScore.toFixed(1)}%`],
          ["Risk Level", inspection.risk],
          ["Package Type", inspection.packageType],
          ["Inspection Zone", inspection.zone],
        ].map(([k, v]) => (
          <div key={k} className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 10.5, color: "var(--text3)", textTransform: "uppercase" }}>{k}</div>
            <div className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{k === "Risk Level" ? <RiskBadge risk={v} /> : v}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 16, borderLeft: `3px solid ${s.color}` }}>
        <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>Recommended Action</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{s.action}</div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setPage("report")}><FileText size={15} /> Generate Report</button>
        <button className="btn" onClick={() => setPage("live-monitor")}><Waves size={15} /> View Signal Analysis</button>
        <button className="btn" onClick={() => setPage("history")}><History size={15} /> View History</button>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Add Inspection Note</div>
        <textarea className="field-input" rows={3} placeholder="Add a note for this inspection…" value={note} onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }} />
        <button className="btn" style={{ marginTop: 10 }} onClick={() => { addNote(inspection.inspectionId, note); setNoteSaved(true); }}>Save Note</button>
        {noteSaved && <span style={{ marginLeft: 10, fontSize: 12, color: "var(--green)" }}>Saved</span>}
      </div>
    </div>
  );
}

/* ============================================================
   INSPECTION HISTORY
   ============================================================ */
function HistoryPage({ history, openInspection }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const filtered = history.filter((r) => {
    if (filter === "Passed" && r.result !== "PASS") return false;
    if (filter === "Anomaly" && r.result !== "ANOMALY") return false;
    if (filter === "High Risk" && r.risk !== "HIGH") return false;
    if (filter === "Pending Review" && r.risk !== "MEDIUM") return false;
    if (query && !(`${r.pkg} ${r.inspId}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });
  return (
    <div className="fade-up">
      <SectionHeader title="Inspection History" subtitle={`${history.length} total inspections on record`} />
      <div className="card" style={{ padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--panel2)", border: "1px solid var(--hair)", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--text3)" />
          <input placeholder="Search by Package ID, Shipment ID, Inspection ID" value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, width: "100%" }} />
        </div>
        {["All", "Passed", "Anomaly", "High Risk", "Pending Review"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="btn" style={{
            padding: "7px 12px", background: filter === f ? "var(--panel3)" : "var(--panel2)",
            borderColor: filter === f ? "var(--cyan-dim)" : "var(--hair)", color: filter === f ? "var(--cyan)" : "var(--text2)"
          }}>{f}</button>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="scroll-thin" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text3)", fontSize: 11, textTransform: "uppercase" }}>
                {["Inspection ID", "Package ID", "Product", "Result", "Confidence", "Risk", "Date", "Inspector", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", borderBottom: "1px solid var(--hair)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--hair)", cursor: "pointer" }} onClick={() => openInspection(r)}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--panel2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td className="mono" style={{ padding: "11px 16px" }}>{r.inspId}</td>
                  <td className="mono" style={{ padding: "11px 16px", fontWeight: 600 }}>{r.pkg}</td>
                  <td style={{ padding: "11px 16px", color: "var(--text2)" }}>{r.product}</td>
                  <td style={{ padding: "11px 16px" }}><ResultBadge result={r.result} /></td>
                  <td className="mono" style={{ padding: "11px 16px" }}>{r.conf}%</td>
                  <td style={{ padding: "11px 16px" }}><RiskBadge risk={r.risk} /></td>
                  <td className="mono" style={{ padding: "11px 16px", color: "var(--text3)" }}>{r.date}</td>
                  <td style={{ padding: "11px 16px", color: "var(--text2)" }}>{r.inspector}</td>
                  <td style={{ padding: "11px 16px" }}><ChevronRight size={14} color="var(--text3)" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 24, textAlign: "center", color: "var(--text3)" }}>No inspections match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ALERTS
   ============================================================ */
function AlertsPage({ history, resolveAlert, resolved, openInspection, setPage, setActive }) {
  const alerts = history.filter((r) => r.result === "ANOMALY").map((r) => ({
    ...r, severity: r.risk === "HIGH" ? "Critical" : r.risk === "MEDIUM" ? "High" : "Medium",
  }));
  const groups = ["Critical", "High", "Medium", "Low"];
  return (
    <div className="fade-up">
      <SectionHeader title="Alert Center" subtitle="Anomalies requiring review or secondary inspection" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {alerts.length === 0 && <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text3)" }}>No active alerts.</div>}
        {alerts.map((a) => {
          const isResolved = resolved.includes(a.id);
          const sevColor = a.severity === "Critical" ? "var(--red)" : a.severity === "High" ? "var(--amber)" : "var(--blue)";
          return (
            <div key={a.id} className="card" style={{ padding: 16, borderLeft: `3px solid ${sevColor}`, opacity: isResolved ? 0.55 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span className="badge" style={{ color: sevColor, background: `${sevColor}18`, border: `1px solid ${sevColor}44` }}>
                      <CircleAlert size={11} /> {a.severity.toUpperCase()} PRIORITY
                    </span>
                    {isResolved && <span className="badge" style={{ color: "var(--green)", background: "var(--green-dim)" }}><CheckCircle2 size={11} /> RESOLVED</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Package: <span className="mono">{a.pkg}</span></div>
                  <div style={{ fontSize: 12.5, color: "var(--text2)", marginTop: 3 }}>Detected: {SCENARIOS[a.scenario].classification}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text2)" }}>Confidence: <span className="mono">{a.conf}%</span> · Action: {SCENARIOS[a.scenario].action}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <button className="btn" onClick={() => openInspection(a)}><Eye size={13} /> Review</button>
                  <button className="btn" disabled={isResolved} onClick={() => resolveAlert(a.id)}><CheckCircle2 size={13} /> Resolve</button>
                  <button className="btn" onClick={() => { setActive(buildInspection(a.scenario, { packageId: a.pkg }, a.id)); setPage("report"); }}><FileText size={13} /> Report</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   ANALYTICS
   ============================================================ */
function AnalyticsPage({ history }) {
  const [range, setRange] = useState("7 Days");
  const byProduct = useMemo(() => {
    const m = {};
    history.forEach((r) => { m[r.product] = (m[r.product] || 0) + (r.result === "ANOMALY" ? 1 : 0); });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [history]);
  const volumeData = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`, volume: Math.round(60 + Math.sin(i / 2) * 30 + (i % 3) * 8)
  })), []);
  const riskDist = [
    { name: "Low", value: 1197, color: "var(--green)" },
    { name: "Medium", value: 41, color: "var(--amber)" },
    { name: "High", value: 12, color: "var(--red)" },
  ];
  const byDestination = [
    { name: "Bengaluru", value: 412 }, { name: "Pune", value: 305 }, { name: "Chennai", value: 261 }, { name: "Delhi NCR", value: 198 }, { name: "Hyderabad", value: 108 },
  ];
  return (
    <div className="fade-up">
      <SectionHeader title="Analytics" subtitle="Cross-inspection trends and quality metrics"
        right={<>
          {["Today", "7 Days", "30 Days", "Custom"].map((r) => (
            <button key={r} className="btn" style={{ padding: "7px 12px", background: range === r ? "var(--panel3)" : "var(--panel2)", borderColor: range === r ? "var(--cyan-dim)" : "var(--hair)", color: range === r ? "var(--cyan)" : "var(--text2)" }} onClick={() => setRange(r)}>{r}</button>
          ))}
        </>}
      />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <KPICard icon={Package} label="Total Inspections" value="8,942" sub={range} />
        <KPICard icon={ShieldCheck} label="Pass Rate" value="93.2%" accent="var(--green)" />
        <KPICard icon={AlertTriangle} label="Anomaly Rate" value="6.8%" accent="var(--amber)" />
        <KPICard icon={ShieldAlert} label="High Risk Rate" value="1.3%" accent="var(--red)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Inspection Volume Over Time</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={volumeData}>
              <defs><linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--blue)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--blue)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="var(--hair)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#5b6779", fontSize: 10 }} axisLine={{ stroke: "var(--hair)" }} tickLine={false} />
              <YAxis tick={{ fill: "#5b6779", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="volume" stroke="var(--blue)" fill="url(#volGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Anomalies by Product Type</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byProduct} layout="vertical">
              <CartesianGrid stroke="var(--hair)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#5b6779", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#93a0b2", fontSize: 10.5 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--red)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Risk Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={44} outerRadius={68} paddingAngle={2}>
                {riskDist.map((d, i) => <Cell key={i} fill={d.color} stroke="var(--panel)" strokeWidth={2} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Anomalies by Destination</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byDestination}>
              <CartesianGrid stroke="var(--hair)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#5b6779", fontSize: 9.5 }} axisLine={{ stroke: "var(--hair)" }} tickLine={false} />
              <YAxis tick={{ fill: "#5b6779", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: "var(--panel2)", border: "1px solid var(--hair-bright)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--cyan-dim)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   REPORT
   ============================================================ */
function ReportPage({ inspection }) {
  const s = inspection.scenario;
  const pass = inspection.result === "PASS";
  return (
    <div className="fade-up">
      <SectionHeader title="Inspection Report" subtitle={inspection.inspectionId}
        right={<>
          <button className="btn" onClick={() => window.print()}><Printer size={14} /> Print</button>
          <button className="btn" onClick={() => window.print()}><Download size={14} /> Download PDF</button>
          <button className="btn"><Share2 size={14} /> Share Report</button>
        </>}
      />
      <div className="card" style={{ padding: 30 }}>
        <div style={{ textAlign: "center", borderBottom: "1px solid var(--hair)", paddingBottom: 18, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Radio size={20} color="var(--cyan)" />
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: ".03em" }}>WAVEGUARD AI</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text2)", letterSpacing: ".08em", textTransform: "uppercase" }}>Package Integrity Inspection Report</div>
          <div style={{ marginTop: 10 }}><DemoTag /></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[["Inspection ID", inspection.inspectionId], ["Package ID", inspection.packageId], ["Shipment ID", inspection.shipmentId],
          ["Product", inspection.productType], ["Origin", inspection.origin], ["Destination", inspection.destination],
          ["Inspection Time", inspection.timestamp.toLocaleString()], ["Inspector", inspection.inspector]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase" }}>{k}</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 18, background: "var(--panel2)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase" }}>Result</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: pass ? "var(--green)" : "var(--red)" }}>{pass ? "PASS" : "ANOMALY DETECTED"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase" }}>Anomaly Score</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 800 }}>{inspection.anomalyScore.toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase" }}>Risk Level</div>
            <RiskBadge risk={inspection.risk} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Signal Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card" style={{ padding: 12 }}><MiniLineChart data={inspection.amplitudePhase} dataKey="amplitude" color="var(--cyan)" height={70} /><div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center" }}>Amplitude</div></div>
            <div className="card" style={{ padding: 12 }}><MiniLineChart data={inspection.amplitudePhase} dataKey="phase" color="var(--blue)" height={70} /><div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center" }}>Phase</div></div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Detected Deviations / AI Reasoning</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {s.reasons.map((r) => <li key={r} style={{ fontSize: 12.8, color: "var(--text2)", marginBottom: 5 }}>{r}</li>)}
          </ul>
        </div>

        <div className="card" style={{ padding: 14, borderLeft: `3px solid ${s.color}`, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase" }}>Recommended Action</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.action}</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Methodology</div>
          <div style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.7 }}>
            CSI acquisition captures channel state information from Wi-Fi signals passing through the inspection zone. Signal preprocessing removes noise and normalizes amplitude/phase. Feature extraction derives variance, correlation and stability metrics. A machine-learning anomaly detector then scores deviation from a learned baseline to flag possible structural abnormality.
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--text3)", borderTop: "1px solid var(--hair)", paddingTop: 14, lineHeight: 1.6 }}>
          This system is a prototype screening solution. Results indicate potential anomalies and should be followed by appropriate secondary inspection before safety-critical or production decisions.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SYSTEM CONFIGURATION
   ============================================================ */
function ConfigPage() {
  const [thresholds, setThresholds] = useState({ low: 30, medium: 60, high: 80 });
  const nodes = [
    { id: "CSI-NODE-01", loc: "Inspection Zone A", status: "Online", quality: 94 },
    { id: "CSI-NODE-02", loc: "Inspection Zone B", status: "Online", quality: 89 },
    { id: "CSI-NODE-03", loc: "Inspection Zone C", status: "Idle", quality: 0 },
  ];
  return (
    <div className="fade-up">
      <SectionHeader title="System Configuration" subtitle="Sensor nodes, zones, thresholds & model information" right={<span className="badge" style={{ color: "var(--amber)", background: "var(--amber-dim)" }}><CircleAlert size={11} /> DEMO MODE — NO LIVE HARDWARE</span>} />

      <div className="card" style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", fontWeight: 700, fontSize: 13.5, borderBottom: "1px solid var(--hair)" }}>CSI Sensor Nodes</div>
        <div style={{ padding: 16, display: "flex", gap: 14, flexWrap: "wrap" }}>
          {nodes.map((n) => (
            <div key={n.id} className="card" style={{ padding: 14, flex: 1, minWidth: 200, background: "var(--panel2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{n.id}</span>
                <span className="badge" style={{ color: n.status === "Online" ? "var(--green)" : "var(--text3)", background: n.status === "Online" ? "var(--green-dim)" : "var(--panel3)" }}>{n.status}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 6 }}><MapPin size={11} style={{ marginRight: 4, display: "inline" }} />{n.loc}</div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 4 }}>Signal Quality</div>
                <ProgressBar value={n.quality} color={n.quality > 0 ? "var(--cyan)" : "var(--hair)"} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 280, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Detection Thresholds</div>
          {Object.entries(thresholds).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ textTransform: "capitalize", color: "var(--text2)" }}>{k} risk ≥</span>
                <span className="mono">{v}%</span>
              </div>
              <input type="range" min={0} max={100} value={v} onChange={(e) => setThresholds((t) => ({ ...t, [k]: +e.target.value }))} style={{ width: "100%" }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ flex: 1, minWidth: 280, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Package Profiles</div>
          {PRODUCT_TYPES.slice(0, 5).map((p) => (
            <div key={p} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--hair)", fontSize: 12.5 }}>
              <span style={{ color: "var(--text2)" }}>{p}</span><span className="mono" style={{ color: "var(--text3)" }}>baseline calibrated</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ flex: 1, minWidth: 280, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Model Information</div>
          {[["Model", "WaveGuard Anomaly Engine"], ["Version", "v0.9.2-prototype"], ["Mode", "Demo / Simulation"], ["Training data", "Synthetic CSI dataset"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--hair)", fontSize: 12.5 }}>
              <span style={{ color: "var(--text2)" }}>{k}</span><span className="mono">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ABOUT / METHODOLOGY
   ============================================================ */
function AboutPage() {
  const steps = ["Wi-Fi Transmitter", "Sealed Package", "Wi-Fi Receiver", "CSI Data", "Signal Processing", "ML Model", "Inspection Decision"];
  return (
    <div className="fade-up">
      <SectionHeader title="About / Methodology" subtitle="How WaveGuard AI works — an experimental, prototype approach" />
      <div className="card" style={{ padding: 22, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Architecture</div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="mono" style={{ padding: "9px 12px", borderRadius: 8, background: "var(--panel2)", border: "1px solid var(--hair)", fontSize: 12, fontWeight: 600 }}>{s}</div>
              {i < steps.length - 1 && <ArrowRight size={14} color="var(--hair-bright)" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          ["What is CSI?", "Channel State Information describes how a Wi-Fi signal's amplitude and phase change as it propagates from transmitter to receiver — shaped by everything in its path, including a sealed package."],
          ["How Wi-Fi interacts with the environment", "Radio waves reflect, diffract and attenuate differently depending on the materials and geometry they pass through, producing a distinct signature per package."],
          ["How contents influence propagation", "Internal structure, density, and material composition subtly alter the signal path, which can surface as measurable deviations in the CSI stream."],
          ["CSI acquisition", "A receiver samples raw channel measurements across many subcarriers while the package passes through the inspection zone."],
          ["Signal preprocessing", "Raw frames are denoised, phase-corrected and normalized to remove hardware and environmental artifacts."],
          ["Feature extraction", "Amplitude/phase variance, subcarrier correlation and temporal stability are computed from the cleaned signal."],
          ["Machine learning", "A trained anomaly-detection model compares extracted features against a learned baseline for the product profile."],
          ["Anomaly detection & secondary inspection", "Packages exceeding the configured deviation threshold are flagged as a possible structural abnormality and routed for secondary physical inspection — this system does not make a final pass/fail determination on its own."],
        ].map(([title, body]) => (
          <div key={title} className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: "var(--cyan)" }}>{title}</div>
            <div style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.6 }}>{body}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 18, marginTop: 16, border: "1px solid var(--amber-dim)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <CircleAlert size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.6 }}>
            WaveGuard AI is an experimental Smart India Hackathon prototype. Wi-Fi CSI-based non-invasive inspection is an emerging research technique and is <b>not</b> a certified or clinically/industrially validated replacement for X-ray, ultrasound, CT, or certified NDT equipment. All results are AI-based anomaly screening and should inform, not replace, human inspection decisions.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [history, setHistory] = useState(buildInitialHistory);
  const [resolved, setResolved] = useState([]);
  const [notes, setNotes] = useState({});
  const [connected] = useState(false);
  const [form, setForm] = useState({ packageId: "", shipmentId: "", productType: PRODUCT_TYPES[0], packageType: PACKAGE_TYPES[0], origin: "", destination: "", zone: ZONES[0] });
  const [active, setActive] = useState(() => buildInspection("structural", {}, 999));
  const [demo, setDemo] = useState({ active: false, running: false, stepIndex: 0, page: "live-monitor" });
  const seedRef = useRef(100);
  const timerRef = useRef(null);

  const openInspection = (row) => {
    setActive(buildInspection(row.scenario, { packageId: row.pkg }, row.id));
    setDemo({ active: false, running: false, stepIndex: 0, page: "live-monitor" });
    setPage("ai-analysis");
  };

  const addNote = (id, text) => setNotes((n) => ({ ...n, [id]: text }));

  const resolveAlert = (id) => setResolved((r) => [...r, id]);

  const runDemo = useCallback((scenarioKey) => {
    clearInterval(timerRef.current);
    seedRef.current += 1;
    const insp = buildInspection(scenarioKey, form, seedRef.current);
    setActive(insp);
    setPage("live-monitor");
    setDemo({ active: true, running: true, stepIndex: 0, page: "live-monitor" });

    let step = 0;
    timerRef.current = setInterval(() => {
      step += 1;
      if (step >= DEMO_STEPS.length - 1) {
        clearInterval(timerRef.current);
        setDemo({ active: true, running: false, stepIndex: DEMO_STEPS.length - 1, page: "ai-analysis" });
        setPage("ai-analysis");
        setHistory((h) => [{
          id: -Date.now(), pkg: insp.packageId, product: insp.productType, scenario: insp.scenarioKey,
          conf: insp.anomalyScore, time: insp.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: insp.timestamp.toLocaleDateString(), inspector: insp.inspector, inspId: insp.inspectionId,
          result: insp.result === "PASS" ? "PASS" : "ANOMALY", risk: insp.risk,
        }, ...h]);
        return;
      }
      if (step === 3) { setDemo((d) => ({ ...d, stepIndex: step, page: "live-monitor" })); setPage("live-monitor"); }
      else if (step === 5) { setDemo((d) => ({ ...d, stepIndex: step, page: "ai-analysis" })); setPage("ai-analysis"); }
      else { setDemo((d) => ({ ...d, stepIndex: step })); }
    }, 900);
  }, [form]);

  const goResult = () => {
    setDemo((d) => ({ ...d, active: false }));
    setPage("result");
  };

  const startLive = () => runDemo("structural");

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (!authed) {
    return (
      <div className="wg-root">
        <GlobalStyle />
        <LoginPage onLogin={(u) => { setUser(u); setAuthed(true); }} />
      </div>
    );
  }

  const alertCount = history.filter((r) => r.result === "ANOMALY" && !resolved.includes(r.id)).length;

  let content;
  switch (page) {
    case "dashboard": content = <DashboardPage history={history} setPage={setPage} openInspection={openInspection} runDemo={runDemo} />; break;
    case "new-inspection": content = <NewInspectionPage form={form} setForm={setForm} runDemo={runDemo} startLive={startLive} />; break;
    case "live-monitor": content = <LiveMonitorPage inspection={active} demo={demo} connected={connected} />; break;
    case "ai-analysis": content = <AIAnalysisPage inspection={active} demo={demo} goResult={goResult} />; break;
    case "result": content = <ResultPage inspection={active} setPage={setPage} addNote={addNote} />; break;
    case "history": content = <HistoryPage history={history} openInspection={openInspection} />; break;
    case "alerts": content = <AlertsPage history={history} resolveAlert={resolveAlert} resolved={resolved} openInspection={openInspection} setPage={setPage} setActive={setActive} />; break;
    case "analytics": content = <AnalyticsPage history={history} />; break;
    case "report": content = <ReportPage inspection={active} />; break;
    case "config": content = <ConfigPage />; break;
    case "about": content = <AboutPage />; break;
    default: content = null;
  }

  return (
    <div className="wg-root">
      <GlobalStyle />
      <div style={{ display: "flex" }}>
        <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} alertCount={alertCount} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Topbar user={user} onLogout={() => setAuthed(false)} page={page} />
          <div className="scroll-thin" style={{ padding: "22px 26px", maxWidth: 1400, margin: "0 auto" }}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
