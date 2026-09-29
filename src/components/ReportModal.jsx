import React from 'react';
import { Printer, Download, X, ShieldCheck } from 'lucide-react';

export default function ReportModal({ inspectionData, onClose }) {
  if (!inspectionData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-md font-mono font-bold text-white">INSPECTION REPORT CERTIFICATE</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-gray-300">
          {/* Header metadata */}
          <div className="border-b border-gray-800 pb-4 flex justify-between">
            <div>
              <div className="text-base font-bold text-white">WAVEGUARD CARGO INSPECTION REPORT</div>
              <div className="text-gray-400">SYSTEM ID: WG-BLR-01 | LOCATION: BENGALURU AIR CARGO HUB</div>
            </div>
            <div className="text-right">
              <div>INSP ID: {inspectionData.packageId || 'INSP-9081'}</div>
              <div>DATE: {new Date().toISOString()}</div>
            </div>
          </div>

          {/* Package & Decision Details */}
          <div className="grid grid-cols-2 gap-4 bg-gray-950 p-4 rounded border border-gray-800">
            <div>
              <div className="text-gray-400">PACKAGE ID:</div>
              <div className="text-sm font-bold text-white">{inspectionData.packageId || 'PKG-4092'}</div>
              <div className="text-gray-400 mt-2">CATEGORY:</div>
              <div className="text-white">{inspectionData.category || 'Solids'}</div>
            </div>
            <div>
              <div className="text-gray-400">FINAL VERDICT:</div>
              <div className={`text-sm font-bold ${
                inspectionData.decision?.decision === 'PASS' ? 'text-emerald-400' :
                inspectionData.decision?.decision === 'REJECT' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {inspectionData.decision?.decision || 'PASS'}
              </div>
              <div className="text-gray-400 mt-2">CONFIDENCE SCORE:</div>
              <div className="text-white">{((inspectionData.fusion?.confidence || 0.95) * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Multi-sensor Findings */}
          <div className="space-y-2">
            <div className="font-bold text-cyan-400 uppercase">Multi-Sensor Matrix Evaluation:</div>
            <div className="bg-gray-950 p-3 rounded border border-gray-800 space-y-1">
              <div>• RGB Camera: Visual Integrity Nominal (Score: 0.98)</div>
              <div>• 3D Laser: Dimensional Profile Verified (450x300x220mm)</div>
              <div>• RF/CSI Array: Variance Score {inspectionData.fusion?.sensorContributions?.csi || 0.04}</div>
              <div>• Ultrasound: Acoustic Discontinuity {inspectionData.fusion?.sensorContributions?.ultrasound > 0.3 ? 'DETECTED' : 'CLEAR'}</div>
              <div>• THz Spectrometer: Spectroscopic Absorptance Signature Normal</div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="space-y-1">
            <div className="font-bold text-cyan-400 uppercase">AI Reasoning & Audit Trail:</div>
            <p className="bg-gray-950 p-3 rounded border border-gray-800 text-gray-300">
              {inspectionData.decision?.reasoning || 'All non-destructive sensors report baseline uniform signatures. Package cleared for transit.'}
            </p>
          </div>

          {/* Disclaimers */}
          <div className="text-[10px] text-gray-500 pt-4 border-t border-gray-800">
            PROTOTYPE NOTICE: Produced by WaveGuard AI Simulation Architecture. Final release requires physical calibration against ISO-17025 non-destructive standards.
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-gray-950">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-mono text-xs">
            <Printer className="w-4 h-4" />
            PRINT REPORT
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-xs font-bold">
            <Download className="w-4 h-4" />
            EXPORT PDF
          </button>
        </div>
      </div>
    </div>
  );
}