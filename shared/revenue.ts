export function calculateRevenue(activatedLeads: number, ratePerActivation: number): number {
  return Math.max(0, activatedLeads) * Math.max(0, ratePerActivation);
}
