import { BaseSensor } from './BaseSensor';

export class XRaySensor extends BaseSensor {
  constructor() {
    super('sensor-xray', 'Dual-Energy Transmission X-Ray Imaging Portal', 'ESCALATION');
  }

  getLiveData(scenario, timestamp = Date.now()) {
    return {
      sensorId: this.id,
      timestamp,
      effectiveAtomicNumber: 7.4, // Organic / Liquid indication
      densityGramCm3: 1.15,
      resolutionMicrons: 100,
      clearanceStatus: scenario === 'NORMAL' ? 'CLEARED' : 'THREAT_SUSPECTED'
    };
  }

  getFeatures(rawStream) {
    return {
      atomicNumber: rawStream.effectiveAtomicNumber,
      density: rawStream.densityGramCm3,
      confidence: 0.99
    };
  }
}