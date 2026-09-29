import React from 'react';
import { MOCK_ALERTS } from '../data/mockData';
import { Bell, AlertTriangle } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="p-6 space-y-6 font-mono">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">SYSTEM ALERTS & NOTIFICATIONS</h2>
          <p className="text-xs text-gray-400">REAL-TIME RISK TRIGGERS AND SENSOR WARNING LOGS</p>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_ALERTS.map((a) => (
          <div key={a.id} className="p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-950 border border-red-800 text-red-400 rounded">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{a.title} ({a.packageId})</div>
                <div className="text-xs text-gray-400">{a.message}</div>
              </div>
            </div>
            <span className="text-xs text-gray-500">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}