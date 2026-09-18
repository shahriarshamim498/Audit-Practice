'use client';

import React, { useState } from 'react';
import { Merchant } from '../types';
import { formatBDT, formatNumber, formatPercent } from '../lib/auditRules';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Search, ArrowUpRight } from 'lucide-react';

interface AnomalyTabProps {
  merchants: Merchant[];
  onSelectMerchant: (m: Merchant) => void;
}

export const AnomalyTab: React.FC<AnomalyTabProps> = ({ merchants, onSelectMerchant }) => {
  const [filterType, setFilterType] = useState<'all' | 'spikes' | 'cliff' | 'mega'>('all');
  const [search, setSearch] = useState('');

  // 1. Growth Spikes (growth > 300% and Aug PA > 20,000 BDT)
  const growthSpikes = merchants.filter((m) => m.flags.growthSpike);

  // 2. Mega-Volume Outliers (Aug PA > 5,000,000 BDT or Total PA > 10,000,000 BDT)
  const megaVolume = merchants.filter((m) => m.flags.megaVolume);

  // 3. Cliff Drops (Jul PA > 100,000 and Aug PA = 0)
  const cliffDrops = merchants.filter((m) => m.flags.cliffDrop);

  // Filtered list based on tab
  const activeList = (() => {
    let list: Merchant[] = [];
    if (filterType === 'spikes') list = growthSpikes;
    else if (filterType === 'mega') list = megaVolume;
    else if (filterType === 'cliff') list = cliffDrops;
    else list = merchants.filter((m) => m.flags.growthSpike || m.flags.megaVolume || m.flags.cliffDrop);

    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (m) =>
        m.merchantName.toLowerCase().includes(q) ||
        m.walletNo.includes(q) ||
        m.subPillar.toLowerCase().includes(q)
    );
  })();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterType('spikes')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'spikes'
              ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Growth Spikes (>300%)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{growthSpikes.length} Accounts</div>
          <p className="text-xs text-slate-400 mt-1">Sudden extreme MoM turnover acceleration</p>
        </div>

        <div
          onClick={() => setFilterType('mega')}
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
          onClick={() => setFilterType('cliff')}
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

      {/* Spotlight Case: Ambala Commerce & Sroddhaa */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-700/60 rounded-xl p-5 shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Audit Spotlight: Significant Anomaly Cases</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-cyan-400 text-sm">Ambala Commerce (1335101883)</span>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-semibold text-[10px]">Mega Outlier</span>
            </div>
            <p className="text-slate-300 mt-1">
              Turnover exploded from BDT 1.5M (March) to <strong className="text-white">BDT 262.8 Million</strong> in August across 61,764 transactions. Generates over 80% of the entire portfolio's August turnover.
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-amber-400 text-sm">Sroddhaa (1849911555)</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold text-[10px]">+351,482% Surge</span>
            </div>
            <p className="text-slate-300 mt-1">
              Account transacted only 1 payment of BDT 95 in July, and suddenly exploded to <strong className="text-white">BDT 334,003</strong> across 167 transactions in August. Immediate review required.
            </p>
          </div>
        </div>
      </div>

      {/* Anomalous Merchants Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white">Anomalous Client Accounts ({activeList.length})</h2>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                filterType === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Show All Anomalies
            </button>
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
                <th className="p-3">Sub Pillar</th>
                <th className="p-3">District</th>
                <th className="p-3 text-right">July PA</th>
                <th className="p-3 text-right">August PA</th>
                <th className="p-3 text-right">MoM Growth</th>
                <th className="p-3 text-center">Anomaly Flag</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeList.slice(0, 30).map((m) => (
                <tr key={m.walletNo} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-white truncate max-w-[200px]">{m.merchantName}</div>
                    <div className="text-[11px] text-slate-400">{m.walletNo}</div>
                  </td>
                  <td className="p-3 text-slate-300">{m.subPillar}</td>
                  <td className="p-3 text-slate-300">{m.district}</td>
                  <td className="p-3 text-right text-slate-300">{formatBDT(m.monthly[6]?.pa || 0)}</td>
                  <td className="p-3 text-right font-bold text-white">{formatBDT(m.augPA)}</td>
                  <td className="p-3 text-right">
                    {m.isNewGrowth ? (
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold text-[10px]">New</span>
                    ) : (
                      <span className={`font-bold ${m.growth >= 100 ? 'text-amber-400' : m.growth < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {formatPercent(m.growth)}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {m.flags.megaVolume ? (
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-bold text-[10px]">
                        Mega Volume
                      </span>
                    ) : m.flags.cliffDrop ? (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full font-bold text-[10px]">
                        Cliff Drop
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold text-[10px]">
                        Spike Surge
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onSelectMerchant(m)}
                      className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center space-x-1"
                    >
                      <span>Drilldown</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
