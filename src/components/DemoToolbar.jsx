import React from 'react';
import { Play, RotateCcw, Award } from 'lucide-react';

export default function DemoToolbar({ onRunJudicialDemo, onReset }) {
  return (
    <div className="bg-gradient-to-r from-cyan-950 via-gray-900 to-purple-950 border-b border-cyan-800/60 px-6 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-400" />
        <span className="text-xs font-mono font-bold text-amber-200 uppercase tracking-wider">
          SIH JUDGE DEMONSTRATION WORKFLOW
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onRunJudicialDemo('NORMAL')}
          className="px-3 py-1 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600 text-emerald-200 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          DEMO 1: NORMAL
        </button>

        <button
          onClick={() => onRunJudicialDemo('STRUCTURAL_ANOMALY')}
          className="px-3 py-1 bg-red-900/80 hover:bg-red-800 border border-red-600 text-red-200 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          DEMO 2: ANOMALY
        </button>

        <button
          onClick={() => onRunJudicialDemo('MIXED_CONTENT')}
          className="px-3 py-1 bg-amber-900/80 hover:bg-amber-800 border border-amber-600 text-amber-200 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          DEMO 3: X-RAY ESCALATION
        </button>

        <button
          onClick={onReset}
          className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700"
          title="Reset Simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}