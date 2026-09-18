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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Volume */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-teal-500/50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Turnover (8 Months)</span>
          <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">{formatBDT(stats.totalPA)}</div>
        <div className="flex items-center space-x-2 mt-2 text-xs text-slate-400">
          <span className="text-teal-400 font-semibold">{formatBDT(stats.augPA)}</span>
          <span>in August '26</span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-teal-500/10 transition-all" />
      </div>

      {/* Transaction Count */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">August Transactions</span>
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">{formatNumber(stats.augPC)}</div>
        <div className="flex items-center space-x-2 mt-2 text-xs text-slate-400">
          <span>Avg Ticket:</span>
          <span className="text-cyan-400 font-semibold">{formatBDT(stats.avgAugTicketSize)}</span>
          <span>(Total: {formatNumber(stats.totalPC)})</span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-all" />
      </div>

      {/* Active Clients */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Merchants</span>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-white tracking-tight">{stats.activeCount}</div>
          <span className="text-xs text-slate-400">/ {stats.totalMerchants} clients ({Math.round((stats.activeCount / stats.totalMerchants) * 100)}%)</span>
        </div>
        <div className="flex items-center space-x-3 mt-2 text-xs">
          <span className="text-amber-400">{stats.amberCount} Amber</span>
          <span className="text-slate-500">•</span>
          <span className="text-rose-400">{stats.dormantCount} Dormant</span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
      </div>

      {/* Critical Audit Alerts */}
      <div
        onClick={() => onNavigateTab('suspicious')}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-rose-500/60 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Audit Red Flags</span>
          </span>
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {stats.flaggedCounts.burstReactivation + stats.flaggedCounts.singleCustomerRisk + stats.flaggedCounts.growthSpike}
        </div>
        <div className="flex items-center space-x-2 mt-2 text-xs text-slate-400">
          <span className="text-rose-400 font-semibold">{stats.flaggedCounts.burstReactivation} Burst</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">{stats.flaggedCounts.singleCustomerRisk} Single Cust</span>
          <span>•</span>
          <span className="text-cyan-400 font-semibold">{stats.flaggedCounts.growthSpike} Spikes</span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />
      </div>
    </div>
  );
};
