import React from 'react';

export default function ConfigurationPage() {
  return (
    <div className="p-6 space-y-6 font-mono text-xs">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">SYSTEM CONFIGURATION & THRESHOLDS</h2>
          <p className="text-xs text-gray-400">ADJUST SENSOR CALIBRATION, BASELINE SENSITIVITY, AND RISK THRESHOLDS</p>
        </div>
      </div>

      <div className="panel-card bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-4">
        <h3 className="text-sm font-bold text-cyan-400 uppercase">Decision Rules</h3>
        <div className="space-y-3 max-w-md">
          <div>
            <label className="text-gray-400">Rejection Anomaly Threshold (0.0 - 1.0)</label>
            <input type="number" defaultValue={0.45} step={0.05} className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white mt-1" />
          </div>
          <div>
            <label className="text-gray-400">X-Ray Verification Escalation Threshold</label>
            <input type="number" defaultValue={0.20} step={0.05} className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white mt-1" />
          </div>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded font-bold">SAVE CONFIGURATION</button>
        </div>
      </div>
    </div>
  );
}