'use client';

import React, { useState, useEffect } from 'react';
import { Merchant, PortfolioStats, TabType } from '../types';
import { calculatePortfolioStats } from '../lib/auditRules';
import { Header } from '../components/Header';
import { KPICards } from '../components/KPICards';
import { OverviewTab } from '../components/OverviewTab';
import { TrendsTab } from '../components/TrendsTab';
import { AnomalyTab } from '../components/AnomalyTab';
import { SuspiciousTab } from '../components/SuspiciousTab';
import { DormancyTab } from '../components/DormancyTab';
import { MerchantTable } from '../components/MerchantTable';
import { MerchantDrawer } from '../components/MerchantDrawer';
import { ExportModal } from '../components/ExportModal';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMAO, setSelectedMAO] = useState<string>('ALL');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/merchants_cleaned.json');
        const json = await res.json();
        const data: Merchant[] = json.merchants || [];
        setMerchants(data);
      } catch (err) {
        console.error('Failed to load merchant dataset:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const maoList = React.useMemo(() => {
    const map = new Map<string, number>();
    merchants.forEach(m => {
      const name = m.maoName || 'Unassigned';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [merchants]);

  const activeMerchants = React.useMemo(() => {
    if (selectedMAO === 'ALL') return merchants;
    return merchants.filter(m => m.maoName === selectedMAO);
  }, [merchants, selectedMAO]);

  const stats = React.useMemo(() => {
    if (!activeMerchants.length && !loading) return null;
    return calculatePortfolioStats(activeMerchants);
  }, [activeMerchants, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading 961 client accounts and audit models...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-rose-400 text-xs font-semibold">Error: Unable to compute audit metrics.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stats={stats}
        onOpenExport={() => setIsExportOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedMAO={selectedMAO}
        onSelectMAO={setSelectedMAO}
        maoList={maoList}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <KPICards stats={stats} onNavigateTab={setCurrentTab} />

        {currentTab === 'overview' && (
          <OverviewTab
            merchants={activeMerchants}
            stats={stats}
            onSelectMerchant={setSelectedMerchant}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'trends' && (
          <TrendsTab
            merchants={activeMerchants}
            stats={stats}
          />
        )}

        {currentTab === 'anomalies' && (
          <AnomalyTab
            merchants={activeMerchants}
            onSelectMerchant={setSelectedMerchant}
          />
        )}

        {currentTab === 'suspicious' && (
          <SuspiciousTab
            merchants={activeMerchants}
            onSelectMerchant={setSelectedMerchant}
          />
        )}

        {currentTab === 'dormancy' && (
          <DormancyTab
            merchants={activeMerchants}
            onSelectMerchant={setSelectedMerchant}
          />
        )}

        {currentTab === 'explorer' && (
          <MerchantTable
            merchants={activeMerchants}
            onSelectMerchant={setSelectedMerchant}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </main>

      {/* Client 360 Drawer */}
      <MerchantDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        merchants={activeMerchants}
      />
    </div>
  );
}
