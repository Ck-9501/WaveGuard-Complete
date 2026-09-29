import React from 'react';
import { PACKAGE_CATEGORIES } from '../data/packageCategories';

export default function SensorSuitabilityTable() {
  return (
    <div className="panel-card bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-4 font-mono text-xs">
      <h3 className="text-sm font-bold text-gray-200 uppercase">
        PACKAGE CATEGORY & SENSOR SUITABILITY GUIDE
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {PACKAGE_CATEGORIES.map((cat) => (
          <div key={cat.id} className="p-3 bg-gray-950 rounded border border-gray-800 space-y-2">
            <div className="text-sm font-bold text-cyan-400">{cat.name}</div>
            <div className="text-gray-400 text-[11px]">{cat.description}</div>
            <div className="text-emerald-400 text-[10px]">
              RECOMMENDED: {cat.recommendedSensors.join(', ')}
            </div>
            <div className="text-gray-500 text-[10px] italic border-t border-gray-900 pt-1">
              "{cat.suitabilityNote}"
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 bg-gray-950/80 border border-gray-800 rounded text-[10px] text-gray-400 text-center">
        * Sensor suitability depends on package material, thickness, geometry and calibration.
      </div>
    </div>
  );
}