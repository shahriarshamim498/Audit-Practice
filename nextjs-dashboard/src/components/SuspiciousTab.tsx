'use client';

import React, { useState } from 'react';
import { Merchant } from '../types';
import { formatBDT, formatNumber } from '../lib/auditRules';
import { ShieldAlert, AlertOctagon, UserX, Zap, Search, ArrowUpRight, CheckCircle } from 'lucide-react';

interface SuspiciousTabProps {
  merchants: Merchant[];
  onSelectMerchant: (m: Merchant) => void;
}

export const SuspiciousTab: React.FC<SuspiciousTabProps> = ({ merchants, onSelectMerchant }) => {
  const [filter, setFilter] = useState<'all' | 'singleCust' | 'burst' | 'micro' | 'highRate'>('all');
  const [search, setSearch] = useState('');

  // 1. Single-customer domination (CC / PC <= 0.35 with PC >= 10)
  const singleCustList = merchants.filter((m) => m.flags.singleCustomerRisk);

  // 2. Burst reactivation from deep dormancy (dormantMonths >= 4 and Aug PA >= 50,000)
  const burstList = merchants.filter((m) => m.flags.burstReactivation);

  // 3. Micro-ticket structuring (PC >= 50 and Ticket Size < 100 BDT)
  const microList = merchants.filter((m) => m.flags.microTicketRisk);

  // 4. High-rate 10% tier volume surges
  const highRateList = merchants.filter((m) => m.flags.highRateSurge);

  const activeList = (() => {
    let list: Merchant[] = [];
    if (filter === 'singleCust') list = singleCustList;
    else if (filter === 'burst') list = burstList;
    else if (filter === 'micro') list = microList;
    else if (filter === 'highRate') list = highRateList;
    else list = merchants.filter((m) => m.riskScore >= 30 || m.flags.burstReactivation || m.flags.singleCustomerRisk || m.flags.microTicketRisk);

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
      {/* Risk Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Single-Customer Domination */}
        <div
          onClick={() => setFilter('singleCust')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === 'singleCust'
              ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Single-Customer Looping</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{singleCustList.length} Flagged</div>
          <p className="text-[11px] text-slate-400 mt-1">CC / PC ≤ 0.35 (Self-trading / churning risk)</p>
        </div>

        {/* Burst Reactivations */}
        <div
          onClick={() => setFilter('burst')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === 'burst'
              ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Dormant Burst Rebirth</span>
            <UserX className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{burstList.length} Flagged</div>
          <p className="text-[11px] text-slate-400 mt-1">Dormant ≥4 mos, suddenly >BDT 50,000</p>
        </div>

        {/* Micro-Ticket Structuring */}
        <div
          onClick={() => setFilter('micro')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === 'micro'
              ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Micro-Structuring</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{microList.length} Flagged</div>
          <p className="text-[11px] text-slate-400 mt-1">High transactions (≥50) with ticket &lt;BDT 100</p>
        </div>

        {/* High-Rate Tier (10%) Surges */}
        <div
          onClick={() => setFilter('highRate')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === 'highRate'
              ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">10% Commission Surges</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{highRateList.length} Flagged</div>
          <p className="text-[11px] text-slate-400 mt-1">High-rate tier accounts with large volume</p>
        </div>
      </div>

      {/* AML Suspicious Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-white">Suspicious Transaction Screener ({activeList.length})</h2>
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                filter === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Flags
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suspect accounts..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-3">Client Account</th>
                <th className="p-3">Pillar & Officer</th>
                <th className="p-3 text-right">Aug Volume (PA)</th>
                <th className="p-3 text-center">Txn / Cust (PC : CC)</th>
                <th className="p-3 text-center">Risk Score</th>
                <th className="p-3">Audit Red Flag Trigger</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeList.map((m) => {
                const ratio = m.augPC > 0 ? (m.augCC / m.augPC).toFixed(2) : 'N/A';
                return (
                  <tr key={m.walletNo} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-white truncate max-w-[200px]">{m.merchantName}</div>
                      <div className="text-[11px] text-slate-400">{m.walletNo} ({m.walletType})</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-200">{m.subPillar}</div>
                      <div className="text-[11px] text-slate-400">{m.maoName}</div>
                    </td>
                    <td className="p-3 text-right font-bold text-white">{formatBDT(m.augPA)}</td>
                    <td className="p-3 text-center">
                      <span className="font-semibold text-slate-200">{m.augPC} txns : {m.augCC} cust</span>
                      <div className="text-[10px] text-slate-400">Ratio: {ratio}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          m.riskScore >= 50
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : m.riskScore >= 30
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        }`}
                      >
                        {m.riskScore} / 100
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {m.flags.singleCustomerRisk && (
                          <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-semibold">
                            Single Customer
                          </span>
                        )}
                        {m.flags.burstReactivation && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-semibold">
                            Burst Reactivation
                          </span>
                        )}
                        {m.flags.microTicketRisk && (
                          <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-semibold">
                            Micro-Structuring
                          </span>
                        )}
                        {m.flags.highRateSurge && (
                          <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-semibold">
                            10% Rate Tier
                          </span>
                        )}
                        {m.auditFlag === 'Sudden Reactivation - Review' && !m.flags.burstReactivation && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-semibold">
                            Sudden Reactivation
                          </span>
                        )}
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
