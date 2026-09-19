'use client';

import React, { useState } from 'react';
import { Merchant } from '../types';
import { formatBDT, formatNumber, formatPercent, INDUSTRY_DEFINITIONS } from '../lib/auditRules';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Search, ArrowUpRight, Building2 } from 'lucide-react';

interface AnomalyTabProps {
  merchants: Merchant[];
  onSelectMerchant: (m: Merchant) => void;
}

export const AnomalyTab: React.FC<AnomalyTabProps> = ({ merchants, onSelectMerchant }) => {
  const [filterType, setFilterType] = useState<'all' | 'spikes' | 'cliff' | 'mega'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Industry counts across anomalies
  const allAnomalies = merchants.filter(m => m.industryAnomaly?.isAnomaly);

  const sectorCounts: Record<string, number> = { ALL: allAnomalies.length };
  Object.keys(INDUSTRY_DEFINITIONS).forEach(k => { sectorCounts[k] = 0; });
  allAnomalies.forEach(m => {
    if (m.industry?.id && sectorCounts[m.industry.id] !== undefined) {
      sectorCounts[m.industry.id]++;
    }
  });

  // Filtered by Industry first
  const industryFiltered = selectedIndustry === 'ALL'
    ? allAnomalies
    : allAnomalies.filter(m => m.industry?.id === selectedIndustry);

  // 1. Growth Spikes
  const growthSpikes = industryFiltered.filter((m) =>
    (m.growth >= (m.industry?.typicalGrowthMax || 100) && m.augPA >= 5000 && !m.isNewGrowth) || m.flags.growthSpike
  );

  // 2. Mega-Volume Outliers
  const megaVolume = industryFiltered.filter((m) => m.flags.megaVolume);

  // 3. Cliff Drops
  const cliffDrops = industryFiltered.filter((m) => m.flags.cliffDrop);

  // Filtered list based on stat card
  const activeList = (() => {
    let list: Merchant[] = [];
    if (filterType === 'spikes') list = growthSpikes;
    else if (filterType === 'mega') list = megaVolume;
    else if (filterType === 'cliff') list = cliffDrops;
    else list = industryFiltered;

    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (m) =>
        m.merchantName.toLowerCase().includes(q) ||
        m.walletNo.includes(q) ||
        (m.industry?.name || '').toLowerCase().includes(q) ||
        m.subPillar.toLowerCase().includes(q)
    );
  })();

  const pillKeys = ['ALL', 'LAUNDRY', 'AUTOMOBILES', 'FURNITURE', 'BEAUTY_SALON', 'TRAVEL_TOURISM', 'HEALTHCARE', 'EDUCATION', 'FOOD_DINING', 'GROCERY', 'ELECTRONICS', 'FASHION', 'DIGITAL_SERVICES', 'GENERAL_RETAIL'];

  return (
    <div className="space-y-6">
      {/* Industry Sector Radar Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Industry-Tailored Anomaly Radar</h3>
          </div>
          <span className="text-xs text-teal-400 font-medium">
            {selectedIndustry === 'ALL' ? 'All Industries Monitored' : INDUSTRY_DEFINITIONS[selectedIndustry]?.name}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Tailored anomaly engine classifying merchants by business model. Inelastic sectors like pharmacies flag MoM surges above 50%, while retail accounts are audited against category basket sizes and client concentration.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {pillKeys.map(k => {
            const isAll = k === 'ALL';
            const label = isAll ? 'All Sectors' : INDUSTRY_DEFINITIONS[k].name;
            const count = sectorCounts[k] || 0;
            const isSelected = selectedIndustry === k;
            return (
              <button
                key={k}
                onClick={() => setSelectedIndustry(k)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/60'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-900/60 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterType(filterType === 'spikes' ? 'all' : 'spikes')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'spikes'
              ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Sector Growth Surges</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{growthSpikes.length} Accounts</div>
          <p className="text-xs text-slate-400 mt-1">Exceeds industry normal growth ceiling</p>
        </div>

        <div
          onClick={() => setFilterType(filterType === 'mega' ? 'all' : 'mega')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'mega'
              ? 'bg-cyan-950/30 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Mega-Volume Entities</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{megaVolume.length} Accounts</div>
          <p className="text-xs text-slate-400 mt-1">>BDT 5M in August or >BDT 10M total volume</p>
        </div>

        <div
          onClick={() => setFilterType(filterType === 'cliff' ? 'all' : 'cliff')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'cliff'
              ? 'bg-rose-950/30 border-rose-500/80 shadow-lg shadow-rose-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Cliff-edge Dropouts</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{cliffDrops.length} Accounts</div>
          <p className="text-xs text-slate-400 mt-1">High volume in July dropping to 0 in August</p>
        </div>
      </div>

      {/* Spotlight Case (Dynamically filtered to selected MAO & Industry) */}
      {(() => {
        const topAnomalies = [...activeList]
          .sort((a, b) => (b.growth || 0) - (a.growth || 0) || b.augPA - a.augPA)
          .slice(0, 2);

        return (
          <div className="bg-slate-900/90 surface-card border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Spotlight Anomaly Accounts</h2>
              </div>
              <span className="text-[11px] text-teal-400 font-semibold">
                {selectedIndustry === 'ALL' ? 'All Sectors' : INDUSTRY_DEFINITIONS[selectedIndustry]?.name}
              </span>
            </div>
            {topAnomalies.length === 0 ? (
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl text-center text-slate-400 text-xs">
                No extreme anomaly cases detected for this selection.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {topAnomalies.map((m) => {
                  const ind = m.industry || INDUSTRY_DEFINITIONS.GENERAL_RETAIL;
                  const reason = m.industryAnomaly?.reasons?.[0] || 'Sector baseline breach';
                  const desc = `${reason}. August Turnover: ${formatBDT(m.augPA)} across ${formatNumber(m.augPC)} txns.`;
                  return (
                    <div
                      key={m.walletNo}
                      onClick={() => onSelectMerchant(m)}
                      className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/60 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <span className="font-bold text-teal-400 text-sm truncate max-w-[220px]">{m.merchantName}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] shrink-0 ${ind.badgeClass}`}>
                          {ind.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mb-1.5">{m.walletNo} • MAO: ${m.maoName}</div>
                      <div className="p-2 bg-slate-900/60 rounded-lg text-amber-300 text-[11px] leading-relaxed border border-amber-500/20 mb-1">
                        ⚠️ {reason}
                      </div>
                      <p className="text-slate-400 text-[10px] mt-1">{desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Anomalous Merchants Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white">Anomalous Client Accounts ({activeList.length})</h2>
            {selectedIndustry !== 'ALL' && (
              <button
                onClick={() => setSelectedIndustry('ALL')}
                className="px-2 py-0.5 rounded text-xs bg-slate-800 text-teal-400 hover:text-teal-300"
              >
                Clear Sector Filter
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, wallet..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-3">Wallet & Merchant</th>
                <th className="p-3">Industry</th>
                <th className="p-3">Sub Pillar</th>
                <th className="p-3 text-right">July PA</th>
                <th className="p-3 text-right">August PA</th>
                <th className="p-3 text-right">MoM Growth</th>
                <th className="p-3">Sector Risk & Reason</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeList.slice(0, 30).map((m) => {
                const ind = m.industry || INDUSTRY_DEFINITIONS.GENERAL_RETAIL;
                const reason = m.industryAnomaly?.reasons?.[0] || 'Sector Anomaly';
                const isSurge = m.growth >= ind.typicalGrowthMax;

                return (
                  <tr key={m.walletNo} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-white truncate max-w-[200px]">{m.merchantName}</div>
                      <div className="text-[11px] text-slate-400">{m.walletNo}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ind.badgeClass}`}>
                        {ind.name}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{m.subPillar}</td>
                    <td className="p-3 text-right text-slate-300">{formatBDT(m.monthly[6]?.pa || 0)}</td>
                    <td className="p-3 text-right font-bold text-white">{formatBDT(m.augPA)}</td>
                    <td className="p-3 text-right">
                      {m.isNewGrowth ? (
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold text-[10px]">New</span>
                      ) : (
                        <span className={`font-bold ${isSurge ? 'text-amber-400' : m.growth < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                          {formatPercent(m.growth)}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-[11px] font-medium text-amber-300 max-w-[260px] truncate" title={reason}>
                        {reason}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Ceiling: &le;+{ind.typicalGrowthMax}% • Ticket: BDT {ind.typicalTicketMin}-{ind.typicalTicketMax}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onSelectMerchant(m)}
                        className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center space-x-1"
                      >
                        <span>Audit 360</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
