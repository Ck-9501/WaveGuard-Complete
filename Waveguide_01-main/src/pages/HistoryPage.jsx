import React from 'react';
import { MOCK_HISTORY } from '../data/mockData';

export default function HistoryPage() {
  return (
    <div className="p-6 space-y-6 font-mono text-xs">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">INSPECTION HISTORY LOGS</h2>
          <p className="text-xs text-gray-400">SEARCHABLE AUDIT TRAIL OF COMPLETED CARGO SCANS</p>
        </div>
      </div>

      <div className="panel-card bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-950 border-b border-gray-800 text-gray-400 uppercase text-[10px]">
            <tr>
              <th className="p-3">INSP ID</th>
              <th className="p-3">PKG ID</th>
              <th className="p-3">TIMESTAMP</th>
              <th className="p-3">CATEGORY</th>
              <th className="p-3">SENSORS USED</th>
              <th className="p-3">DECISION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-300">
            {MOCK_HISTORY.map((h) => (
              <tr key={h.id} className="hover:bg-gray-800/50">
                <td className="p-3 font-bold text-cyan-400">{h.id}</td>
                <td className="p-3">{h.packageId}</td>
                <td className="p-3 text-gray-500">{h.timestamp}</td>
                <td className="p-3">{h.category}</td>
                <td className="p-3">{h.sensorsUsed.join(', ')}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    h.decision === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    h.decision === 'REJECT' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {h.decision}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}