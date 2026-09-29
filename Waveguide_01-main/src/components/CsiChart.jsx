import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CsiChart({ subcarriers }) {
  const chartData = subcarriers || Array.from({ length: 64 }, (_, i) => ({
    index: i,
    amplitude: 20 + Math.sin(i / 4) * 8 + (Math.random() * 2),
    phase: Math.cos(i / 3) * Math.PI
  }));

  return (
    <div className="w-full h-64 bg-gray-950 p-4 rounded-lg border border-gray-800">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono text-cyan-400 font-bold">CSI SUBCARRIER AMPLITUDE RESPONSE (64 SUBCARRIERS)</span>
        <span className="text-[10px] font-mono text-gray-500">BAND: 5.8 GHz | FREQ SPACING: 312.5 kHz</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
          <XAxis dataKey="index" stroke="#6b7280" fontSize={10} />
          <YAxis stroke="#6b7280" fontSize={10} domain={[0, 45]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} 
            itemStyle={{ color: '#06b6d4' }}
          />
          <Line 
            type="monotone" 
            dataKey="amplitude" 
            stroke="#06b6d4" 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}