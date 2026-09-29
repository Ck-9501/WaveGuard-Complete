import React from 'react';
import { Box, Eye, Layers } from 'lucide-react';

export default function DigitalTwin3D({ scenario }) {
  const hasAnomaly = scenario.id !== 'NORMAL';

  return (
    <div className="panel-card bg-gray-950 border border-gray-800 p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold text-gray-200">CARGO DIGITAL TWIN (PROTOTYPE VISUALIZATION)</h3>
        </div>
        <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800">
          SYNTHETIC SPATIAL RENDERING
        </span>
      </div>

      {/* Simulated 3D Cargo Canvas */}
      <div className="relative h-64 bg-gray-900/60 rounded-lg border border-gray-800 flex items-center justify-center overflow-hidden">
        {/* Isometric Box Wireframe */}
        <div className="relative w-48 h-36 border-2 border-cyan-500/60 rounded bg-cyan-950/20 flex flex-col justify-between p-3 transform -rotate-6 rotate-y-12 shadow-2xl">
          <div className="flex justify-between text-[10px] font-mono text-cyan-400">
            <span>DIM: 450x300x220mm</span>
            <span>VOL: 29.7L</span>
          </div>

          {/* Hidden Internal Anomaly Hotspot */}
          {hasAnomaly ? (
            <div className="self-center p-3 rounded-full bg-red-900/60 border border-red-500 animate-ping flex items-center justify-center">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
            </div>
          ) : (
            <div className="self-center text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
              UNIFORM STRUCTURAL DENSITY
            </div>
          )}

          <div className="flex justify-between text-[10px] font-mono text-gray-400">
            <span>MAT: CARDBOARD/FOAM</span>
            <span>ZONE: B2-LOWER</span>
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 right-3 bg-gray-950/90 p-2 rounded border border-gray-800 text-[10px] font-mono space-y-1">
          <div className="flex items-center gap-1 text-cyan-400">
            <Layers className="w-3 h-3" />
            <span>LAYER: INTERNAL DEPTH SLICE (80mm)</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Eye className="w-3 h-3" />
            <span>FOV: MULTI-ANGLE RF/ACOUSTIC</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 font-mono bg-gray-900 p-3 rounded border border-gray-800">
        <strong className="text-gray-200">FINDING SUMMARY:</strong> {hasAnomaly 
          ? `Internal anomaly detected at lower-right volumetric region. RF attenuation delta +4.8dB, acoustic reflection void at 84mm depth.`
          : `No internal material voids, structural cracks, or liquid interfaces detected.`}
      </div>
    </div>
  );
}