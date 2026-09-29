import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6 font-mono">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">ANALYTICS & THROUGHPUT REPORTING</h2>
          <p className="text-xs text-gray-400">INSPECTION VOLUME, DECISION DISTRIBUTIONS & SENSOR AGREEMENT TRENDS</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="panel-card bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-2">
          <div className="text-xs text-gray-400">30-DAY INSPECTION VOLUME</div>
          <div className="text-2xl font-bold text-white">42,890 Packages</div>
          <div className="text-xs text-emerald-400">+12.4% vs previous period</div>
        </div>
        <div className="panel-card bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-2">
          <div className="text-xs text-gray-400">X-RAY REDUCTION RATE</div>
          <div className="text-2xl font-bold text-cyan-400">84.2% Saved</div>
          <div className="text-xs text-cyan-300">Only 15.8% escalated to X-ray</div>
        </div>
        <div className="panel-card bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-2">
          <div className="text-xs text-gray-400">AVERAGE SCAN DURATION</div>
          <div className="text-2xl font-bold text-purple-400">1.8 Seconds</div>
          <div className="text-xs text-gray-400">Real-time inline screening</div>
        </div>
      </div>
    </div>
  );
}