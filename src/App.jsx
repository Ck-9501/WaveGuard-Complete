import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/* ================= DATA ================= */

const NAV = [
  ["overview", "Overview", "◈"],
  ["live", "Live Inspection", "▶"],
  ["fusion", "Sensor Fusion", "⌬"],
  ["twin", "Digital Twin", "▦"],
  ["analytics", "Analytics", "▤"],
  ["alerts", "Alerts", "⚠"],
  ["history", "Inspection History", "≣"],
];

const WEIGHTS = { csi: 24, cv: 18, thz: 31, liq: 27 };

const SENSOR_META = {
  csi: { name: "Wi-Fi CSI", code: "CSI-01", purpose: "Detects changes in RF propagation caused by internal objects, movement, density or structural anomalies." },
  cv: { name: "Computer Vision", code: "CAM-01", purpose: "Inspects external appearance, labels, damage, deformation and visual abnormalities." },
  thz: { name: "THz / Internal Screening", code: "THZ-01", purpose: "Assists inspection of non-metallic internal contents and material boundaries." },
  liq: { name: "Liquid Detection", code: "LQD-01", purpose: "Detects signatures of liquid or water-rich contents and leakage." },
};

const SCENARIOS = {
  NORMAL: "Normal Package",
  LIQUID: "Liquid Anomaly",
  METAL: "Metal Object",
  DAMAGE: "Internal Structural Damage",
  MIXED: "Mixed Materials",
};

const STAGES = [
  { n: "Package identified", sensor: "Barcode + RFID reader", zone: "PACKAGE ENTRY", hint: "Reads ID and size", checking: "Package identity, size and speed" },
  { n: "External vision scan", sensor: "Computer Vision", zone: "CAMERA", hint: "Checking exterior", checking: "Surface, dents, labels and visible damage" },
  { n: "Wi-Fi CSI / RF screen", sensor: "Wi-Fi CSI", zone: "CSI / RF", hint: "Checking RF propagation", checking: "How radio waves change passing through the package" },
  { n: "Internal screening", sensor: "THz", zone: "INTERNAL SCREEN", hint: "Checking internal structures", checking: "Internal non-metallic structures and boundaries" },
  { n: "Liquid analysis", sensor: "Liquid Detection", zone: "LIQUID", hint: "Checking liquid signature", checking: "Water-rich contents and leaks" },
  { n: "AI sensor fusion", sensor: "AI Fusion Engine", zone: "AI FUSION", hint: "Combining sensor evidence", checking: "Combining 4 independent sensors to reduce false alarms" },
  { n: "Final decision", sensor: "Decision Gate", zone: "DECISION", hint: "PASS / SUSPICIOUS / X-RAY", checking: "Overall risk against release thresholds" },
];
const TICKS = 3;
const TOTAL = STAGES.length * TICKS;
const TICK_MS = 600;

const PIPELINE = ["IDENTIFY", "EXTERNAL SCAN", "INTERNAL SCREENING", "SENSOR FUSION", "AI RISK ANALYSIS", "PASS / ESCALATE", "X-RAY ONLY IF REQUIRED"];

const BASE_ALERTS = [
  { key: "b1", id: "WG-4088", level: "MEDIUM", type: "Unusual RF propagation pattern", conf: 81.2, time: "14:29:31", action: "Manual inspection recommended" },
  { key: "b2", id: "WG-4077", level: "LOW", type: "External package deformation", conf: 68.5, time: "14:24:10", action: "Visual check at packing station" },
  { key: "b3", id: "WG-4071", level: "LOW", type: "Label / barcode mismatch", conf: 64.0, time: "14:19:47", action: "Re-scan label" },
];

const BASE_HISTORY = [
  ["WG-4091", "14:31:42", "Solid", "None", 98.1, "Pass", "No", "Cleared"],
  ["WG-4090", "14:30:57", "Liquid", "Liquid signature", 91.7, "Suspicious", "Required", "Escalated"],
  ["WG-4089", "14:30:12", "Food / organic", "None", 97.3, "Pass", "No", "Cleared"],
  ["WG-4088", "14:29:31", "Mixed", "RF propagation", 81.2, "Suspicious", "Recommended", "Open"],
  ["WG-4087", "14:28:44", "Solid", "None", 98.6, "Pass", "No", "Cleared"],
  ["WG-4086", "14:27:58", "Solid", "Structural damage", 89.5, "Suspicious", "Required", "Escalated"],
  ["WG-4085", "14:27:09", "Metallic", "Dense object", 93.2, "Suspicious", "Required", "Escalated"],
  ["WG-4084", "14:26:20", "Food / organic", "None", 96.8, "Pass", "No", "Cleared"],
  ["WG-4083", "14:25:37", "Solid", "None", 97.9, "Pass", "No", "Cleared"],
  ["WG-4082", "14:24:51", "Mixed", "None", 95.2, "Pass", "No", "Cleared"],
].map((x) => ({ inspId: `base-${x[0]}`, id: x[0], time: x[1], material: x[2], anomaly: x[3], conf: x[4], decision: x[5], xray: x[6], status: x[7] }));

const RANGES = {
  today: { label: "Today", n: 12, unit: "h", base: 107, stats: [1284, "2.9%", "1.6%", "2.8s", "0.5%"] },
  "7d": { label: "7 Days", n: 7, unit: "d", base: 1240, stats: [8912, "3.1%", "1.9%", "2.9s", "0.6%"] },
  "30d": { label: "30 Days", n: 30, unit: "d", base: 1190, stats: [37420, "3.0%", "1.8%", "2.9s", "0.5%"] },
};

/* ================= INSPECTION ENGINE ================= */

const r = (a, b, d = 1) => +(a + Math.random() * (b - a)).toFixed(d);
const cap = (v) => Math.min(99.4, +v.toFixed(1));
const pad5 = (n) => String(n).padStart(5, "0");
const cvv = (surf, conf) => [+(100 - surf * 0.9 - r(0, 1)).toFixed(1), conf, surf, 0];

