import { BaseSensor } from './BaseSensor';

export class UltrasoundSensor extends BaseSensor {
  constructor() {
    super('sensor-ultrasound', 'Acoustic Ultrasonic Phased Array', 'INTERNAL');
    this.frequencyKhz = 500;
  }

  getLiveData(scenario, timestamp = Date.now()) {
    const isVoid = scenario === 'VOID_AIR_GAP' || scenario === 'LAYER_SEPARATION';
    return {
      sensorId: this.id,
      timestamp,
      echoResponseDb: isVoid ? -42.1 : -18.5,
      attenuationCoeff: isVoid ? 0.82 : 0.15,
      defectDepthMm: isVoid ? 84.5 : 0,
      interfaceDiscontinuity: isVoid,
      confidence: 0.91
    };
  }

  getFeatures(rawStream) {
    return {
      hasDiscontinuity: rawStream.interfaceDiscontinuity,
      attenuation: rawStream.attenuationCoeff,
      confidence: rawStream.confidence
    };
  }
}