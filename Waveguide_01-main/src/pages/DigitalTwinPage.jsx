import React from 'react';
import DigitalTwin3D from '../components/DigitalTwin3D';

export default function DigitalTwinPage({ scenario }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">CARGO DIGITAL TWIN EXPLORER</h2>
          <p className="text-xs font-mono text-gray-400">3D VOLUMETRIC SPATIAL RECONSTRUCTION</p>
        </div>
      </div>

      <DigitalTwin3D scenario={scenario} />
    </div>
  );
}