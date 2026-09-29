import React from 'react';
import { 
  LayoutDashboard, 
  Scan, 
  Radio, 
  GitMerge, 
  Box, 
  BarChart3, 
  Bell, 
  FileText, 
  Settings,
  History
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, alertCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inspection', label: 'Live Inspection', icon: Scan },
    { id: 'csi', label: 'CSI Analytics', icon: Radio },
    { id: 'fusion', label: 'Sensor Fusion', icon: GitMerge },
    { id: 'twin', label: 'Digital Twin', icon: Box },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount },
    { id: 'history', label: 'History', icon: History },
    { id: 'config', label: 'Configuration', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col justify-between">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">
          System Control
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-900/80 text-red-300 border border-red-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-900">
        <div className="bg-gray-900/60 p-3 rounded border border-gray-800 text-xs font-mono space-y-1">
          <div className="text-gray-400">HARDWARE LAYER</div>
          <div className="text-emerald-400 flex items-center justify-between">
            <span>6 SENSORS</span>
            <span className="text-[10px] bg-emerald-950 border border-emerald-800 px-1 rounded">READY</span>
          </div>
          <div className="text-[10px] text-gray-500 pt-1">
            Adapters loaded via SIM-BUS
          </div>
        </div>
      </div>
    </aside>
  );
}