const PROFILES = {
  NORMAL: () => ({
    fc: r(95, 99), mat: ["Solid non-metallic", "Packing paper"], short: "Solid", parts: { foam: "ok", liquid: false, metal: false }, zone: null,
    finding: "No anomaly detected", thzText: "",
    s: { csi: [r(94, 99), r(2, 9), r(10, 40, 0), 0], cv: cvv(r(1, 5), r(94, 99)), thz: [r(93, 99), r(92, 99), r(4, 16), 0], liq: [r(0.5, 3), r(0, 1.5), 0, r(92, 99)] },
  }),
  LIQUID: () => ({
    fc: r(88, 97), mat: ["Liquid / water-rich", "Sealed plastic container"], short: "Liquid", parts: { foam: "ok", liquid: true, metal: false }, zone: "liquid",
    finding: "Liquid signature with possible leakage detected", thzText: "Liquid-filled volume inside container detected.",
    s: { csi: [r(70, 84), r(35, 55), r(40, 80, 0), 0], cv: cvv(r(3, 10), r(88, 96)), thz: [r(72, 88), r(65, 82), r(30, 55), 0], liq: [r(75, 98), r(30, 75), 0, r(88, 97)] },
  }),
  METAL: () => ({
    fc: r(86, 97), mat: ["Metallic object", "Foam packing"], short: "Metallic", parts: { foam: "ok", liquid: false, metal: true }, zone: "metal",
    finding: "Dense metallic object detected", thzText: "Dense object with sharp boundary detected inside.",
    s: { csi: [r(52, 68), r(75, 93), r(90, 170, 0), 0], cv: cvv(Math.random() < 0.25 ? r(28, 45) : r(2, 10), r(85, 95)), thz: [r(80, 97), r(75, 92), r(45, 68), 0], liq: [r(1, 6), r(0, 3), 0, r(92, 98)] },
  }),
  DAMAGE: () => ({
    fc: r(87, 97), mat: ["Solid non-metallic", "Fractured foam block"], short: "Solid", parts: { foam: "broken", liquid: false, metal: false }, zone: "foam",
    finding: "Internal structural anomaly detected", thzText: "Possible structural discontinuity in foam block.",
    s: { csi: [r(58, 74), r(60, 85), r(60, 120, 0), 0], cv: cvv(r(4, 14), r(84, 93)), thz: [r(60, 80), r(40, 62), r(70, 95), 0], liq: [r(3, 10), r(1, 6), 0, r(90, 97)] },
  }),
  MIXED: (forceBad) => {
    const bad = forceBad || Math.random() > 0.35;
    return {
      fc: bad ? r(88, 97) : r(84, 96), short: "Mixed", parts: { foam: bad ? "broken" : "ok", liquid: true, metal: false }, zone: bad ? "mixed" : null,
      mat: ["Mixed (foam + liquid)", bad ? "Damaged foam · leaking container" : "Intact foam · sealed container"],
      finding: bad ? "Structural anomaly + liquid signature detected" : "Multiple materials, no significant anomaly",
      thzText: "Possible structural discontinuity around container.",
      s: bad
        ? { csi: [r(45, 65), r(70, 92), r(70, 140, 0), 0], cv: cvv(r(8, 20), r(60, 80)), thz: [r(70, 95), r(45, 70), r(70, 95), 0], liq: [r(55, 85), r(45, 75), 0, r(90, 98)] }
        : { csi: [r(85, 95), r(12, 28), r(25, 60, 0), 0], cv: cvv(r(3, 12), r(88, 96)), thz: [r(70, 90), r(70, 90), r(15, 32), 0], liq: [r(8, 22), r(3, 12), 0, r(88, 96)] },
    };
  },
};

const DOMINANT = { csi: "RF propagation change", cv: "Surface deformation", thz: "Internal structure", liq: "Liquid signature" };

function generateRun(key, seq, forceBad = false) {
  const p = PROFILES[key](forceBad);
  const { s, fc } = p;
  const an = { csi: s.csi[1], cv: +(100 - s.cv[0]).toFixed(1), thz: s.thz[2], liq: Math.max(s.liq[0], s.liq[1]) };
  let risk = 0;
  Object.keys(WEIGHTS).forEach((k) => { risk += (an[k] * WEIGHTS[k]) / 100; });
  risk = +risk.toFixed(1);
  const decision = risk < 22 ? "PASS" : risk < 55 ? "SUSPICIOUS" : "X-RAY";
  const dominant = decision === "PASS" ? "None" : DOMINANT[Object.keys(WEIGHTS).sort((a, b) => an[b] * WEIGHTS[b] - an[a] * WEIGHTS[a])[0]];
  const liq0 = s.liq[0];
  return {
    key, label: SCENARIOS[key], inspId: `WG-${pad5(seq)}`, id: `WG-${seq + 3968}`,
    dims: `${r(30, 60, 0)} × ${r(20, 45, 0)} × ${r(15, 35, 0)} cm`, velocity: `${r(0.35, 0.55, 2)} m/s`,
    s, an, risk, decision, dominant, confidence: fc, short: p.short,
    cf: { id: r(99, 99.9), cv: s.cv[1], csi: cap(fc + r(-4, 0.5)), thz: cap(fc + r(-3, 0.8)), liq: cap(fc + r(-3, 1)) },
    found: {
      cv: an.cv >= 20 ? "Surface deformation detected." : "Exterior appears normal.",
      csi: an.csi >= 45 ? "Unusual RF propagation detected." : "RF pattern within expected range.",
      thz: an.thz >= 45 ? p.thzText : "No significant internal anomaly.",
      liq: an.liq >= 45 ? "Possible liquid/leakage signature detected." : "No liquid signature detected.",
    },
    riskLabel: risk < 12 ? "SAFE" : risk < 22 ? "LOW RISK" : risk < 55 ? "SUSPICIOUS" : "HIGH RISK",
    tone: decision === "PASS" ? "green" : decision === "SUSPICIOUS" ? "amber" : "red",
    primary: p.mat[0], secondary: p.mat[1],
    liquidPresence: liq0 >= 45 ? `Detected · ${Math.round(liq0)}%` : liq0 >= 4 ? `Trace · ${liq0}%` : "None",
    integrity: p.parts.foam === "broken" ? "Internal damage" : "Intact",
    anomalyProb: +Math.max(an.thz, an.csi, an.liq).toFixed(1),
    finding: p.finding, zone: decision === "PASS" ? null : p.zone, parts: p.parts,
    xray: decision === "PASS" ? "No" : decision === "X-RAY" ? "Required" : fc >= 88 ? "Recommended" : "Optional",
    action: decision === "PASS" ? "Release to dispatch" : decision === "X-RAY" ? "X-ray escalation" : "Secondary verification / manual inspection",
    reason: decision === "PASS" ? "All sensor signatures remain within expected range." : `${p.finding} with ${fc}% confidence.`,
  };
}

const toRecord = (run, time) => ({
  inspId: run.inspId, id: run.id, time, material: run.short, anomaly: run.decision === "PASS" ? "None" : run.finding.replace(" detected", ""), conf: run.confidence,
  decision: run.decision === "PASS" ? "Pass" : run.decision === "X-RAY" ? "X-Ray" : "Suspicious", xray: run.xray,
  status: run.decision === "PASS" ? "Cleared" : run.decision === "X-RAY" ? "Escalated" : "Open",
});
const toAlert = (run, time) => ({ key: run.inspId, insp: run.inspId, id: run.id, level: run.decision === "X-RAY" ? "HIGH" : "MEDIUM", type: run.finding.replace(" detected", ""), conf: run.confidence, time, action: run.action });

/* values ramp up and jitter while a stage is still measuring */
const scaled = (v, f, t, d = 1) => Math.max(0, +(v * f + (f < 1 ? Math.sin(t * 2.1 + v) * 1.4 : 0)).toFixed(d));
const badAt = (run) => [false, run.an.cv >= 20, run.an.csi >= 45, run.an.thz >= 45, run.an.liq >= 45, run.decision !== "PASS", run.decision !== "PASS"];

