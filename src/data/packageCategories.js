export const PACKAGE_CATEGORIES = [
  {
    id: 'solids',
    name: '1. Metal & Non-Metal Solids',
    description: 'Enclosures, machinery parts, tools, hard consumer electronics.',
    recommendedSensors: ['RGB Camera', '3D Laser', 'RF/CSI', 'Ultrasound'],
    suitabilityNote: 'High ultrasound penetration on uniform metals. RF/CSI suitable for non-metallic cavity checks.'
  },
  {
    id: 'liquids',
    name: '2. Liquids & Gels',
    description: 'Sealed chemical drums, beverages, aqueous solutions, oils.',
    recommendedSensors: ['RGB Camera', '3D Laser', 'RF/CSI', 'THz Spectrometer'],
    suitabilityNote: 'THz absorption is sensitive to aqueous signatures. RF signal phase shifts indicate volume changes.'
  },
  {
    id: 'food',
    name: '3. Perishables & Foodstuff',
    description: 'Organic goods, grain sacks, frozen produce, packaged meals.',
    recommendedSensors: ['RGB Camera', '3D Laser', 'RF/CSI', 'THz Spectrometer'],
    suitabilityNote: 'Non-ionizing screening protects food integrity while detecting voids and density anomalies.'
  },
  {
    id: 'mixed',
    name: '4. Mixed Products / Parcel Post',
    description: 'Heterogeneous postal packages containing varied materials.',
    recommendedSensors: ['Full Multi-Sensor Suite', 'X-Ray Escalation on Uncertainty'],
    suitabilityNote: 'Requires broader multi-sensor fusion. Lower confidence thresholds trigger automated X-Ray routing.'
  }
];