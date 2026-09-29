import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import DemoToolbar from './components/DemoToolbar';
import ReportModal from './components/ReportModal';

import DashboardPage from './pages/DashboardPage';
import InspectionPage from './pages/InspectionPage';
import SensorCsiPage from './pages/SensorCsiPage';
import SensorFusionPage from './pages/SensorFusionPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import HistoryPage from './pages/HistoryPage';
import ConfigurationPage from './pages/ConfigurationPage';

import { simulationEngine } from './simulation/SimulationEngine';
import { FusionEngine } from './ai/FusionEngine';
import { DecisionEngine } from './ai/DecisionEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentScenario, setScenario] = useState('NORMAL');
  const [inspectionStage, setInspectionStage] = useState('IDENTIFY');
  const [snapshot, setSnapshot] = useState(simulationEngine.generateSnapshot());
  const [fusionResult, setFusionResult] = useState(FusionEngine.evaluate(snapshot.telemetry));
  const [decisionResult, setDecisionResult] = useState(DecisionEngine.makeDecision(fusionResult, snapshot.scenario));
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Update simulation when scenario changes
  useEffect(() => {
    simulationEngine.setScenario(currentScenario);
    const snap = simulationEngine.generateSnapshot();
    const fusion = FusionEngine.evaluate(snap.telemetry, snap.category);
    const decision = DecisionEngine.makeDecision(fusion, snap.scenario);

    setSnapshot(snap);
    setFusionResult(fusion);
    setDecisionResult(decision);
  }, [currentScenario]);

  // Guided judicial demo walkthrough player
  const runJudicialDemo = (scenarioKey) => {
    setScenario(scenarioKey);
    setActiveTab('dashboard');
    const stages = ['IDENTIFY', 'EXT_SCAN', 'INT_SCAN', 'FUSION', 'DECISION'];

    stages.forEach((stg, i) => {
      setTimeout(() => {
        setInspectionStage(stg);
      }, i * 900);
    });
  };

  const resetSimulation = () => {
    setScenario('NORMAL');
    setInspectionStage('IDENTIFY');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Demo Toolbar for SIH Judges */}
      <DemoToolbar onRunJudicialDemo={runJudicialDemo} onReset={resetSimulation} />

      {/* Main Command Header */}
      <Header currentScenario={currentScenario} setScenario={setScenario} />

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} alertCount={3} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900/30">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              snapshot={snapshot}
              fusionResult={fusionResult}
              decisionResult={decisionResult}
              inspectionStage={inspectionStage}
            />
          )}

          {activeTab === 'inspection' && (
            <InspectionPage 
              snapshot={snapshot}
              fusionResult={fusionResult}
              decisionResult={decisionResult}
              scenario={snapshot.scenario}
              onOpenReport={() => setIsReportOpen(true)}
            />
          )}

          {activeTab === 'csi' && <SensorCsiPage snapshot={snapshot} />}
          {activeTab === 'fusion' && <SensorFusionPage fusionResult={fusionResult} />}
          {activeTab === 'twin' && <DigitalTwinPage scenario={snapshot.scenario} />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'alerts' && <AlertsPage />}
          {activeTab === 'history' && <HistoryPage />}
          {activeTab === 'config' && <ConfigurationPage />}
        </main>
      </div>

      {/* Industrial Inspection Report Certificate Modal */}
      {isReportOpen && (
        <ReportModal 
          inspectionData={{
            packageId: snapshot.packageId,
            category: snapshot.category,
            decision: decisionResult,
            fusion: fusionResult
          }}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}