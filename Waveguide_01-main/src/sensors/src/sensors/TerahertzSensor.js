import { BaseSensor } from './BaseSensor';

export class TerahertzSensor extends BaseSensor {
  constructor() {
    super('sensor-thz', 'Terahertz (THz) Time-Domain Spectrometer', 'INTERNAL');
  }

  getLiveData(scenario, timestamp = Date.now()) {
    const isLiquid = scenario === 'LIQUID_LEAK' || scenario === 'MIXED_CONTENT';
    return {
      sensorId: this.id,
      timestamp,
      refractiveIndex: isLiquid ? 1.84 : 1.21,
      absorptanceCoeff: isLiquid ? 0.91 : 0.12,
      layerThicknessMm: [12.0, 45.2, 18.1],
      spectroscopicAnomaly: isLiquid,
      penetrationDepthMm: 120
    };
  }

  getFeatures(rawStream) {
    return {
      liquidSignatureDetected: rawStream.spectroscopicAnomaly,
      absorptance: rawStream.absorptanceCoeff,
      confidence: 0.87
    };
  }
}