function stageInfo(run, i, f, t) {
  const { s, cf, an } = run;
  const sv = (v, d) => scaled(v, f, t, d);
  const base = { ...STAGES[i], live: "", found: "", conf: null, metrics: [], why: "" };
  if (i === 0) return { ...base, live: `${run.dims} · ${run.velocity}`, found: "Package detected on inspection line.", conf: cf.id, why: "Package identified → sending to camera.",
    metrics: [["Package ID", run.id], ["Dimensions", run.dims], ["Velocity", run.velocity], ["Inspection ID", `#${run.inspId}`]] };
  if (i === 1) return { ...base, live: `Surface anomaly: ${sv(s.cv[2])}%`, found: run.found.cv, conf: cf.cv,
    why: an.cv >= 20 ? "Surface issue noted → confirm with internal sensors." : "Exterior looks normal, but cameras cannot see inside → check RF next.",
    metrics: [["Visual integrity", `${sv(s.cv[0])}%`], ["Surface anomaly score", `${sv(s.cv[2])}%`], ["Vision confidence", `${sv(cf.cv)}%`]] };
  if (i === 2) return { ...base, live: `RF variation: ${sv(s.csi[1])}%`, found: run.found.csi, conf: cf.csi,
    why: an.csi >= 45 ? "RF pattern changed → look inside with THz." : "RF looks normal → still screen the inside.",
    metrics: [["Signal stability", `${sv(s.csi[0])}%`], ["Phase variation", `${sv(s.csi[2] / 10)}°`], ["CSI anomaly score", `${sv(s.csi[1])}`]] };
  if (i === 3) return { ...base, live: `Anomaly probability: ${sv(s.thz[2])}%`, found: run.found.thz, conf: cf.thz,
    why: an.thz >= 45 ? "Anomaly region found → check for liquid." : "Nothing unusual inside → check liquid to be sure.",
    metrics: [["Internal anomaly probability", `${sv(s.thz[2])}%`], ["Material boundary confidence", `${sv(s.thz[1])}%`], ["Internal screening confidence", `${sv(cf.thz)}%`]] };
  if (i === 4) return { ...base, live: `Liquid probability: ${sv(s.liq[0])}%`, found: run.found.liq, conf: cf.liq,
    why: an.liq >= 45 ? "Liquid signature found → combine all evidence." : "No liquid → combine all evidence.",
    metrics: [["Liquid probability", `${sv(s.liq[0])}%`], ["Leakage probability", `${sv(s.liq[1])}%`]] };
  if (i === 5) return { ...base, live: `Risk score: ${sv(run.risk)}`, found: `Risk ${run.risk} · main signal: ${run.dominant}`, conf: run.confidence,
    why: "Evidence combined → final decision.",
    metrics: [["Fusion confidence", `${sv(run.confidence)}%`], ["Risk score", `${sv(run.risk)}`], ["Dominant anomaly", f === 1 ? run.dominant : "…"]] };
  return { ...base, live: f === 1 ? run.decision : "Deciding…", found: run.reason, conf: run.confidence,
    why: run.decision === "PASS" ? "Risk below threshold → release to dispatch." : run.decision === "X-RAY" ? "Risk above threshold → send to X-ray." : "Risk elevated → secondary verification.",
    metrics: [["Decision", f === 1 ? run.decision : "…"], ["X-ray", f === 1 ? run.xray : "…"], ["Action", f === 1 ? run.action : "…"]] };
}

/* ================= HELPERS ================= */

const toneOf = (v) => ({ PASS: "green", SAFE: "green", CLEARED: "green", ONLINE: "green", NOMINAL: "green", LOW: "green", "LOW RISK": "green", NO: "green",
  REVIEW: "amber", MEDIUM: "amber", SUSPICIOUS: "amber", OPEN: "amber", DEGRADED: "amber", WATCH: "amber", RECOMMENDED: "amber", OPTIONAL: "amber",
  HIGH: "red", "HIGH RISK": "red", ESCALATED: "red", ANOMALY: "red", "X-RAY": "red", REQUIRED: "red" }[String(v).toUpperCase()] || "cyan");

const sensorStatus = (score) => (score >= 65 ? "ANOMALY" : score >= 35 ? "WATCH" : "NOMINAL");
const wave = (i, a, b) => Math.round(a + (Math.sin(i * 1.7) + 1) * 0.5 * (b - a) + ((i * 37) % 11));
const nowStr = () => new Date().toLocaleTimeString("en-GB");

/* ================= SMALL COMPONENTS ================= */

function StatusBadge({ value, tone }) {
  return <span className={`badge ${tone || toneOf(value)}`} title={`Status: ${value}`}>{value}</span>;
}

