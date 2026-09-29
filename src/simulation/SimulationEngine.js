import { CameraSensor } from '../sensors/CameraSensor';
import { DepthSensor } from '../sensors/DepthSensor';
import { RfCsiSensor } from '../sensors/RfCsiSensor';
import { UltrasoundSensor } from '../sensors/UltrasoundSensor';
import { TerahertzSensor } from '../sensors/TerahertzSensor';
import { XRaySensor } from '../sensors/XRaySensor';

export const SCENARIOS = {
  NORMAL: { id: 'NORMAL', label: 'Normal Cargo (Uniform Solid)', riskLevel: 'LOW' },
  STRUCTURAL_ANOMALY: { id: 'STRUCTURAL_ANOMALY', label: 'Structural Cracks / Exterior Damage', riskLevel: 'HIGH' },
  INTERNAL_DISPLACEMENT: { id: 'INTERNAL_DISPLACEMENT', label: 'Internal Material Shift', riskLevel: 'MEDIUM' },
  LIQUID_LEAK: { id: 'LIQUID_LEAK', label: 'Liquid Contaminant / Leakage', riskLevel: 'HIGH' },
  VOID_AIR_GAP: { id: 'VOID_AIR_GAP', label: 'Internal Air Gap / Void', riskLevel: 'MEDIUM' },
  LAYER_SEPARATION: { id: 'LAYER_SEPARATION', label: 'Composite Layer Delamination', riskLevel: 'MEDIUM' },
  MIXED_CONTENT: { id: 'MIXED_CONTENT', label: 'Undeclared Mixed Contents', riskLevel: 'HIGH' },
  UNKNOWN_COMPLEX: { id: 'UNKNOWN_COMPLEX', label: 'Complex High-Attentuating Material', riskLevel: 'HIGH' }
};

class SimulationEngine {
  constructor() {
    this.sensors = {
      camera: new CameraSensor(),
      depth: new DepthSensor(),
      csi: new RfCsiSensor(),
      ultrasound: new UltrasoundSensor(),
      thz: new TerahertzSensor(),
      xray: new XRaySensor()
    };
    this.currentScenario = 'NORMAL';
  }

  setScenario(scenarioKey) {
    if (SCENARIOS[scenarioKey]) {
      this.currentScenario = scenarioKey;
    }
  }

  getAllSensorsStatus() {
    return Object.values(this.sensors).map(s => s.getStatus());
  }

  generateSnapshot(packageInfo = {}) {
    const timestamp = Date.now();
    const scenario = this.currentScenario;

    const rgbData = this.sensors.camera.getLiveData(scenario, timestamp);
    const depthData = this.sensors.depth.getLiveData(scenario, timestamp);
    const csiData = this.sensors.csi.getLiveData(scenario, timestamp);
    const ultrasoundData = this.sensors.ultrasound.getLiveData(scenario, timestamp);
    const thzData = this.sensors.thz.getLiveData(scenario, timestamp);

    return {
      timestamp,
      scenario: SCENARIOS[scenario],
      packageId: packageInfo.id || 'PKG-4092-A',
      category: packageInfo.category || 'Solids',
      telemetry: {
        camera: rgbData,
        depth: depthData,
        csi: csiData,
        ultrasound: ultrasoundData,
        thz: thzData
      }
    };
  }
}

export const simulationEngine = new SimulationEngine();