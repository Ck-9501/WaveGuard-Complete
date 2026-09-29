import { BaseSensor } from './BaseSensor';

export class CameraSensor extends BaseSensor {
  constructor() {
    super('sensor-rgb', 'RGB Visual Inspection Camera', 'EXTERNAL');
    this.resolution = '4K UltraHD';
    this.fps = 60;
  }

  getLiveData(scenario, timestamp = Date.now()) {
    const isAnomaly = scenario === 'STRUCTURAL_ANOMALY' || scenario === 'LIQUID_LEAK';
    return {
      sensorId: this.id,
      timestamp,
      barcodeDetected: true,
      barcodeVal: 'PKG-889042-IN',
      surfaceIntegrityScore: isAnomaly && scenario === 'STRUCTURAL_ANOMALY' ? 0.62 : 0.98,
      labelLegibility: 0.96,
      visualDefectConfidence: isAnomaly ? 0.78 : 0.05,
      detectedCategory: 'Solids (Boxed Electronics)'
    };
  }

  getFeatures(rawStream) {
    return {
      externalDamageFlag: rawStream.surfaceIntegrityScore < 0.8,
      confidence: rawStream.visualDefectConfidence,
      categoryMatch: rawStream.detectedCategory
    };
  }
}