function ProgressBar({ value, tone = "cyan", label }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`progress-fill ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function MetricCard({ label, value, sub, tone = "cyan", tip }) {
  return (
    <div className={`metric-card ${tone}`} title={tip || label}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {sub && <small className="metric-sub">{sub}</small>}
    </div>
  );
}

function Panel({ title, right, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-head"><h3>{title}</h3>{right}</header>
      {children}
    </section>
  );
}

function KV({ label, value, tone }) {
  return <div className="kv"><span>{label}</span><strong className={tone || ""}>{value}</strong></div>;
}

function NavigationItem({ item, active, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick} title={item[1]}>
      <span className="nav-icon">{item[2]}</span>{item[1]}
    </button>
  );
}

function SensorCard({ id, sc, detail }) {
  const meta = SENSOR_META[id];
  const v = sc.s[id];
  const rows = {
    csi: [["Signal stability", `${v[0]}%`], ["CSI anomaly score", `${v[1]}`], ["Phase variation", `${(v[2] / 10).toFixed(1)}°`]],
    cv: [["Visual integrity", `${v[0]}%`], ["Detection confidence", `${v[1]}%`], ["Surface anomaly", `${v[2]}%`]],
    thz: [["Material confidence", `${v[0]}%`], ["Boundary confidence", `${v[1]}%`], ["Anomaly score", `${v[2]}`]],
    liq: [["Liquid probability", `${v[0]}%`], ["Leakage probability", `${v[1]}%`], ["Signature match", `${v[3]}%`]],
  }[id];
  const anomaly = id === "csi" ? v[1] : id === "cv" ? 100 - v[0] : id === "thz" ? v[2] : Math.max(v[0], v[1]);
  const status = sensorStatus(anomaly);
  return (
    <article className={`sensor-card ${toneOf(status)}`}>
      <header><span className="sensor-code">{meta.code}</span><StatusBadge value={status} /></header>
      <h4>{meta.name}</h4>
      <p className="purpose">{meta.purpose}</p>
      {rows.map(([k, val]) => <KV key={k} label={k} value={val} />)}
      <ProgressBar value={anomaly} tone={toneOf(status)} label={`${meta.name} anomaly`} />
      {detail && <div className="sensor-extra"><KV label="Contribution" value={`${WEIGHTS[id]}%`} /><KV label="Anomaly score" value={+anomaly.toFixed(1)} /></div>}
    </article>
  );
}

function PackageVisualization({ sc, scanning, pending, caption }) {
  const { parts, zone } = sc;
  return (
    <div className={`pkg-viz ${scanning ? "scanning" : ""}`} aria-label="Internal package visualization">
      <div className="pkg-box">
        <div className="pkg-flap left" /><div className="pkg-flap right" />
        <div className="pkg-tape" /><div className="pkg-label">{sc.id}<br />FRAGILE · THIS SIDE UP</div>
        <div className="pkg-interior">
          <div className={`pkg-foam ${parts.foam}`}>
            <span>FOAM BLOCK</span>
            {parts.foam === "broken" && <><i className="crack c1" /><i className="crack c2" /><i className="crack c3" /></>}
          </div>
          {parts.liquid && <div className="pkg-container"><span>LIQUID CONTAINER</span>{zone && <><i className="leak" /><i className="drop d1" /><i className="drop d2" /></>}</div>}
          {parts.metal && <div className="pkg-metal"><span>DENSE OBJECT</span></div>}
          {zone && <div className={`anomaly-zone zone-${zone}`}><b>ANOMALY</b></div>}
        </div>
        <div className="scan-sweep" />
      </div>
      <div className={`viz-caption ${pending ? "cyan" : zone ? "red" : "green"}`}>
        {caption || (pending ? "Scanning inside the package…" : zone ? "Internal anomaly region detected" : "No internal anomaly region")}
      </div>
      <ul className="viz-legend">
        <li><i className="lg foam" />Foam block</li><li><i className="lg liquid" />Liquid container</li><li><i className="lg zone" />Anomaly zone</li>
      </ul>
      <p className="viz-note">{zone && !pending ? "Exterior can look normal — the anomaly is found by CSI, THz and liquid sensing." : "Sensors look through the box, not just at its surface."}</p>
    </div>
  );
}

function InspectionPipeline({ activeIndex = PIPELINE.length, escalate }) {
  return (
    <ol className="pipeline">
      {PIPELINE.map((name, i) => {
        const last = i === PIPELINE.length - 1;
        const done = i < activeIndex && !(last && !escalate);
        return (
          <li key={name} className={`pipe-step ${done ? "done" : ""} ${i === activeIndex ? "current" : ""} ${last ? "xray" : ""}`}>
            <span className="pipe-dot">{done ? "✓" : i + 1}</span>{name}
            {i < PIPELINE.length - 1 && <span className="pipe-arrow">↓</span>}
          </li>
        );
      })}
    </ol>
  );
}

function FusionEngine({ sc }) {
  const label = sc.decision === "PASS" ? "PASS · CLEARED" : sc.decision === "X-RAY" ? "X-RAY ESCALATION" : "SUSPICIOUS PACKAGE";
  return (
    <Panel title="AI SENSOR FUSION ENGINE" right={<StatusBadge value={sc.riskLabel} />} className="fusion-panel">
      <div className="fusion-grid">
        <div>
          {Object.keys(WEIGHTS).map((k) => (
            <div className="contrib" key={k}>
              <span>{SENSOR_META[k].name.replace(" / Internal Screening", "").replace("Liquid Detection", "Liquid Sensor")}</span>
              <ProgressBar value={WEIGHTS[k] * 3} tone="cyan" label={`${k} contribution`} />
              <strong>{WEIGHTS[k]}%</strong>
              <em title="Sensor anomaly score">a={sc.an[k]}</em>
            </div>
          ))}
        </div>
        <div className="fusion-result">
          <span className="metric-label">Fusion confidence</span>
          <strong className={`big ${sc.tone}`}>{sc.confidence}%</strong>
          <div className={`decision-box ${sc.tone}`}>
            <b>{label}</b>
            <span>Reason: “{sc.reason}”</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Chart({ type, data, labels, series, tone = "cyan", height = 140 }) {
  const W = 400, H = height, pad = 6;
  const all = series ? series.flatMap((s) => s.data) : data;
  const max = Math.max(...all) * 1.08, min = type === "line" ? Math.min(...all) * 0.96 : 0;
  const x = (i, n) => pad + (i * (W - pad * 2)) / Math.max(1, n - 1);
  const y = (v) => H - 14 - ((v - min) / (max - min || 1)) * (H - 24);
  const list = series || [{ name: "v", data, tone }];
  const n = list[0].data.length;
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
        {[0.25, 0.5, 0.75].map((g) => <line key={g} className="grid" x1="0" x2={W} y1={H * g} y2={H * g} />)}
        {type === "bar"
          ? data.map((v, i) => { const bw = (W - pad * 2) / n; return <rect key={i} className={`bar ${tone}`} x={pad + i * bw + 1.5} width={Math.max(2, bw - 3)} y={y(v)} height={H - 14 - y(v)} />; })
          : list.map((s) => <polyline key={s.name} className={`line ${s.tone}`} fill="none" points={s.data.map((v, i) => `${x(i, n)},${y(v)}`).join(" ")} />)}
      </svg>
      <div className="chart-axis"><span>{labels[0]}</span><span>{labels[Math.floor(n / 2)]}</span><span>{labels[n - 1]}</span></div>
      {series && <div className="chart-legend">{series.map((s) => <span key={s.name} className={s.tone}>● {s.name}</span>)}</div>}
    </div>
  );
}

function AlertCard({ a, onAct }) {
  return (
    <article className={`alert-card ${toneOf(a.level)}`}>
      <div className="alert-side"><StatusBadge value={`${a.level} RISK`} tone={toneOf(a.level)} /><strong>{a.id}</strong><small>{a.time}</small></div>
      <div className="alert-body">
        <h4>{a.type}</h4>
        <KV label="Inspection" value={a.insp ? `#${a.insp}` : "—"} />
        <KV label="Confidence" value={`${a.conf}%`} />
        <KV label="Recommended action" value={a.action} />
        <ProgressBar value={a.conf} tone={toneOf(a.level)} label="alert confidence" />
      </div>
      <div className="alert-actions">
        <button className="btn" onClick={() => onAct("inspect", a)}>Inspect</button>
        <button className="btn danger" onClick={() => onAct("escalate", a)}>Escalate</button>
        <button className="btn ghost" onClick={() => onAct("dismiss", a)}>Dismiss</button>
      </div>
    </article>
  );
}

