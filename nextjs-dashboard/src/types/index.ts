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

export type TabType = 'overview' | 'trends' | 'anomalies' | 'suspicious' | 'dormancy' | 'explorer';
