export interface MonthlyMetric {
  month: string;
  pc: number;
  pa: number;
  cc: number;
  ticketSize: number;
}

export interface MerchantFlags {
  singleCustomerRisk: boolean;
  burstReactivation: boolean;
  growthSpike: boolean;
  cliffDrop: boolean;
  microTicketRisk: boolean;
  highRateSurge: boolean;
  megaVolume: boolean;
}

export interface IndustryProfile {
  id: string;
  name: string;
  icon: string;
  color: string;
  badgeClass: string;
  typicalGrowthMax: number;
  typicalTicketMin: number;
  typicalTicketMax: number;
  expectedDiversityRatio: number;
  description: string;
  auditFocus: string;
  benchmarkRationale: string;
}

export interface IndustryAnomaly {
  isAnomaly: boolean;
  flags: string[];
  reasons: string[];
  summaryReason: string;
  growthStatus: 'BREACH' | 'NORMAL' | 'NEW';
  ticketStatus: 'HIGH' | 'LOW' | 'NORMAL';
  diversityRatio: number;
  diversityStatus: 'CONCENTRATED' | 'NORMAL';
}

export interface Merchant {
  walletNo: string;
  merchantName: string;
  maoName: string;
  subPillar: string;
  isdOsd: string;
  walletType: string;
  rate: string;
  leadType: string;
  district: string;
  address: string;
  regDate: string;
  subCategory: string;
  regMonth: string;
  monthly: MonthlyMetric[];
  augPC: number;
  augPA: number;
  augCC: number;
  augActive: string;
  avgTicketSize: number;
  growth: number;
  isNewGrowth: boolean;
  dormantMonths: number;
  onboardMonth?: number;
  tenureMonths?: number;
  preOnboardingMonths?: number;
  naiveDormantMonths?: number;
  auditFlag: string;
  totalPA: number;
  totalPC: number;
  totalCC: number;
  riskScore: number;
  flags: MerchantFlags;
  industry?: IndustryProfile;
  industryName?: string;
  industryAnomaly?: IndustryAnomaly;
}

export interface PortfolioStats {
  totalMerchants: number;
  activeCount: number;
  amberCount: number;
  dormantCount: number;
  totalPA: number;
  augPA: number;
  totalPC: number;
  augPC: number;
  avgAugTicketSize: number;
  flaggedCounts: {
    suddenReactivation: number;
    highDormancy: number;
    monitor: number;
    healthy: number;
    burstReactivation: number;
    singleCustomerRisk: number;
    growthSpike: number;
    cliffDrop: number;
    microTicket: number;
    highRateSurge: number;
    megaVolume: number;
  };
}

export interface MAOPerformance {
  name: string;
  total: number;
  healthy: number;
  active: number;
  amber: number;
  dormant: number;
  amlRisk: number;
  suddenReact: number;
  highDormancy: number;
  totalAugPA: number;
  healthyPct: number;
  activePct: number;
  dormantPct: number;
  amlPct: number;
  suddenReactPct: number;
  highDormancyPct: number;
  score: number;
  grade: string;
  gradeLabel: string;
  gradeBadge: string;
  auditVerdict: string;
  rank: number;
}

export type TabType = 'overview' | 'trends' | 'anomalies' | 'suspicious' | 'dormancy' | 'mao' | 'explorer';
