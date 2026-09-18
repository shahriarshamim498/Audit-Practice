'use client';

import React from 'react';
import { PortfolioStats } from '../types';
import { formatBDT, formatNumber } from '../lib/auditRules';
import { DollarSign, Activity, Users, ShieldAlert, AlertTriangle, UserCheck } from 'lucide-react';

interface KPICardsProps {
  stats: PortfolioStats;
  onNavigateTab: (tab: any) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ stats, onNavigateTab }) => {
  const activePct = stats.totalMerchants > 0 ? ((stats.activeCount / stats.totalMerchants) * 100).toFixed(1) : '0';
  const totalFlags = stats.flaggedCounts.burstReactivation + stats.flaggedCounts.singleCustomerRisk + stats.flaggedCounts.growthSpike;
  const flagPct = stats.totalMerchants > 0 ? ((totalFlags / stats.totalMerchants) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-4 sm:mb-6">
      {/* Card 1: Portfolio Turnover (Page Views equivalent) */}
      <div className="bg-white dark:bg-slate-900 surface-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Portfolio Turnover</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline flex-wrap gap-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatBDT(stats.totalPA)}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <span className="mr-0.5 text-[9px]">▲</span>18.4%
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal truncate">
            vs. {formatBDT(stats.augPA)} in August
          </div>
        </div>
      </div>

      {/* Card 2: Active Merchants (Visitors equivalent) */}
      <div className="bg-white dark:bg-slate-900 surface-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Active Merchants</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline flex-wrap gap-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatNumber(stats.activeCount)}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <span className="mr-0.5 text-[9px]">▲</span>{activePct}%
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal truncate">
            vs. {stats.totalMerchants} total accounts
          </div>
        </div>
      </div>

      {/* Card 3: August Transactions (Click equivalent) */}
      <div className="bg-white dark:bg-slate-900 surface-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">August Transactions</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline flex-wrap gap-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatNumber(stats.augPC)}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <span className="mr-0.5 text-[9px]">▲</span>4.4%
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal truncate">
            vs. Avg {formatBDT(stats.avgAugTicketSize)} ticket
          </div>
        </div>
      </div>

      {/* Card 4: Audit Red Flags (Orders / Alert equivalent) */}
      <div
        onClick={() => onNavigateTab('suspicious')}
        className="bg-white dark:bg-slate-900 surface-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Audit Red Flags</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline flex-wrap gap-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatNumber(totalFlags)}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <span className="mr-0.5 text-[9px]">▼</span>{flagPct}%
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal truncate">
            vs. {formatNumber(stats.totalMerchants - totalFlags)} clean accounts
          </div>
        </div>
      </div>
    </div>
  );
};
