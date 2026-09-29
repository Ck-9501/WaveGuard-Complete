import React from 'react';
import { Activity, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export default function Header({ currentScenario, setScenario }) {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wider text-white flex items-center gap-2">
            WAVEGUARD
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              v2.4 PROTOTYPE
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-mono">AI-POWERED MULTI-SENSOR INSPECTION SYSTEM</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-gray-900 px-3 py-1.5 rounded border border-gray-800">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>FUSION ENGINE: <strong className="text-emerald-400">ACTIVE</strong></span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-gray-900 px-3 py-1.5 rounded border border-gray-800">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <span>SIMULATION MODE: <strong className="text-cyan-400">ENABLED</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">SCENARIO:</span>
          <select 
            value={currentScenario}
            onChange={(e) => setScenario(e.target.value)}
            className="bg-gray-900 text-xs font-mono text-cyan-300 border border-cyan-800/60 rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
          >
            <option value="NORMAL">NORMAL PACKAGE (PASS)</option>
            <option value="STRUCTURAL_ANOMALY">STRUCTURAL ANOMALY (REJECT)</option>
            <option value="INTERNAL_DISPLACEMENT">INTERNAL DISPLACEMENT (VERIFY)</option>
            <option value="LIQUID_LEAK">LIQUID LEAKAGE (REJECT)</option>
            <option value="VOID_AIR_GAP">VOID / AIR GAP (VERIFY)</option>
            <option value="MIXED_CONTENT">MIXED PACKAGE (VERIFY/X-RAY)</option>
          </select>
        </div>
      </div>
    </header>
  );
}