/**
 * Decision Engine
 * Maps fused AI outputs into operational verdicts: PASS | REJECT | VERIFY
 */
export class DecisionEngine {
  static makeDecision(fusionResult, scenario) {
    const { fusedAnomalyScore, confidence, supportingSensors } = fusionResult;

    let decision = 'PASS';
    let riskLevel = 'LOW';
    let reasoning = 'Package exterior and interior signatures fall within normal calibrated baseline bounds.';

    if (fusedAnomalyScore >= 0.45 && confidence >= 0.85) {
      decision = 'REJECT';
      riskLevel = 'HIGH';
      reasoning = `High-confidence multi-sensor detection of internal anomaly (${supportingSensors.join(', ')}). Package violates density and structural safety thresholds.`;
    } else if (fusedAnomalyScore >= 0.20 || confidence < 0.80 || scenario.id === 'UNKNOWN_COMPLEX') {
      decision = 'VERIFY';
      riskLevel = 'MEDIUM';
      reasoning = `Internal signal deviation or sensor disagreement detected. Automated escalation to X-Ray Portal recommended for verification.`;
    }

    return {
      decision, // 'PASS' | 'REJECT' | 'VERIFY'
      riskLevel, // 'LOW' | 'MEDIUM' | 'HIGH'
      reasoning,
      requiresXRay: decision === 'VERIFY'
    };
  }
}