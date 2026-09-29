import React from 'react';
import { Package, AlertOctagon, CheckCircle, HelpCircle, Activity, TrendingUp } from 'lucide-react';
import MachineTunnel from '../components/MachineTunnel';

export default function DashboardPage({ snapshot, fusionResult, decisionResult, inspectionStage }) {
  const stats = [
    { label: 'Scanned Today', val: '1,428', icon: Package, color: 'text-cyan-400' },
    { label: 'Cleared (Pass)', val: '1,280', icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Anomalies (Reject)', val: '64', icon: AlertOctagon, color: 'text-red-400' },
    { label: 'Verify Queue (X-Ray)', val: '84', icon: HelpCircle, color: 'text-amber-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="panel-card bg-gray-900 border border-gray-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-gray-400 uppercase">{s.label}</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{s.val}</div>
              </div>
              <div className={`p-3 rounded-lg bg-gray-950 border border-gray-800 ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Inspection Machine Conveyor */}
      <MachineTunnel inspectionStage={inspectionStage} decisionResult={decisionResult} />

      {/* Two Column Layout: Current Live Inspection & Sensor Health */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 panel-card bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 className="text-sm font-mono font-bold text-gray-200 uppercase">
              ACTIVE INSPECTION REAL-TIME TELEMETRY
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              PKG ID: {snapshot.packageId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-gray-950 p-3 rounded border border-gray-800 space-y-2">
              <div className="text-gray-400">CATEGORY CLASSIFICATION</div>
              <div className="text-white font-bold">{snapshot.category}</div>
              <div className="text-gray-400 mt-2">SUITABLE SENSORS</div>
              <div className="text-cyan-300">RGB, 3D LiDAR, RF/CSI, Ultrasound, THz</div>
            </div>

            <div className="bg-gray-950 p-3 rounded border border-gray-800 space-y-2">
              <div className="text-gray-400">AI FUSED ANOMALY SCORE</div>
              <div className="text-lg font-bold text-cyan-400">
                {(fusionResult.fusedAnomalyScore * 100).toFixed(1)}%
              </div>
              <div className="text-gray-400">AGREEMENT METRIC</div>
              <div className="text-emerald-400">{fusionResult.sensorAgreement}</div>
            </div>
          </div>
        </div>

        <div className="panel-card bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-4">
          <h3 className="text-sm font-mono font-bold text-gray-200 uppercase border-b border-gray-800 pb-3">
            SENSOR ARRAY HEALTH
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {[
              { name: 'RGB Camera', status: 'ONLINE', health: '99%' },
              { name: '3D LiDAR', status: 'ONLINE', health: '100%' },
              { name: 'RF/CSI Array', status: 'ONLINE', health: '97%' },
              { name: 'Ultrasound Array', status: 'ONLINE', health: '98%' },
              { name: 'THz Spectrometer', status: 'ONLINE', health: '95%' },
              { name: 'X-Ray Portal', status: 'STANDBY', health: '100%' },
            ].map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-950 rounded border border-gray-800">
                <span className="text-gray-300">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">{s.health}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 rounded">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}