'use client';

import React from 'react';
import { TabType, PortfolioStats } from '../types';
import { ShieldAlert, TrendingUp, AlertTriangle, UserX, Search, Download, Layers, Activity, Users, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  stats: PortfolioStats | null;
  onOpenExport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedMAO: string;
  onSelectMAO: (mao: string) => void;
  maoList: { name: string; count: number }[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  stats,
  onOpenExport,
  searchQuery,
  onSearchChange,
  selectedMAO,
  onSelectMAO,
  maoList,
  theme,
  onToggleTheme,
}) => {
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Layers },
    { id: 'trends' as TabType, label: 'Trends & Macro', icon: TrendingUp },
    { id: 'anomalies' as TabType, label: 'Anomaly Radar', icon: AlertTriangle, badge: stats?.flaggedCounts.growthSpike },
    { id: 'suspicious' as TabType, label: 'AML / Suspicious', icon: ShieldAlert, badge: stats ? (stats.flaggedCounts.singleCustomerRisk + stats.flaggedCounts.burstReactivation) : undefined, badgeColor: 'bg-rose-500' },
    { id: 'dormancy' as TabType, label: 'Dormancy Matrix', icon: UserX, badge: stats?.flaggedCounts.suddenReactivation, badgeColor: 'bg-amber-500' },
    { id: 'explorer' as TabType, label: 'Merchant 360', icon: Activity },
  ];

  const totalAccounts = maoList.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg shadow-teal-500/20">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Client Transaction Audit</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full">
                  Audit Practice 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">Transaction Trends, Anomaly Screener, AML Flags & Dormancy</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Global MAO Filter */}
            <div className="relative flex items-center">
              <span className="text-[11px] font-semibold text-slate-400 mr-2 hidden lg:inline">MAO:</span>
              <div className="relative">
                <Users className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none" />
                <select
                  value={selectedMAO}
                  onChange={(e) => onSelectMAO(e.target.value)}
                  className="pl-8 pr-7 py-1.5 bg-slate-800 border border-teal-500/40 hover:border-teal-500/80 rounded-lg text-xs font-medium text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer shadow-sm shadow-teal-950"
                >
                  <option value="ALL">All Officers ({totalAccounts} Clients)</option>
                  {maoList.map(o => (
                    <option key={o.name} value={o.name}>
                      {o.name} ({o.count} Clients)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search merchant, wallet, MAO..."
                className="w-44 md:w-56 pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={onOpenExport}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm shadow-teal-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Audit</span>
            </button>
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-teal-400 border border-teal-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${tab.badgeColor || 'bg-teal-500'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
