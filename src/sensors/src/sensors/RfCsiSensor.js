import { BaseSensor } from './BaseSensor';

export class RfCsiSensor extends BaseSensor {
  constructor() {
    super('sensor-csi', 'RF Channel State Information (CSI) Transceiver', 'INTERNAL');
    this.subcarrierCount = 64;
    this.frequencyBand = '5.8 GHz WiFi / Sub-6 GHz';
  }

  getLiveData(scenario, timestamp = Date.now()) {
    const isAnomaly = ['STRUCTURAL_ANOMALY', 'INTERNAL_DISPLACEMENT', 'LIQUID_LEAK', 'VOID_AIR_GAP'].includes(scenario);
    
    // Generate 64 subcarriers
    const subcarriers = Array.from({ length: 64 }, (_, i) => {
      const baseAmp = 20 + Math.sin(i / 4) * 8;
      const noise = (Math.sin(timestamp / 500 + i) * 1.5);
      const shift = isAnomaly ? (i % 8 === 0 ? 12 : -5) : 0;
      return {
        index: i,
        amplitude: Math.max(0, parseFloat((baseAmp + noise + shift).toFixed(2))),
        phase: parseFloat(((Math.cos(i / 3) * Math.PI) + (isAnomaly ? 0.8 : 0.1)).toFixed(3))
      };
    });

    const avgAmplitude = subcarriers.reduce((a, b) => a + b.amplitude, 0) / 64;
    const signalEnergy = subcarriers.reduce((a, b) => a + (b.amplitude * b.amplitude), 0) / 64;

    return {
      sensorId: this.id,
      timestamp,
      subcarriers,
      meanAmplitude: parseFloat(avgAmplitude.toFixed(2)),
      signalEnergy: parseFloat(signalEnergy.toFixed(2)),
      phaseSanitised: true,
      snrDb: 28.4,
      varianceFromBaseline: isAnomaly ? 0.48 : 0.04
    };
  }

  getFeatures(rawStream) {
    return {
      csiAnomalyScore: rawStream.varianceFromBaseline,
      signalEnergy: rawStream.signalEnergy,
      confidence: 0.89
    };
  }
}