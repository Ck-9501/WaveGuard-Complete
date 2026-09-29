import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const scenarios = {
  NORMAL: {
    label: "NORMAL PACKAGE",
    status: "CLEAR",
    score: 96,
    color: "green",
    category: "Consumer Goods",
    issue: "No anomaly detected",
    liquid: "0.8%",
    metal: "Low",
    structural: "Stable",
  },
  LIQUID: {
    label: "LIQUID ANOMALY",
    status: "REVIEW",
    score: 74,
    color: "amber",
    category: "Liquid Product",
    issue: "Possible internal liquid leakage",
    liquid: "82%",
    metal: "Low",
    structural: "Abnormal",
  },
  METAL: {
    label: "METAL OBJECT",
    status: "REVIEW",
    score: 68,
    color: "amber",
    category: "Mixed Materials",
    issue: "Dense metallic object detected",
    liquid: "1.2%",
    metal: "91%",
    structural: "Stable",
  },
  DAMAGE: {
    label: "INTERNAL DAMAGE",
    status: "ESCALATE",
    score: 42,
    color: "red",
    category: "Fragile Goods",
    issue: "Internal structural anomaly detected",
    liquid: "12%",
    metal: "Low",
    structural: "High anomaly",
  },
};

const navItems = [
  ["dashboard", "Overview"],
  ["inspection", "Live Inspection"],
  ["sensors", "Sensor Fusion"],
  ["twin", "Digital Twin"],
  ["analytics", "Analytics"],
  ["alerts", "Alerts"],
  ["history", "Inspection History"],
];

