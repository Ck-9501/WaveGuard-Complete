import React from 'react';
import { Camera, Laser, Radio, Waves, Sun, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function MachineTunnel({ inspectionStage, decisionResult }) {
  const stages = [
    { id: 'IDENTIFY', name: 'Identification', icon: Camera, color: 'text-blue-400' },
    { id: 'EXT_SCAN', name: 'RGB + 3D Laser', icon: Laser, color: 'text-cyan-400' },
    { id: 'INT_SCAN', name: 'RF / Ultrasonic / THz', icon: Radio, color: 'text-purple-400' },
    { id: 'FUSION', name: 'AI Fusion Matrix', icon: Waves, color: 'text-amber-400' },
    { id: 'DECISION', name: 'Decision Zone', icon: Sun, color: 'text-emerald-400' }
  ];

  const getStageIndex = (stage) => stages.findIndex(s => s.id === stage);
  const currentIndex = getStageIndex(inspectionStage);

  return (
    <div className="panel-card bg-gray-900/80 border border-gray-800 p-6 rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider font-mono">
          CONVEYOR SCANNING TUNNEL (LIVE MACHINE VISUALIZATION)
        </h3>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded border border-cyan-800">
          TUNNEL SPEED: 0.8 m/s
        </span>
      </div>

      {/* Machine Visual */}
      <div className="relative bg-gray-950 border border-gray-800 rounded-lg p-8 overflow-hidden">
        {/* Conveyor Belt Line */}
        <div className="absolute bottom-6 left-0 right-0 h-3 bg-gray-800 border-y border-gray-700 flex">
          <div className="w-full h-full bg-stripes animate-pulse opacity-30" />
        </div>

        {/* Scan Zones */}
        <div className="grid grid-cols-5 gap-4 relative z-10">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === currentIndex;
            const isPassed = idx < currentIndex;

            return (
              <div 
                key={stage.id}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  isActive 
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-lg shadow-cyan-950' 
                    : isPassed 
                    ? 'bg-gray-900/40 border-gray-800 opacity-60' 
                    : 'bg-gray-900/20 border-gray-900 opacity-40'
                }`}
              >
                <div className={`p-3 rounded-full mb-2 ${isActive ? 'bg-cyan-900 text-cyan-300 ring-2 ring-cyan-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-gray-300 text-center">{stage.name}</span>
                <span className="text-[10px] font-mono text-gray-500 mt-1">
                  {isActive ? 'SCANNING...' : isPassed ? 'COMPLETE' : 'WAITING'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Sealed Package Object on Belt */}
        <div 
          className="absolute bottom-9 transition-all duration-700 ease-in-out flex flex-col items-center"
          style={{ left: `${10 + (currentIndex * 18)}%` }}
        >
          <div className="w-16 h-12 bg-amber-800/80 border-2 border-amber-600 rounded flex items-center justify-center text-[10px] font-mono font-bold text-amber-200 shadow-md">
            PKG-4092
          </div>
          <div className="w-12 h-1 bg-black/60 blur-xs rounded-full mt-1" />
        </div>
      </div>

      {/* Decision Lane Banner */}
      {inspectionStage === 'DECISION' && decisionResult && (
        <div className={`p-4 rounded-lg border flex items-center justify-between font-mono ${
          decisionResult.decision === 'PASS' 
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
            : decisionResult.decision === 'REJECT'
            ? 'bg-red-950/60 border-red-800 text-red-300'
            : 'bg-amber-950/60 border-amber-800 text-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            {decisionResult.decision === 'PASS' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            {decisionResult.decision === 'REJECT' && <ShieldAlert className="w-6 h-6 text-red-400" />}
            {decisionResult.decision === 'VERIFY' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
            <div>
              <div className="text-sm font-bold">DECISION ROUTE: {decisionResult.decision} ROUTE</div>
              <div className="text-xs opacity-80">{decisionResult.reasoning}</div>
            </div>
          </div>
          {decisionResult.requiresXRay && (
            <span className="px-3 py-1 bg-amber-900 border border-amber-600 rounded text-xs text-amber-200 font-bold animate-pulse">
              ROUTED TO X-RAY ESCALATION PORTAL
            </span>
          )}
        </div>
      )}
    </div>
  );
}