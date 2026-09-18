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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {/* Total Volume */}
      <div className="bg-slate-900/90 surface-card border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 text-secondary uppercase tracking-wider">Turnover</span>
          <div className="p-1.5 sm:p-2 bg-teal-500/10 text-teal-400 rounded-lg">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div>
          <div className="text-base sm:text-2xl font-bold text-white text-primary tracking-tight truncate">{formatBDT(stats.totalPA)}</div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-400 text-secondary truncate">
            <span className="text-teal-400 font-medium">{formatBDT(stats.augPA)}</span>
            <span className="hidden sm:inline">in August</span>
          </div>
        </div>
      </div>

      {/* Transaction Count */}
      <div className="bg-slate-900/90 surface-card border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 text-secondary uppercase tracking-wider">Aug Volume</span>
          <div className="p-1.5 sm:p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div>
          <div className="text-base sm:text-2xl font-bold text-white text-primary tracking-tight truncate">{formatNumber(stats.augPC)} txns</div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-400 text-secondary truncate">
            <span>Avg:</span>
            <span className="text-cyan-400 font-medium">{formatBDT(stats.avgAugTicketSize)}</span>
          </div>
        </div>
      </div>

      {/* Active Clients */}
      <div className="bg-slate-900/90 surface-card border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 text-secondary uppercase tracking-wider">Active Rate</span>
          <div className="p-1.5 sm:p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div>
          <div className="text-base sm:text-2xl font-bold text-white text-primary tracking-tight">{stats.activeCount} <span className="text-xs sm:text-sm font-normal text-slate-400 text-secondary">({Math.round((stats.activeCount / stats.totalMerchants) * 100)}%)</span></div>
          <div className="flex items-center space-x-1.5 mt-1 text-[11px] truncate">
            <span className="text-amber-400 font-medium">{stats.amberCount} Amb</span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400 font-medium">{stats.dormantCount} Dorm</span>
          </div>
        </div>
      </div>

      {/* Critical Audit Alerts */}
      <div
        onClick={() => onNavigateTab('suspicious')}
        className="bg-slate-900/90 surface-card border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-rose-500/50 cursor-pointer transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Red Flags</span>
          </span>
          <div className="p-1.5 sm:p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div>
          <div className="text-base sm:text-2xl font-bold text-white text-primary tracking-tight">
            {stats.flaggedCounts.burstReactivation + stats.flaggedCounts.singleCustomerRisk + stats.flaggedCounts.growthSpike} Cases
          </div>
          <div className="flex items-center space-x-1.5 mt-1 text-[11px] truncate">
            <span className="text-rose-400 font-medium">{stats.flaggedCounts.burstReactivation} Burst</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-medium">{stats.flaggedCounts.singleCustomerRisk} Loop</span>
          </div>
        </div>
      </div>
    </div>
  );
};