function HistoryTable({ rows }) {
  const head = ["Package ID", "Time", "Material", "Anomaly", "Confidence", "Decision", "X-Ray", "Status"];
  return (
    <div className="table-wrap">
      <table className="history-table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.inspId}>
              <td><strong>{x.id}</strong>{!x.inspId.startsWith("base-") && <><br /><small>#{x.inspId}</small></>}</td>
              <td>{x.time}</td><td>{x.material}</td><td>{x.anomaly}</td><td>{Number(x.conf).toFixed(1)}%</td>
              <td><StatusBadge value={x.decision.toUpperCase()} /></td><td className={x.xray === "Required" ? "red" : ""}>{x.xray}</td>
              <td><StatusBadge value={x.status.toUpperCase()} /></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={8}>No records match this filter.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ================= VIEWS ================= */

function ScenarioSelect({ ctl }) {
  return (
    <label className="scenario-select">Scenario (starts new inspection)
      <select value={ctl.key} onChange={(e) => ctl.setKey(e.target.value)}>
        {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </label>
  );
}

function Overview({ sc, ctl, clock, stats }) {
  const pctOf = (n, d = 1) => `${((n / stats.screened) * 100).toFixed(d)}%`;
  const kpis = [
    ["Packages Screened Today", stats.screened.toLocaleString(), "updates after every inspection", "cyan"],
    ["Anomalies Detected", stats.anomalies, `${pctOf(stats.anomalies)} of volume`, "amber"],
    ["Suspicious Packages", stats.suspicious, `${pctOf(stats.suspicious)} of volume`, "amber"],
    ["X-Ray Escalations", stats.xray, `${pctOf(stats.xray, 2)} of packages`, "red"],
    ["Average Inspection Time", "2.8 s", "target < 3.5 s", "green"],
    ["Detection Confidence", `${stats.conf.toFixed(1)}%`, "rolling mean", "green"],
  ];
  return (
    <div className="view overview">
      <div className="kpi-row">{kpis.map((k) => <MetricCard key={k[0]} label={k[0]} value={k[1]} sub={k[2]} tone={k[3]} />)}</div>
      <div className="overview-grid">
        <Panel title="LIVE INSPECTION · LAST RESULT" right={<StatusBadge value={ctl.escLast ? "X-RAY ESCALATED" : sc.decision} tone={ctl.escLast ? "red" : sc.tone} />} className="live-panel">
          <div className="live-head">
            <div><span className="metric-label">Package · #{sc.inspId}</span><strong className="pkg-id">{sc.id}</strong></div>
            <div><span className="metric-label">Confidence</span><strong className={`pkg-conf ${sc.tone}`}>{sc.confidence}%</strong></div>
            <ScenarioSelect ctl={ctl} />
          </div>
          <div className="live-body">
            <PackageVisualization sc={sc} scanning={false} />
            <div className="classification">
              <h4>Package classification</h4>
              <KV label="Primary material" value={sc.primary} />
              <KV label="Secondary material" value={sc.secondary} />
              <KV label="Liquid presence" value={sc.liquidPresence} tone={sc.an.liq >= 45 ? "amber" : "green"} />
              <KV label="Structural integrity" value={sc.integrity} tone={sc.integrity.includes("damage") ? "red" : "green"} />
              <KV label="Internal anomaly probability" value={`${sc.anomalyProb}%`} tone={sc.tone} />
              <ProgressBar value={sc.anomalyProb} tone={sc.tone} label="anomaly probability" />
              <div className="btn-row">
                <button className="btn primary" onClick={ctl.start} disabled={ctl.phase === "running" || ctl.phase === "paused"}>Start Inspection</button>
                <button className="btn danger" onClick={ctl.escalateLast} disabled={ctl.escLast}>Escalate to X-Ray</button>
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="DECISION PIPELINE" right={<span className="mono">{clock}</span>}>
          <InspectionPipeline activeIndex={sc.decision === "PASS" ? 6 : 7} escalate={sc.decision !== "PASS" || ctl.escLast} />
        </Panel>
      </div>
      <div className="sensor-row">{Object.keys(SENSOR_META).map((k) => <SensorCard key={k} id={k} sc={sc} />)}</div>
      <FusionEngine sc={sc} />
    </div>
  );
}

function LiveInspection({ run, ctl }) {
  const { t, phase } = ctl;
  const done = phase === "done", idle = phase === "idle";
  const cur = idle ? -1 : Math.min(STAGES.length - 1, Math.floor(t / TICKS));
  const sub = t % TICKS;
  const state = (i) => (done || (!idle && t >= (i + 1) * TICKS) ? "done" : i === cur ? "active" : "pending");
  const fac = (i) => (state(i) === "done" ? 1 : state(i) === "active" ? (sub + 1) / TICKS : 0);
  const info = (i) => stageInfo(run, i, fac(i), t);
  const bad = badAt(run);
  const shownIdx = idle ? 0 : cur;
  const ci = info(shownIdx);
  const found = !idle && fac(shownIdx) === 1;
  const pct = done ? 100 : (t / TOTAL) * 100;
  const confs = [1, 2, 3, 4].filter((i) => state(i) === "done").map((i) => info(i).conf);
  const liveConf = done ? `${run.confidence}%` : confs.length ? `${(confs.reduce((a, b) => a + b, 0) / confs.length).toFixed(1)}%` : "—";
  const stageLabel = idle ? "Ready" : done ? "Complete" : STAGES[cur].n;
  const reveal = (n) => done || (!idle && t >= n);
  const vis = {
    ...run,
    parts: { foam: reveal(12) ? run.parts.foam : "ok", liquid: reveal(15) && run.parts.liquid, metal: reveal(12) && run.parts.metal },
    zone: reveal(18) ? run.zone : null,
  };
  const tele = [["CSI signal (%)", run.s.csi[0], 2, 2], ["RF variation (%)", run.s.csi[1], 2, 2], ["Internal anomaly (%)", run.s.thz[2], 3, 3], ["Liquid probability (%)", run.s.liq[0], 4, 4], ["AI confidence (%)", run.confidence, 5, 5]];
  const sensorRows = [["CSI", "csi", 2], ["Vision", "cv", 1], ["THz", "thz", 3], ["Liquid", "liq", 4]];
  const canEsc = done && !ctl.escalated;
  const at = (i) => `T+${(((i + 1) * TICKS * TICK_MS) / 1000).toFixed(1)}s`;
  return (
    <div className="view live">
      <div className="kpi-row">
        <MetricCard label="Conveyor" value={phase === "running" ? "RUNNING" : phase === "paused" ? "PAUSED" : "STOPPED"} sub="Line A · package moves through the zones" tone={phase === "running" ? "green" : "amber"} />
        <MetricCard label="Inspection" value={`#${run.inspId}`} sub={`${run.id} · ${run.label}`} />
        <MetricCard label="Scan Progress" value={`${Math.round(pct)}%`} sub={`Stage ${done ? STAGES.length : cur + 1} of ${STAGES.length}`} />
        <MetricCard label="Current Stage" value={stageLabel} />
        <MetricCard label="AI Confidence" value={liveConf} sub={done ? run.decision : "updating live"} tone={done ? run.tone : "cyan"} />
      </div>

      <Panel title="INSPECTION CONTROL" right={<StatusBadge value={done ? (ctl.escalated ? "X-RAY ESCALATED" : run.decision) : idle ? "READY" : phase === "paused" ? "PAUSED" : "SCANNING"} tone={done ? run.tone : "cyan"} />}>
        <ProgressBar value={pct} tone={done ? run.tone : "cyan"} label="scan progress" />
        <div className="btn-row">
          <button className="btn primary" onClick={ctl.start} disabled={phase === "running" || phase === "paused"}>Start Inspection</button>
          <button className="btn" onClick={ctl.pause} disabled={phase !== "running" && phase !== "paused"}>{phase === "paused" ? "Resume" : "Pause"}</button>
          <button className="btn ghost" onClick={ctl.reset}>Reset</button>
          <button className="btn danger" onClick={ctl.escalate} disabled={!canEsc}>Escalate to X-Ray</button>
          <ScenarioSelect ctl={ctl} />
        </div>
      </Panel>

      <Panel title="INSPECTION LINE — WHERE IS THE PACKAGE?" right={<span className="mono">{idle ? "waiting for package" : ci.hint}</span>}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "26px 4px 8px" }}>
          {STAGES.map((z, i) => {
            const s = state(i);
            return (
              <div key={z.zone} className={`station ${s === "active" ? "here" : ""} ${s === "done" ? "passed" : ""}`}>
                <span className="station-idx">{i === 0 ? "IN" : i}</span><strong>{z.zone}</strong>
                <small>{z.hint}</small>
                {s === "done" && i > 0 && i < 5 && <span className={bad[i] ? "red" : "green"}>{info(i).found}</span>}
                {s === "active" && <div className="parcel">{run.id}</div>}
                {i < STAGES.length - 1 && <span className="belt">→</span>}
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="live-body">
        <Panel title="PACKAGE — INSIDE VIEW">
          <PackageVisualization sc={vis} scanning={phase === "running"} pending={!done} caption={idle ? "Waiting for package" : undefined} />
        </Panel>
        <Panel title="LIVE INSPECTION STATUS" right={<StatusBadge value={idle ? "READY" : done ? "COMPLETE" : `STAGE ${cur + 1}/7`} tone={done ? run.tone : "cyan"} />}>
          <KV label="Current stage" value={idle ? "Press Start Inspection" : ci.n.toUpperCase()} />
          <KV label="Sensor active" value={idle ? "—" : ci.sensor} />
          <KV label="What we are checking" value={idle ? "—" : ci.checking} />
          <KV label="Live result" value={idle ? "—" : ci.live} tone={found ? "cyan" : ""} />
          <KV label="AI confidence" value={found && ci.conf ? `${ci.conf}%` : idle ? "—" : "measuring…"} />
          <KV label="Finding" value={found ? ci.found : idle ? "—" : "Scanning…"} tone={found ? (bad[shownIdx] ? "amber" : "green") : ""} />
          <KV label="Why next stage" value={found ? ci.why : idle ? "—" : "Waiting for result"} />
          {!idle && <div style={{ marginTop: 8 }}>{ci.metrics.map(([k, v]) => <KV key={k} label={k} value={v} />)}</div>}
        </Panel>
      </div>

      <div className="live-grid">
        <Panel title="LIVE SENSOR TELEMETRY" className="readings">
          {tele.map(([name, v, si, bi]) => {
            const f = fac(si);
            const val = scaled(v, f, t);
            return (
              <div className="reading" key={name}>
                <span>{name}</span>
                <ProgressBar value={f ? val : 0} tone={f === 1 ? (bad[bi] ? "amber" : "green") : "cyan"} label={name} />
                <strong>{f ? val : "…"}</strong>
              </div>
            );
          })}
        </Panel>
        <Panel title="INSPECTION TIMELINE">
          <ol className="timeline">
            {STAGES.map((z, i) => (
              <li key={z.n} className={`${state(i) === "done" ? "done" : ""} ${state(i) === "active" ? "current" : ""}`}>
                <span className="tl-dot">{state(i) === "done" ? "✓" : i + 1}</span>
                <span>{z.n}{state(i) === "done" && <><br /><small>{info(i).found}</small></>}</span>
                <em>{state(i) === "done" ? at(i) : state(i) === "active" ? "scanning" : "pending"}</em>
              </li>
            ))}
            {ctl.escalated && <li className="done xray"><span className="tl-dot">!</span><span>Escalated to X-Ray review</span><em>operator</em></li>}
          </ol>
        </Panel>
        <Panel title="DETECTION EVENTS" className="events">
          <ul className="event-log">
            {STAGES.map((z, i) => i).filter((i) => state(i) === "done").reverse().map((i) => (
              <li key={i}><span className="mono">{at(i)}</span>{STAGES[i].zone}: {info(i).found}</li>
            ))}
            {idle && <li><span className="mono">--:--</span>Awaiting package on conveyor</li>}
          </ul>
        </Panel>
      </div>

      <Panel title="AI SENSOR FUSION" right={<span className="mono">{state(5) === "pending" ? "waiting for all sensors" : "combining evidence"}</span>}>
        <div className="flow">
          {sensorRows.map(([name, k, si]) => (
            <div className="flow-node" key={k}>
              <div className="flow-box">{name}<b>{state(si) === "done" ? run.an[k] : "…"}</b></div><span className="flow-arrow">↓</span>
            </div>
          ))}
        </div>
        <div className="flow">
          <div className="flow-node"><div className="flow-box">AI SENSOR FUSION<b>{state(5) === "done" ? `${run.confidence}%` : "…"}</b></div><span className="flow-arrow">↓</span></div>
          <div className="flow-node"><div className="flow-box">RISK SCORE<b>{state(5) === "done" ? run.risk : "…"}</b></div><span className="flow-arrow">↓</span></div>
          <div className="flow-node"><div className="flow-box">FINAL DECISION<b>{done ? run.decision : "…"}</b></div></div>
        </div>
        <p className="reason">Combining independent sensor signals to reduce false alarms.{state(5) === "done" && ` Main signal: ${run.dominant}.`}</p>
      </Panel>

      {done && (
        <Panel title="INSPECTION COMPLETE" right={<StatusBadge value={ctl.escalated ? "X-RAY ESCALATED" : run.decision} tone={ctl.escalated ? "red" : run.tone} />} className="result-card">
          <div className="kpi-row">
            <MetricCard label="Package" value={run.id} sub={`Inspection #${run.inspId}`} />
            <MetricCard label="Result" value={ctl.escalated && run.decision !== "X-RAY" ? "X-RAY" : run.decision} tone={ctl.escalated ? "red" : run.tone} />
            <MetricCard label="Confidence" value={`${run.confidence}%`} tone={run.tone} />
            <MetricCard label="Primary finding" value={run.decision === "PASS" ? "None" : run.finding.replace(" detected", "")} tone={run.tone} />
            <MetricCard label="X-ray" value={ctl.escalated ? "Required" : run.xray} tone={toneOf(ctl.escalated ? "Required" : run.xray)} />
            <MetricCard label="Recommended action" value={ctl.escalated ? "X-ray escalation" : run.action} tone={run.tone} />
          </div>
          <p className="reason">{run.reason} Risk score {run.risk} · scenario: {run.label}.</p>
        </Panel>
      )}
    </div>
  );
}

function SensorFusion({ sc }) {
  const stages = ["SENSOR DATA", "FEATURE EXTRACTION", "AI FUSION", "ANOMALY SCORE", "RISK CLASSIFICATION"];
  const classes = ["SAFE", "LOW RISK", "SUSPICIOUS", "HIGH RISK"];
  return (
    <div className="view fusion">
      <div className="sensor-row">{Object.keys(SENSOR_META).map((k) => <SensorCard key={k} id={k} sc={sc} detail />)}</div>
      <Panel title={`FUSION ENGINE · #${sc.inspId}`} right={<StatusBadge value={sc.riskLabel} />}>
        <div className="flow">
          {stages.map((s, i) => (
            <div className="flow-node" key={s}><div className="flow-box">{s}{i === 3 && <b>{Math.round(sc.risk)}</b>}{i === 2 && <b>{sc.confidence}%</b>}</div>{i < stages.length - 1 && <span className="flow-arrow">↓</span>}</div>
          ))}
        </div>
        <div className="class-row">
          {classes.map((c) => <div key={c} className={`class-cell ${toneOf(c)} ${sc.riskLabel === c ? "selected" : ""}`}>{c}</div>)}
        </div>
      </Panel>
      <Panel title="SENSOR AGREEMENT">
        {Object.keys(WEIGHTS).map((k) => (
          <div className="agree" key={k}>
            <span>{SENSOR_META[k].name}</span>
            <ProgressBar value={sc.an[k]} tone={toneOf(sensorStatus(sc.an[k]))} label={k} />
            <strong>{Math.round(sc.an[k])}</strong><em>weight {WEIGHTS[k]}%</em>
          </div>
        ))}
        <KV label="Weighted anomaly score" value={sc.risk} tone={sc.tone} />
        <KV label="Final decision" value={sc.decision} tone={sc.tone} />
        <p className="reason">{sc.reason}</p>
      </Panel>
    </div>
  );
}

function DigitalTwin({ run, ctl }) {
  const nodes = ["Package Entry", "Camera", "CSI Scanner", "THz / Internal Scanner", "Liquid Detection", "AI Fusion", "Decision Gate"];
  const done = ctl.phase === "done", idle = ctl.phase === "idle";
  const pos = done ? 6 : idle ? 0 : Math.min(6, Math.floor(ctl.t / TICKS));
  const branch = ctl.escalated || run.decision !== "PASS" ? "xray" : "pass";
  const stageNames = ["Identification", "External scan", "CSI scan", "THz screening", "Liquid analysis", "Sensor fusion", "Decision"];
  return (
    <div className="view twin">
      <Panel title="WAREHOUSE INSPECTION LINE A" right={<StatusBadge value={ctl.phase === "running" ? "SCANNING" : "ONLINE"} tone="green" />}>
        <div className="line">
          {nodes.map((n, i) => (
            <div key={n} className={`station ${i === pos ? "here" : ""} ${i < pos ? "passed" : ""}`}>
              <span className="station-idx">{i + 1}</span><strong>{n}</strong>
              <small>{["Barcode + RFID", "Exterior imaging", "RF field", "Non-metallic scan", "Liquid signature", "Multi-sensor model", "Routing"][i]}</small>
              {i === pos && <div className="parcel">{run.id}</div>}
              {i < nodes.length - 1 && <span className="belt">→</span>}
            </div>
          ))}
        </div>
        <div className="gate">
          <div className={`gate-out pass ${done && branch === "pass" ? "active" : ""}`}>↙ PASS<small>Continue to dispatch</small></div>
          <div className={`gate-out xray ${done && branch === "xray" ? "active" : ""}`}>X-RAY ESCALATION ↘<small>Final verification only</small></div>
        </div>
      </Panel>
      <div className="kpi-row">
        <MetricCard label="Live package" value={run.id} sub={`#${run.inspId} · ${run.label}`} />
        <MetricCard label="Current position" value={nodes[pos]} sub={`Station ${pos + 1} of ${nodes.length}`} />
        <MetricCard label="Inspection stage" value={stageNames[pos]} />
        <MetricCard label="Risk level" value={done ? run.riskLabel : "PENDING"} tone={done ? run.tone : "cyan"} />
      </div>
      <Panel title="SENSOR STATUS ON LINE">
        <div className="sensor-mini-row">
          {Object.keys(SENSOR_META).map((k) => <div className="sensor-mini" key={k}><span>{SENSOR_META[k].code}</span><strong>{SENSOR_META[k].name}</strong><StatusBadge value="ONLINE" /></div>)}
        </div>
      </Panel>
    </div>
  );
}

function Analytics({ stats }) {
  const [range, setRange] = useState("today");
  const rg = RANGES[range];
  const idx = useMemo(() => Array.from({ length: rg.n }, (_, i) => i), [rg]);
  const labels = idx.map((i) => (range === "today" ? `${i + 6}:00` : `${rg.unit === "d" ? "D" : ""}${i + 1}`));
  const volume = idx.map((i) => wave(i, rg.base * 0.7, rg.base * 1.2));
  const anomaly = idx.map((i) => +(2 + Math.abs(Math.sin(i * 0.9)) * 2 + (i % 3) * 0.3).toFixed(1));
  const conf = (o, a) => idx.map((i) => +(a + Math.sin(i * 1.3 + o) * 2.2).toFixed(1));
  const st = range === "today"
    ? [stats.screened, `${((stats.anomalies / stats.screened) * 100).toFixed(1)}%`, "1.6%", "2.8s", `${((stats.xray / stats.screened) * 100).toFixed(2)}%`]
    : rg.stats;
  const cards = [
    ["Packages screened", st[0].toLocaleString()], ["Anomaly rate", st[1]], ["False escalation rate", st[2]],
    ["Average scan time", st[3]], ["X-ray escalation rate", st[4]], ["Detection confidence", `${stats.conf.toFixed(1)}%`],
  ];
  return (
    <div className="view analytics">
      <div className="filter-row">
        {Object.entries(RANGES).map(([k, v]) => <button key={k} className={`chip ${range === k ? "active" : ""}`} onClick={() => setRange(k)}>{v.label}</button>)}
        <span className="chip-note">7-day volume: 8,912 · 30-day volume: 37,420</span>
      </div>
      <div className="kpi-row">{cards.map((s) => <MetricCard key={s[0]} label={s[0]} value={s[1]} />)}</div>
      <div className="chart-grid">
        <Panel title="INSPECTION VOLUME"><Chart type="bar" data={volume} labels={labels} /></Panel>
        <Panel title="ANOMALY TREND (%)"><Chart type="line" series={[{ name: "Anomaly rate", data: anomaly, tone: "amber" }]} labels={labels} /></Panel>
        <Panel title="SENSOR CONFIDENCE TREND (%)" className="wide">
          <Chart type="line" labels={labels} height={170} series={[
            { name: "CSI", data: conf(0, 94), tone: "cyan" }, { name: "Vision", data: conf(1, 97), tone: "green" },
            { name: "THz", data: conf(2, 92), tone: "amber" }, { name: "Liquid", data: conf(3, 95), tone: "red" }]} />
        </Panel>
      </div>
    </div>
  );
}

function Alerts({ alerts, onAct, note }) {
  const c = (l) => alerts.filter((a) => a.level === l).length;
  return (
    <div className="view alerts">
      <div className="kpi-row">
        <MetricCard label="Active alerts" value={alerts.length} />
        <MetricCard label="High risk" value={c("HIGH")} tone="red" />
        <MetricCard label="Medium risk" value={c("MEDIUM")} tone="amber" />
        <MetricCard label="Low risk" value={c("LOW")} tone="green" />
      </div>
      {note && <div className="notice">{note}</div>}
      <div className="alert-list">
        {alerts.map((a) => <AlertCard key={a.key} a={a} onAct={onAct} />)}
        {!alerts.length && <div className="notice">All alerts resolved. Line A is operating normally.</div>}
      </div>
    </div>
  );
}

function History({ history }) {
  const [filter, setFilter] = useState("All");
  const shown = history.filter((x) => filter === "All" || (filter === "Passed" && x.decision === "Pass") || (filter === "Suspicious" && x.decision === "Suspicious") || (filter === "Escalated" && x.status === "Escalated"));
  return (
    <div className="view history">
      <div className="filter-row">
        {["All", "Passed", "Suspicious", "Escalated"].map((f) => <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}
        <span className="chip-note">{shown.length} of {history.length} records</span>
      </div>
      <Panel title="INSPECTION RECORDS"><HistoryTable rows={shown} /></Panel>
    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  const [view, setView] = useState("overview");
  const [key, setKey] = useState("MIXED");
  const [run, setRun] = useState(() => generateRun("MIXED", 124, true));
  const [lastRun, setLastRun] = useState(run);
  const [t, setT] = useState(TOTAL);
  const [phase, setPhase] = useState("done");
  const [stats, setStats] = useState({ screened: 1284, anomalies: 37, suspicious: 14, xray: 6, conf: 96.4 });
  const [history, setHistory] = useState(() => [toRecord(run, "14:32:08"), ...BASE_HISTORY]);
  const [alerts, setAlerts] = useState(() => [toAlert(run, "14:32:08"), ...BASE_ALERTS]);
  const [dismissed, setDismissed] = useState([]);
  const [note, setNote] = useState("");
  const [now, setNow] = useState(new Date());
  const seq = useRef(124);
  const recorded = useRef(null);
  if (!recorded.current) recorded.current = new Set([run.inspId]);

  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (phase !== "running") return undefined;
    const id = setInterval(() => setT((v) => Math.min(TOTAL, v + 1)), TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => { if (phase === "running" && t >= TOTAL) setPhase("done"); }, [t, phase]);

  useEffect(() => {
    if (phase !== "done" || recorded.current.has(run.inspId)) return;
    recorded.current.add(run.inspId);
    const time = nowStr();
    const bad = run.decision !== "PASS";
    setLastRun(run);
    setHistory((h) => [toRecord(run, time), ...h]);
    if (bad) setAlerts((a) => (a.some((x) => x.key === run.inspId) ? a : [toAlert(run, time), ...a]));
    setStats((s) => ({
      screened: s.screened + 1, anomalies: s.anomalies + (bad ? 1 : 0), suspicious: s.suspicious + (bad ? 1 : 0),
      xray: s.xray + (run.decision === "X-RAY" ? 1 : 0), conf: (s.conf * s.screened + run.confidence) / (s.screened + 1),
    }));
  }, [phase, run]);

  const begin = (k) => {
    seq.current += 1;
    setRun(generateRun(k, seq.current));
    setT(0); setPhase("running"); setNote(""); setView("live");
  };

  const rowFor = (id) => history.find((x) => x.inspId === id);
  const isEsc = (rn) => { const row = rowFor(rn.inspId); return !!row && row.status === "Escalated"; };

  const escalateInsp = (id, pkg) => {
    const row = rowFor(id);
    if (!row) { setNote(`${pkg} flagged for X-ray review.`); return; }
    if (row.status === "Escalated") { setNote(`${pkg} is already queued for X-ray.`); return; }
    setHistory((h) => h.map((x) => (x.inspId === id ? { ...x, xray: "Required", status: "Escalated" } : x)));
    setStats((s) => ({ ...s, xray: s.xray + 1 }));
    setNote(`${pkg} escalated to X-ray review.`);
  };

  const ctl = {
    key, t, phase,
    setKey: (k) => { setKey(k); begin(k); },
    start: () => begin(key),
    pause: () => setPhase((p) => (p === "running" ? "paused" : p === "paused" ? "running" : p)),
    reset: () => { setT(0); setPhase("idle"); },
    escalate: () => escalateInsp(run.inspId, run.id),
    escalateLast: () => escalateInsp(lastRun.inspId, lastRun.id),
    escalated: phase === "done" && isEsc(run),
    escLast: isEsc(lastRun),
  };

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.key));
  const onAlertAct = (act, a) => {
    if (act === "dismiss") { setDismissed((d) => [...d, a.key]); setNote(`${a.id} dismissed.`); }
    if (act === "escalate") escalateInsp(a.insp || a.key, a.id);
    if (act === "inspect") { setNote(`Inspection opened for ${a.id}.`); if (a.insp === run.inspId) setView("live"); }
  };

  const clock = now.toLocaleTimeString("en-GB");
  const status = phase === "running" ? `SCANNING · ${STAGES[Math.min(6, Math.floor(t / TICKS))].zone}` : phase === "paused" ? "PAUSED" : phase === "idle" ? "IDLE" : ctl.escalated ? "X-RAY ESCALATED" : `DECISION: ${run.decision}`;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">W</div><div><h1>WaveGuard 2.0</h1><small>Multi-sensor package screening</small></div></div>
        <nav>{NAV.map((n) => <NavigationItem key={n[0]} item={n} active={view === n[0]} onClick={() => setView(n[0])} />)}</nav>
        <div className="side-stats">
          <KV label="Line" value="Inspection Line A" />
          <KV label="Screened today" value={stats.screened.toLocaleString()} />
          <KV label="X-ray avoided" value={`${(100 - (stats.xray / stats.screened) * 100).toFixed(1)}%`} tone="green" />
          <KV label="Sensors online" value="4 / 4" tone="green" />
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="top-title"><h2>{NAV.find((n) => n[0] === view)[1]}</h2><span>Facility: Warehouse Inspection Line A</span></div>
          <div className="top-info">
            <div><small>System</small><StatusBadge value="ONLINE" /></div>
            <div><small>Inspection</small><strong className={phase === "done" ? run.tone : "cyan"}>{status}</strong></div>
            <div><small>Package · Run</small><strong>{run.id} · #{run.inspId}</strong></div>
            <div><small>Live time</small><strong className="mono">{clock}</strong></div>
          </div>
        </header>
        {view === "overview" && <Overview sc={lastRun} ctl={ctl} clock={clock} stats={stats} />}
        {view === "live" && <LiveInspection run={run} ctl={ctl} />}
        {view === "fusion" && <SensorFusion sc={lastRun} />}
        {view === "twin" && <DigitalTwin run={run} ctl={ctl} />}
        {view === "analytics" && <Analytics stats={stats} />}
        {view === "alerts" && <Alerts alerts={visibleAlerts} onAct={onAlertAct} note={note} />}
        {view === "history" && <History history={history} />}
      </main>
    </div>
  );
}
