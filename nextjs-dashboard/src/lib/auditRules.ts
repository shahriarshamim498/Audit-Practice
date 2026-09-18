import { Merchant, PortfolioStats } from '../types';

export function calculatePortfolioStats(merchants: Merchant[]): PortfolioStats {
  let activeCount = 0;
  let amberCount = 0;
  let dormantCount = 0;
  let totalPA = 0;
  let augPA = 0;
  let totalPC = 0;
  let augPC = 0;

  const flaggedCounts = {
    suddenReactivation: 0,
    highDormancy: 0,
    monitor: 0,
    healthy: 0,
    burstReactivation: 0,
    singleCustomerRisk: 0,
    growthSpike: 0,
    cliffDrop: 0,
    microTicket: 0,
    highRateSurge: 0,
    megaVolume: 0,
  };

  for (const m of merchants) {
    if (m.augActive === 'Active') activeCount++;
    else if (m.augActive === 'Amber') amberCount++;
    else dormantCount++;

    totalPA += m.totalPA;
    augPA += m.augPA;
    totalPC += m.totalPC;
    augPC += m.augPC;

    if (m.auditFlag === 'Sudden Reactivation - Review') flaggedCounts.suddenReactivation++;
    if (m.auditFlag === 'High Dormancy - Review') flaggedCounts.highDormancy++;
    if (m.auditFlag === 'Monitor') flaggedCounts.monitor++;
    if (m.auditFlag === 'Healthy/Active') flaggedCounts.healthy++;

    if (m.flags.burstReactivation) flaggedCounts.burstReactivation++;
    if (m.flags.singleCustomerRisk) flaggedCounts.singleCustomerRisk++;
    if (m.flags.growthSpike) flaggedCounts.growthSpike++;
    if (m.flags.cliffDrop) flaggedCounts.cliffDrop++;
    if (m.flags.microTicketRisk) flaggedCounts.microTicket++;
    if (m.flags.highRateSurge) flaggedCounts.highRateSurge++;
    if (m.flags.megaVolume) flaggedCounts.megaVolume++;
  }

  const avgAugTicketSize = augPC > 0 ? augPA / augPC : 0;

  return {
    totalMerchants: merchants.length,
    activeCount,
    amberCount,
    dormantCount,
    totalPA,
    augPA,
    totalPC,
    augPC,
    avgAugTicketSize,
    flaggedCounts,
  };
}

export function formatBDT(val: number): string {
  if (val >= 10000000) {
    return `BDT ${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `BDT ${(val / 100000).toFixed(2)} Lac`;
  }
  return `BDT ${Math.round(val).toLocaleString()}`;
}

export function formatNumber(val: number): string {
  return Math.round(val).toLocaleString();
}

export function formatPercent(val: number): string {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}
