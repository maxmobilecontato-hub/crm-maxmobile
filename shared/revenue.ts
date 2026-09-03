export function calculateMonthlyRevenue(
  pdvs: number,
  activations: number,
  setupRate: number,
  activationRate: number,
  monthlyRate: number,
): number {
  return Math.max(0, pdvs) * (Math.max(0, setupRate) + Math.max(0, monthlyRate)) +
    Math.max(0, activations) * Math.max(0, activationRate);
}
