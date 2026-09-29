export const MOCK_HISTORY = [
  {
    id: 'INSP-9081',
    packageId: 'PKG-10492',
    timestamp: '2026-09-29 19:42:10',
    category: 'Solids',
    destination: 'Berlin Cargo Hub',
    sensorsUsed: ['RGB', '3D', 'CSI', 'Ultrasound'],
    anomalyScore: 0.04,
    confidence: 0.98,
    risk: 'LOW',
    decision: 'PASS',
    verification: 'CLEARED'
  },
  {
    id: 'INSP-9082',
    packageId: 'PKG-10493',
    timestamp: '2026-09-29 19:45:33',
    category: 'Liquids',
    destination: 'Dubai Logistics Center',
    sensorsUsed: ['RGB', '3D', 'CSI', 'THz'],
    anomalyScore: 0.68,
    confidence: 0.92,
    risk: 'HIGH',
    decision: 'REJECT',
    verification: 'CONTAINED'
  },
  {
    id: 'INSP-9083',
    packageId: 'PKG-10494',
    timestamp: '2026-09-29 19:51:02',
    category: 'Mixed',
    destination: 'Singapore Air Terminal',
    sensorsUsed: ['RGB', '3D', 'CSI', 'Ultrasound', 'THz'],
    anomalyScore: 0.32,
    confidence: 0.76,
    risk: 'MEDIUM',
    decision: 'VERIFY',
    verification: 'ESCALATED_XRAY'
  }
];

export const MOCK_ALERTS = [
  {
    id: 'ALT-301',
    time: '2 mins ago',
    type: 'HIGH_RISK',
    title: 'Internal Displacement Detected',
    packageId: 'PKG-10493',
    message: 'RF/CSI and THz sensors registered a high variance deviation from baseline.'
  },
  {
    id: 'ALT-302',
    time: '14 mins ago',
    type: 'VERIFY_QUEUE',
    title: 'Sensor Disagreement Warning',
    packageId: 'PKG-10494',
    message: 'Camera exterior passed, but Ultrasound indicated deep boundary discontinuity.'
  },
  {
    id: 'ALT-303',
    time: '1 hour ago',
    type: 'SENSOR_WARN',
    title: 'Ultrasound Array Recalibration Suggested',
    packageId: 'SYS-MAIN',
    message: 'Transducer 4 attenuation baseline shifted by +2.1% over last 100 scans.'
  }
];