function App() {
  const [active, setActive] = useState("dashboard");
  const [scenario, setScenario] = useState("NORMAL");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [packageId, setPackageId] = useState("WG-4092");

  const data = scenarios[scenario];

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setStage((s) => {
        if (s >= 4) {
          setRunning(false);
          return 4;
        }
        return s + 1;
      });
    }, 850);

    return () => clearInterval(timer);
  }, [running]);

  const startInspection = () => {
    setStage(0);
    setRunning(true);
    setActive("inspection");
    setPackageId(`WG-${Math.floor(4000 + Math.random() * 999)}`);
  };

  const reset = () => {
    setRunning(false);
    setStage(0);
    setScenario("NORMAL");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <h1>WAVEGUARD</h1>
            <span>INTELLIGENT PACKAGE INSPECTION</span>
          </div>
        </div>

        <div className="system-state">
          <span className="pulse"></span>
          SYSTEM ONLINE
        </div>

        <select
          value={scenario}
          onChange={(e) => {
            setScenario(e.target.value);
            setStage(0);
          }}
        >
          <option value="NORMAL">Normal Package</option>
          <option value="LIQUID">Liquid Anomaly</option>
          <option value="METAL">Metal Object</option>
          <option value="DAMAGE">Internal Damage</option>
        </select>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="side-title">COMMAND CENTER</div>

          {navItems.map(([id, label]) => (
            <button
              key={id}
              className={`nav-btn ${active === id ? "active" : ""}`}
              onClick={() => setActive(id)}
            >
              <span className="nav-dot"></span>
              {label}
            </button>
          ))}

          <div className="sidebar-bottom">
            <div className="mini-status">
              <span>Inspection Line</span>
              <strong>LINE 04</strong>
            </div>

            <div className="mini-status">
              <span>Packages Today</span>
              <strong>1,284</strong>
            </div>

            <div className="mini-status">
              <span>System Accuracy</span>
              <strong>97.8%</strong>
            </div>
          </div>
        </aside>

        <main className="content">
          {active === "dashboard" && (
            <Dashboard
              data={data}
              scenario={scenario}
              onStart={startInspection}
              onReset={reset}
            />
          )}

          {active === "inspection" && (
            <Inspection
              data={data}
              scenario={scenario}
              stage={stage}
              running={running}
              onStart={startInspection}
            />
          )}

          {active === "sensors" && <Sensors data={data} />}

          {active === "twin" && <DigitalTwin data={data} />}

          {active === "analytics" && <Analytics />}

          {active === "alerts" && <Alerts />}

          {active === "history" && <History />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */

function Dashboard({ data, scenario, onStart, onReset }) {
  return (
    <section>
      <PageHeader
        eyebrow="WAVEGUARD COMMAND CENTER"
        title="Package Intelligence"
        subtitle="Non-invasive multi-sensor screening for modern logistics."
      />

      <div className="hero-grid">
        <div className="hero-card">
          <div className="hero-label">CURRENT PACKAGE</div>

          <div className="package-visual">
            <div className="package-box">
              <div className="scan-line"></div>
              <div className="box-label">WG</div>
            </div>

            <div className="signal-ring ring-one"></div>
            <div className="signal-ring ring-two"></div>
            <div className="signal-ring ring-three"></div>
          </div>

          <div className="package-number">WG-4092</div>

          <div className={`decision ${data.color}`}>
            <span></span>
            {data.status}
          </div>

          <p className="issue">{data.issue}</p>

          <div className="action-row">
            <button className="primary-btn" onClick={onStart}>
              START INSPECTION
            </button>
            <button className="secondary-btn" onClick={onReset}>
              RESET
            </button>
          </div>
        </div>

        <div className="score-card">
          <div className="card-top">
            <span>WAVEGUARD CONFIDENCE</span>
            <span className="live-tag">LIVE</span>
          </div>

          <div className="score">
            {data.score}
            <small>%</small>
          </div>

          <div className="meter">
            <div style={{ width: `${data.score}%` }}></div>
          </div>

          <div className="score-grid">
            <Metric label="Category" value={data.category} />
            <Metric label="Liquid" value={data.liquid} />
            <Metric label="Metal" value={data.metal} />
            <Metric label="Structure" value={data.structural} />
          </div>
        </div>
      </div>

      <div className="section-title">MULTI-SENSOR PIPELINE</div>

      <div className="sensor-grid">
        <SensorCard
          name="CSI"
          description="RF signal variation"
          value="98.2%"
          state="ACTIVE"
        />
        <SensorCard
          name="VISION"
          description="External visual analysis"
          value="99.1%"
          state="ACTIVE"
        />
        <SensorCard
          name="THz"
          description="Non-metallic material scan"
          value="94.7%"
          state="ACTIVE"
        />
        <SensorCard
          name="LIQUID"
          description="Water-rich anomaly detection"
          value="92.4%"
          state="ACTIVE"
        />
      </div>

      <div className="workflow">
        <WorkflowStep number="01" title="IDENTIFY" active />
        <WorkflowStep number="02" title="EXTERNAL SCAN" active />
        <WorkflowStep number="03" title="INTERNAL SCAN" active />
        <WorkflowStep number="04" title="SENSOR FUSION" active />
        <WorkflowStep number="05" title="DECISION" active />
        <WorkflowStep number="06" title="X-RAY ESCALATION" />
      </div>
    </section>
  );
}

/* ---------------- INSPECTION ---------------- */

function Inspection({ data, stage, running, onStart }) {
  const stages = [
    "Package Identification",
    "External Vision Scan",
    "Internal Sensor Scan",
    "Multi-Sensor Fusion",
    "Final Decision",
  ];

  return (
    <section>
      <PageHeader
        eyebrow="LIVE INSPECTION"
        title="Inspection Pipeline"
        subtitle="Real-time package screening and anomaly detection."
      />

      <div className="inspection-layout">
        <div className="inspection-main">
          <div className="scanner">
            <div className="scanner-top">
              <span>SCANNER / LINE 04</span>
              <span className="green-text">● ONLINE</span>
            </div>

            <div className="scanner-stage">
              <div className="conveyor"></div>

              <div className="scan-package">
                <div className="scan-beam"></div>
                <span>WG-4092</span>
              </div>

              <div className="scan-grid"></div>
            </div>

            <div className="scanner-footer">
              <span>VELOCITY 1.2 m/s</span>
              <span>SCAN DEPTH: INTERNAL</span>
              <span>RF: 5.8 GHz</span>
            </div>
          </div>

          <div className="pipeline">
            {stages.map((name, i) => (
              <div
                className={`pipeline-step ${
                  i <= stage ? "complete" : ""
                } ${i === stage && running ? "current" : ""}`}
                key={name}
              >
                <div className="step-number">{i + 1}</div>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="decision-panel">
          <div className="panel-label">AI DECISION ENGINE</div>

          <div className={`big-decision ${dataColor(data.status)}`}>
            {stage >= 4 ? data.status : "SCANNING"}
          </div>

          <div className="confidence">
            <span>Confidence</span>
            <strong>{stage >= 4 ? data.score : "--"}%</strong>
          </div>

          <div className="divider"></div>

          <Metric label="Package" value="WG-4092" />
          <Metric label="Category" value={data.category} />
          <Metric label="Anomaly" value={data.issue} />

          <button className="primary-btn full" onClick={onStart}>
            RUN NEW INSPECTION
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SENSORS ---------------- */

function Sensors({ data }) {
  const sensors = [
    {
      name: "Wi-Fi CSI",
      code: "CSI-01",
      value: "98.2%",
      description:
        "Detects changes in RF signal amplitude and phase caused by hidden objects or structural changes.",
    },
    {
      name: "Computer Vision",
      code: "CAM-01",
      value: "99.1%",
      description:
        "Checks package exterior, labels, deformation, damage and visible anomalies.",
    },
    {
      name: "THz Inspection",
      code: "THZ-01",
      value: "94.7%",
      description:
        "Supports inspection of non-metallic materials and internal package composition.",
    },
    {
      name: "Liquid Detection",
      code: "LQD-01",
      value: "92.4%",
      description:
        "Identifies signal patterns associated with water-rich or liquid anomalies.",
    },
  ];

  return (
    <section>
      <PageHeader
        eyebrow="SENSOR FUSION"
        title="Multi-Sensor Intelligence"
        subtitle="Multiple sensing modalities work together instead of relying on a single sensor."
      />

      <div className="sensor-detail-grid">
        {sensors.map((sensor) => (
          <div className="sensor-detail" key={sensor.name}>
            <div className="sensor-icon">
              <span></span>
            </div>

            <div className="sensor-code">{sensor.code}</div>
            <h3>{sensor.name}</h3>
            <p>{sensor.description}</p>

            <div className="sensor-reading">
              <span>Confidence</span>
              <strong>{sensor.value}</strong>
            </div>

            <div className="meter small">
              <div style={{ width: sensor.value }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="fusion-box">
        <div>
          <span className="card-top-label">FUSION ENGINE</span>
          <h2>Cross-sensor agreement</h2>
          <p>
            CSI + Vision + THz + Liquid sensing are combined before the
            decision engine makes an inspection decision.
          </p>
        </div>

        <div className="fusion-score">
          <strong>{data.score}%</strong>
          <span>Current confidence</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- DIGITAL TWIN ---------------- */

function DigitalTwin({ data }) {
  return (
    <section>
      <PageHeader
        eyebrow="DIGITAL TWIN"
        title="Virtual Inspection Line"
        subtitle="A live representation of the warehouse screening process."
      />

      <div className="twin">
        <div className="twin-line"></div>

        <div className="twin-node">
          <strong>01</strong>
          Package Entry
        </div>

        <div className="twin-node">
          <strong>02</strong>
          Vision
        </div>

        <div className="twin-node active-node">
          <strong>03</strong>
          WaveGuard
        </div>

        <div className="twin-node">
          <strong>04</strong>
          AI Fusion
        </div>

        <div className="twin-node">
          <strong>05</strong>
          Decision
        </div>

        <div className="twin-node escalation">
          <strong>06</strong>
          X-Ray Escalation
        </div>
      </div>

      <div className="twin-info">
        <Metric label="Current Package" value="WG-4092" />
        <Metric label="Scenario" value={data.label} />
        <Metric label="Decision" value={data.status} />
        <Metric label="Confidence" value={`${data.score}%`} />
      </div>
    </section>
  );
}

/* ---------------- ANALYTICS ---------------- */

function Analytics() {
  const bars = [42, 58, 48, 72, 61, 84, 69, 91, 77, 88, 73, 95];

  return (
    <section>
      <PageHeader
        eyebrow="ANALYTICS"
        title="Inspection Intelligence"
        subtitle="Operational performance across the warehouse line."
      />

      <div className="analytics-grid">
        <Stat title="Packages Screened" value="1,284" change="+18.4%" />
        <Stat title="Anomalies Found" value="37" change="+6.2%" />
        <Stat title="False Escalations" value="2.1%" change="-1.4%" />
        <Stat title="Average Scan" value="1.8s" change="-0.3s" />
      </div>

      <div className="chart-card">
        <div className="card-top">
          <span>INSPECTION VOLUME</span>
          <span>LAST 12 HOURS</span>
        </div>

        <div className="bars">
          {bars.map((height, i) => (
            <div className="bar-wrap" key={i}>
              <div className="bar" style={{ height: `${height}%` }}></div>
              <span>{i + 1}h</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ALERTS ---------------- */

function Alerts() {
  const alerts = [
    ["HIGH", "Internal structural anomaly", "WG-4092", "2 min ago"],
    ["MEDIUM", "Possible liquid signature", "WG-4088", "8 min ago"],
    ["LOW", "Unusual RF attenuation", "WG-4071", "21 min ago"],
  ];

  return (
    <section>
      <PageHeader
        eyebrow="ALERT CENTER"
        title="Inspection Alerts"
        subtitle="Events requiring operator attention."
      />

      <div className="alerts">
        {alerts.map(([level, message, id, time]) => (
          <div className="alert" key={id}>
            <div className={`alert-level ${level.toLowerCase()}`}>
              {level}
            </div>
            <div className="alert-message">
              <strong>{message}</strong>
              <span>
                Package {id} · {time}
              </span>
            </div>
            <button className="view-btn">VIEW</button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- HISTORY ---------------- */

function History() {
  const rows = [
    ["WG-4092", "Fragile Goods", "Internal Damage", "ESCALATE"],
    ["WG-4088", "Liquid Product", "Liquid Signature", "REVIEW"],
    ["WG-4083", "Consumer Goods", "None", "CLEAR"],
    ["WG-4079", "Mixed Materials", "Metal Object", "REVIEW"],
    ["WG-4071", "Consumer Goods", "None", "CLEAR"],
  ];

  return (
    <section>
      <PageHeader
        eyebrow="INSPECTION HISTORY"
        title="Package Records"
        subtitle="Historical inspection decisions and detected anomalies."
      />

      <div className="table-card">
        <div className="table-head">
          <span>PACKAGE</span>
          <span>CATEGORY</span>
          <span>DETECTION</span>
          <span>DECISION</span>
        </div>

        {rows.map((row) => (
          <div className="table-row" key={row[0]}>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
            <span className={`table-status ${dataColor(row[3])}`}>
              {row[3]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- COMPONENTS ---------------- */

function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="page-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SensorCard({ name, description, value, state }) {
  return (
    <div className="sensor-card">
      <div className="sensor-status">
        <span></span>
        {state}
      </div>

      <h3>{name}</h3>
      <p>{description}</p>

      <strong>{value}</strong>

      <div className="meter small">
        <div style={{ width: value }}></div>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, active }) {
  return (
    <div className={`workflow-step ${active ? "active" : ""}`}>
      <span>{number}</span>
      <strong>{title}</strong>
    </div>
  );
}

function Stat({ title, value, change }) {
  return (
    <div className="stat">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{change}</small>
    </div>
  );
}

function dataColor(status) {
  if (status === "CLEAR" || status === "ACTIVE") return "green";
  if (status === "REVIEW" || status === "MEDIUM") return "amber";
  if (status === "ESCALATE" || status === "HIGH") return "red";
  return "green";
}

export default App;
