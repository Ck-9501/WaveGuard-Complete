import React from 'react';
import { GitMerge, ArrowRight } from 'lucide-react';

export default function SensorFusionPage({ fusionResult }) {
  const nodes = [
    { name: 'RGB Camera', score: fusionResult.sensorContributions?.camera || 0.05, weight: '15%' },
    { name: '3D LiDAR', score: fusionResult.sensorContributions?.depth || 0.03, weight: '15%' },
    { name: 'RF/CSI Array', score: fusionResult.sensorContributions?.csi || 0.04, weight: '30%' },
    { name: 'Ultrasound', score: fusionResult.sensorContributions?.ultrasound || 0.08, weight: '20%' },
    { name: 'THz Spectrometer', score: fusionResult.sensorContributions?.thz || 0.05, weight: '20%' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">SENSOR FUSION ARCHITECTURE</h2>
          <p className="text-xs font-mono text-gray-400">MULTI-MODAL FEATURE EXTRACTION & WEIGHTED MATRIX</p>
        </div>
      </div>

      <div className="panel-card bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-6">
        <div className="flex items-center justify-between">
          {/* Sensor Input Nodes */}
          <div className="space-y-3 w-64">
            <div className="text-xs font-mono text-gray-400 uppercase">Input Sensor Nodes</div>
            {nodes.map((n, i) => (
              <div key={i} className="p-3 bg-gray-950 rounded border border-gray-800 flex justify-between items-center font-mono text-xs">
                <div>
                  <div className="text-white font-bold">{n.name}</div>
                  <div className="text-[10px] text-gray-500">Weight: {n.weight}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] ${n.score > 0.3 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                  {(n.score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          <ArrowRight className="w-8 h-8 text-cyan-500 animate-pulse" />

          {/* Feature Extraction & Fusion Engine Node */}
          <div className="p-6 bg-cyan-950/40 border border-cyan-800 rounded-lg text-center space-y-3 w-64 font-mono">
            <GitMerge className="w-8 h-8 text-cyan-400 mx-auto" />
            <div className="text-sm font-bold text-cyan-200">AI FUSION MATRIX</div>
            <div className="text-xs text-gray-300">Normalized Weighted Scoring & Agreement Evaluator</div>
            <div className="text-[10px] text-cyan-400 border border-cyan-800 bg-cyan-950 p-2 rounded">
              AGREEMENT: {fusionResult.sensorAgreement}
            </div>
          </div>

          <ArrowRight className="w-8 h-8 text-cyan-500 animate-pulse" />

          {/* Decision Node */}
          <div className="p-6 bg-gray-950 border border-gray-800 rounded-lg text-center space-y-3 w-64 font-mono">
            <div className="text-xs text-gray-400">FUSED ANOMALY RESULT</div>
            <div className="text-2xl font-bold text-white">
              {(fusionResult.fusedAnomalyScore * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-emerald-400">CONFIDENCE: {((fusionResult.confidence || 0.9) * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}