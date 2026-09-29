import React from 'react';
import CsiChart from '../components/CsiChart';

export default function SensorCsiPage({ snapshot }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">RF / CSI SUBCARRIER DEEP DIVE</h2>
          <p className="text-xs font-mono text-gray-400">5.8 GHz WI-FI CHANNEL STATE INFORMATION ANALYTICS</p>
        </div>
      </div>

      <CsiChart subcarriers={snapshot.telemetry?.csi?.subcarriers} />

      <div className="grid grid-cols-3 gap-4 font-mono text-xs">
        <div className="panel-card bg-gray-900 border border-gray-800 p-4 rounded-lg space-y-1">
          <div className="text-gray-400">MEAN AMPLITUDE</div>
          <div className="text-lg font-bold text-cyan-400">{snapshot.telemetry?.csi?.meanAmplitude || 22.4} dB</div>
        </div>
        <div className="panel-card bg-gray-900 border border-gray-800 p-4 rounded-lg space-y-1">
          <div className="text-gray-400">SIGNAL ENERGY</div>
          <div className="text-lg font-bold text-emerald-400">{snapshot.telemetry?.csi?.signalEnergy || 480.2} J</div>
        </div>
        <div className="panel-card bg-gray-900 border border-gray-800 p-4 rounded-lg space-y-1">
          <div className="text-gray-400">SIGNAL-TO-NOISE RATIO (SNR)</div>
          <div className="text-lg font-bold text-purple-400">{snapshot.telemetry?.csi?.snrDb || 28.4} dB</div>
        </div>
      </div>
    </div>
  );
}