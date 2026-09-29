/**
 * BaseSensor Interface
 * Defines common contracts for hardware adapters and simulation modules.
 */
export class BaseSensor {
  constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type; // 'EXTERNAL' | 'INTERNAL' | 'ESCALATION'
    this.status = 'ONLINE'; // 'ONLINE' | 'CALIBRATING' | 'WARNING' | 'OFFLINE' | 'SIMULATION'
    this.health = 100;
    this.calibrationDate = new Date().toISOString();
    this.isScanning = false;
  }

  initialize() {
    this.status = 'ONLINE';
    this.health = 98 + Math.floor(Math.random() * 3);
    return true;
  }

  connect() {
    this.status = 'ONLINE';
    return Promise.resolve(true);
  }

  disconnect() {
    this.status = 'OFFLINE';
    return Promise.resolve(true);
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      health: this.health,
      isScanning: this.isScanning,
      calibrationDate: this.calibrationDate
    };
  }

  startScan() {
    this.isScanning = true;
  }

  stopScan() {
    this.isScanning = false;
  }

  calibrate() {
    this.status = 'CALIBRATING';
    return new Promise((resolve) => {
      setTimeout(() => {
        this.status = 'ONLINE';
        this.calibrationDate = new Date().toISOString();
        resolve(true);
      }, 1000);
    });
  }

  getLiveData(scenario, timestamp) {
    throw new Error("Method 'getLiveData()' must be implemented by subclass.");
  }

  getFeatures(rawStream) {
    throw new Error("Method 'getFeatures()' must be implemented by subclass.");
  }
}