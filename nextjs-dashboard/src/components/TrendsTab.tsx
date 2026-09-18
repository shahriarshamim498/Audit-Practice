'use client';

import React, { useState } from 'react';
import { Merchant, PortfolioStats } from '../types';
import { formatBDT, formatNumber } from '../lib/auditRules';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TrendsTabProps {
  merchants: Merchant[];
  stats: PortfolioStats;
}

export const TrendsTab: React.FC<TrendsTabProps> = ({ merchants, stats }) => {
  const [activeMetric, setActiveMetric] = useState<'pa' | 'pc' | 'ts'>('pa');

  // Aggregated monthly series
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const monthlyAggregates = months.map((m, idx) => {
    let pa = 0;
    let pc = 0;
    let cc = 0;
    for (const merch of merchants) {
      if (merch.monthly && merch.monthly[idx]) {
        pa += merch.monthly[idx].pa;
        pc += merch.monthly[idx].pc;
        cc += merch.monthly[idx].cc;
      }
    }
    const ts = pc > 0 ? pa / pc : 0;
    return { month: m, pa, pc, cc, ts };
  });

  // District distribution
  const districtMap = new Map<string, { pa: number; count: number }>();
  for (const m of merchants) {
    const dist = m.district && m.district !== '#N/A' ? m.district : 'OTHER';
    const curr = districtMap.get(dist) || { pa: 0, count: 0 };
    curr.pa += m.augPA;
    curr.count += 1;
    districtMap.set(dist, curr);
  }
  const topDistricts = Array.from(districtMap.entries())
    .map(([district, data]) => ({ district, pa: data.pa, count: data.count }))
    .sort((a, b) => b.pa - a.pa)
    .slice(0, 7);

  // MAO (Officer) performance
  const maoMap = new Map<string, { pa: number; count: number; active: number }>();
  for (const m of merchants) {
    const mao = m.maoName || 'Unassigned';
    const curr = maoMap.get(mao) || { pa: 0, count: 0, active: 0 };
    curr.pa += m.augPA;
    curr.count += 1;
    if (m.augActive === 'Active') curr.active += 1;
    maoMap.set(mao, curr);
  }
  const topMAOs = Array.from(maoMap.entries())
    .map(([mao, data]) => ({
      mao,
      pa: data.pa,
      count: data.count,
      activeRate: Math.round((data.active / data.count) * 100),
    }))
    .sort((a, b) => b.pa - a.pa);

  return (
    <div className="space-y-6">
      {/* Metric Selector & Main Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">8-Month Macro Growth Trend (Jan '26 - Aug '26)</h2>
            <p className="text-xs text-slate-400">Time-series progression across the entire client portfolio</p>
          </div>

          <div className="inline-flex p-1 bg-slate-800 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveMetric('pa')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeMetric === 'pa' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Turnover (PA)
            </button>
            <button
              onClick={() => setActiveMetric('pc')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeMetric === 'pc' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Transactions (PC)
            </button>
            <button
              onClick={() => setActiveMetric('ts')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeMetric === 'ts' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Avg Ticket Size
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyAggregates} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => {
                  if (activeMetric === 'pa') return `${(v / 1000000).toFixed(0)}M`;
                  if (activeMetric === 'pc') return `${(v / 1000).toFixed(0)}k`;
                  return `${v}`;
                }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val: any) => [
                  activeMetric === 'pa' ? formatBDT(Number(val)) : activeMetric === 'pc' ? formatNumber(Number(val)) : `BDT ${Math.round(Number(val))}`,
                  activeMetric === 'pa' ? 'Total Turnover' : activeMetric === 'pc' ? 'Transaction Count' : 'Avg Ticket Size'
                ]}
              />
              <Area type="monotone" dataKey={activeMetric} stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District & MAO Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white mb-1">Top Districts by Turnover (August '26)</h2>
          <p className="text-xs text-slate-400 mb-4">Volume concentration and client count</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDistricts} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <YAxis type="category" dataKey="district" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [formatBDT(Number(val)), 'August PA']}
                />
                <Bar dataKey="pa" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAO Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white mb-1">Acquisition Officer (MAO) Performance</h2>
          <p className="text-xs text-slate-400 mb-4">Client portfolio turnover and active account retention</p>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {topMAOs.map((mao) => (
              <div key={mao.mao} className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">{mao.mao}</div>
                  <div className="text-[11px] text-slate-400">{mao.count} total accounts managed</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-teal-400">{formatBDT(mao.pa)}</div>
                  <div className="text-[11px] text-emerald-400">{mao.activeRate}% active rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
