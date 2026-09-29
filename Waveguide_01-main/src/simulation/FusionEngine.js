/**
 * AI Multi-Sensor Fusion Engine
 * Combines heterogeneous feature streams into unified confidence scores and agreement metrics.
 */
export class FusionEngine {
  static evaluate(telemetry, category = 'Solids') {
    const { camera, depth, csi, ultrasound, thz } = telemetry;

    // Individual sensor anomaly scores [0 .. 1]
    const cameraAnomaly = camera.visualDefectConfidence;
    const depthAnomaly = depth.deformationScore;
    const csiAnomaly = csi.varianceFromBaseline;
    const ultrasoundAnomaly = ultrasound.interfaceDiscontinuity ? 0.85 : 0.08;
    const thzAnomaly = thz.spectroscopicAnomaly ? 0.89 : 0.05;

    // Weighting matrix based on Category Suitability
    let weights = { camera: 0.15, depth: 0.15, csi: 0.30, ultrasound: 0.20, thz: 0.20 };
    if (category === 'Liquids') {
      weights = { camera: 0.10, depth: 0.10, csi: 0.30, ultrasound: 0.10, thz: 0.40 };
    } else if (category === 'Food') {
      weights = { camera: 0.20, depth: 0.15, csi: 0.25, ultrasound: 0.15, thz: 0.25 };
    }

    const fusedAnomalyScore = parseFloat((
      cameraAnomaly * weights.camera +
      depthAnomaly * weights.depth +
      csiAnomaly * weights.csi +
      ultrasoundAnomaly * weights.ultrasound +
      thzAnomaly * weights.thz
    ).toFixed(3));

    // Calculate Agreement
    const indicators = [cameraAnomaly > 0.3, depthAnomaly > 0.3, csiAnomaly > 0.3, ultrasoundAnomaly > 0.3, thzAnomaly > 0.3];
    const positiveCount = indicators.filter(Boolean).length;
    const sensorAgreementStr = `${positiveCount > 2 ? positiveCount : 5 - positiveCount}/5 Sensors Agree`;

    // Supporting sensors
    const supportingSensors = [];
    if (cameraAnomaly > 0.3) supportingSensors.push('RGB Camera');
    if (depthAnomaly > 0.3) supportingSensors.push('3D LiDAR');
    if (csiAnomaly > 0.3) supportingSensors.push('RF/CSI Array');
    if (ultrasoundAnomaly > 0.3) supportingSensors.push('Ultrasound Array');
    if (thzAnomaly > 0.3) supportingSensors.push('THz Spectrometer');

    // System confidence score calculation
    const confidence = parseFloat((0.82 + (Math.abs(fusedAnomalyScore - 0.5) * 0.32)).toFixed(2));

    return {
      fusedAnomalyScore,
      confidence: Math.min(0.99, confidence),
      sensorAgreement: sensorAgreementStr,
      supportingSensors: supportingSensors.length > 0 ? supportingSensors : ['All Sensors (Baseline Uniform)'],
      sensorContributions: {
        camera: cameraAnomaly,
        depth: depthAnomaly,
        csi: csiAnomaly,
        ultrasound: ultrasoundAnomaly,
        thz: thzAnomaly
      }
    };
  }
}