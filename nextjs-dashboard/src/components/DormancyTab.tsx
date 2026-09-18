'use client';

import React, { useState } from 'react';
import { Merchant } from '../types';
import { formatBDT, formatNumber } from '../lib/auditRules';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserX, Clock, RefreshCw, AlertTriangle, ArrowUpRight, Search } from 'lucide-react';

interface DormancyTabProps {
  merchants: Merchant[];
  onSelectMerchant: (m: Merchant) => void;
}

export const DormancyTab: React.FC<DormancyTabProps> = ({ merchants, onSelectMerchant }) => {
  const [filterView, setFilterView] = useState<'all' | 'sudden' | 'deep'>('all');
  const [search, setSearch] = useState('');

  // 1. Dormant Months Distribution (0 to 7)
  const dormantBuckets = [
    { name: '0 mos (Active)', count: 0 },
    { name: '1 mo', count: 0 },
    { name: '2 mos', count: 0 },
    { name: '3 mos', count: 0 },
    { name: '4 mos', count: 0 },
    { name: '5 mos', count: 0 },
    { name: '6 mos', count: 0 },
    { name: '7 mos (Deep)', count: 0 },
  ];

  for (const m of merchants) {
    const idx = Math.min(7, Math.max(0, Math.round(m.dormantMonths)));
    if (!isNaN(idx) && dormantBuckets[idx]) {
      dormantBuckets[idx].count++;
    }
  }

  // 2. Sudden Reactivation Review Queue
  const suddenReactivationList = merchants.filter(
    (m) => m.auditFlag === 'Sudden Reactivation - Review' || m.flags.burstReactivation
  );

  // 3. Deep Dormancy (dormantMonths >= 5)
  const deepDormancyList = merchants.filter((m) => m.dormantMonths >= 5 && m.augPA === 0);

  // 4. Zero Dormancy (Active every month since onboarding)
  const zeroDormancyList = merchants.filter((m) => (m.dormantMonths || 0) === 0);

  // 5. High Dormancy (dormantMonths >= 4 of actual tenure)
  const highDormancyList = merchants.filter((m) => m.auditFlag === 'High Dormancy - Review' || m.dormantMonths >= 4);

  const activeList = (() => {
    let list = merchants;
    if (filterView === 'sudden') list = suddenReactivationList;
    else if (filterView === 'deep') list = deepDormancyList;
    else list = merchants.filter((m) => (m.dormantMonths || 0) >= 3 || m.auditFlag.includes('Review') || m.auditFlag.includes('Inactive') || m.flags.burstReactivation);

    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (m) =>
        m.merchantName.toLowerCase().includes(q) ||
        m.walletNo.includes(q) ||
        m.maoName.toLowerCase().includes(q)
    );
  })();

  return (
    <div className="space-y-6">
      {/* Notice Banner for Tenure-Adjusted Model */}
      <div className="p-4 bg-teal-950/30 border border-teal-500/40 rounded-xl flex items-start space-x-3 text-xs">
        <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-teal-300">Tenure-Adjusted Dormancy Audit Applied:</span>
          <span className="text-slate-300 ml-1">
            Dormancy is calculated strictly starting from each client&apos;s <strong>bKash Registration / Onboarding Month</strong> forward. Months prior to registration are classified as <em>Pre-Onboarding</em> rather than penalizing accounts as dormant.
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterView('all')}
          className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/50 shadow-sm cursor-pointer hover:border-emerald-500/80 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Zero Dormancy (Active)</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{zeroDormancyList.length} Accounts</div>
          <p className="text-xs text-slate-400 mt-1">Transacting every month since registration</p>
        </div>

        <div
          onClick={() => setFilterView('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterView === 'all'
              ? 'bg-slate-800 border-teal-500/80 shadow-lg shadow-teal-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Dormancy (4+ Mos)</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white">{highDormancyList.length} Accounts</div>
          <p className="text-xs text-slate-400 mt-1">Dormant &ge;4 months of actual tenure</p>
        </div>

        <div
          onClick={() => setFilterView('sudden')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterView === 'sudden'
              ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Sudden Reactivations</span>
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{suddenReactivationList.length} Queue</div>
          <p className="text-xs text-slate-400 mt-1">Active in August after prolonged dormancy</p>
        </div>

        <div
          onClick={() => setFilterView('deep')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterView === 'deep'
              ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Deep Dormancy (5+ Mos)</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{deepDormancyList.length} Accounts</div>
          <p className="text-xs text-slate-400 mt-1">Zero turnover for &ge;5 consecutive months</p>
        </div>
      </div>

      {/* Dormancy Duration Histogram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-white tracking-tight">Post-Onboarding Dormancy Histogram (Jan - Aug &apos;26)</h2>
          <span className="text-xs text-teal-400 font-semibold">Evaluated from Registration Date</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Number of client accounts by cumulative dormant months since onboarding</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dormantBuckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val: any) => [`${val} client accounts`, 'Accounts']}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dormancy Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Tenure-Adjusted Dormancy Review Queue ({activeList.length})</h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dormant accounts..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-3">Merchant Name</th>
                <th className="p-3">Wallet No</th>
                <th className="p-3">Officer</th>
                <th className="p-3 text-center">Registration Date</th>
                <th className="p-3 text-center">Tenure</th>
                <th className="p-3 text-center">Dormancy</th>
                <th className="p-3 text-center">Aug Status</th>
                <th className="p-3 text-right">August PA</th>
                <th className="p-3">Audit Review Flag</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeList.slice(0, 35).map((m) => (
                <tr key={m.walletNo} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-white truncate max-w-[200px]">{m.merchantName}</td>
                  <td className="p-3 text-slate-300 font-mono text-[11px]">{m.walletNo}</td>
                  <td className="p-3 text-slate-300">{m.maoName}</td>
                  <td className="p-3 text-center text-slate-300 font-medium">{m.regDate || 'N/A'}</td>
                  <td className="p-3 text-center">
                    <span className="text-teal-400 font-bold">{m.tenureMonths || 8} mos</span>
                    <div className="text-[10px] text-slate-500">M{m.onboardMonth || 1} to M8</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-bold ${m.dormantMonths >= 4 ? 'text-rose-400' : m.dormantMonths > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {m.dormantMonths} mos
                    </span>
                    {(m.preOnboardingMonths || 0) > 0 && (
                      <div className="text-[10px] text-slate-500">({m.preOnboardingMonths}m pre)</div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        m.augActive === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : m.augActive === 'Amber'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {m.augActive}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-white">{formatBDT(m.augPA)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        m.auditFlag.includes('Review') || m.auditFlag.includes('Inactive')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {m.auditFlag}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onSelectMerchant(m)}
                      className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center space-x-1"
                    >
                      <span>Review</span>
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
