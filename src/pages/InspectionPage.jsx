import React from 'react';
import CsiChart from '../components/CsiChart';
import DigitalTwin3D from '../components/DigitalTwin3D';
import SensorSuitabilityTable from '../components/SensorSuitabilityTable';
import { FileText } from 'lucide-react';

export default function InspectionPage({ snapshot, fusionResult, decisionResult, scenario, onOpenReport }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">INSPECTION WORKSPACE</h2>
          <p className="text-xs font-mono text-gray-400">SEALED CARGO NON-DESTRUCTIVE MULTI-SENSOR SCREENING</p>
        </div>
        <button 
          onClick={onOpenReport}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-950"
        >
          <FileText className="w-4 h-4" />
          GENERATE INSPECTION REPORT
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Digital Twin & CSI Deep Dive */}
        <div className="col-span-2 space-y-6">
          <DigitalTwin3D scenario={scenario} />
          <CsiChart subcarriers={snapshot.telemetry?.csi?.subcarriers} />
        </div>

        {/* Right Column: AI Sensor Fusion Results */}
        <div className="panel-card bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-5 font-mono">
          <h3 className="text-sm font-bold text-gray-200 uppercase border-b border-gray-800 pb-3">
            AI DECISION ENGINE
          </h3>

          <div className="p-4 bg-gray-950 rounded border border-gray-800 text-center space-y-1">
            <div className="text-xs text-gray-400">FINAL VERDICT</div>
            <div className={`text-2xl font-bold ${
              decisionResult.decision === 'PASS' ? 'text-emerald-400' :
              decisionResult.decision === 'REJECT' ? 'text-red-400' : 'text-amber-400'
            }`}>
              {decisionResult.decision}
            </div>
            <div className="text-[10px] text-gray-500">
              CONFIDENCE: {((fusionResult.confidence || 0.9) * 100).toFixed(0)}%
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-gray-400">AI EXPLANATION:</div>
            <p className="p-3 bg-gray-950 rounded border border-gray-800 text-gray-300 leading-relaxed">
              {decisionResult.reasoning}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-gray-400">SUPPORTING SENSORS:</div>
            <div className="flex flex-wrap gap-1">
              {fusionResult.supportingSensors?.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-800 text-[10px] text-gray-500">
            Prototype AI / Simulation Model. Suitability depends on material calibration parameters.
          </div>
        </div>
      </div>

      <SensorSuitabilityTable />
    </div>
  );
}