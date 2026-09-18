'use client';

import React from 'react';
import { Merchant, PortfolioStats } from '../types';
import { formatBDT, formatNumber } from '../lib/auditRules';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface OverviewTabProps {
  merchants: Merchant[];
  stats: PortfolioStats;
  onSelectMerchant: (m: Merchant) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  merchants,
  stats,
  onSelectMerchant,
  onNavigateTab,
}) => {
  // Monthly PA aggregations
  const monthlyData = [
    { month: 'Jan', pa: 2147308, pc: 1714 },
    { month: 'Feb', pa: 7974862, pc: 5085 },
    { month: 'Mar', pa: 27219665, pc: 16683 },
    { month: 'Apr', pa: 64631404, pc: 23241 },
    { month: 'May', pa: 166312641, pc: 48863 },
    { month: 'Jun', pa: 259059061, pc: 73424 },
    { month: 'Jul', pa: 321721062, pc: 97803 },
    { month: 'Aug', pa: 323887158, pc: 122150 },
  ];

  // Active status distribution
  const statusData = [
    { name: 'Active', value: stats.activeCount, color: '#10b981' },
    { name: 'Amber (Low Activity)', value: stats.amberCount, color: '#f59e0b' },
    { name: 'Zero Transacting (Dormant)', value: stats.dormantCount, color: '#f43f5e' },
  ];

  // Top high-risk merchants
  const highRiskMerchants = [...merchants]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 6);

  // Sub-pillar breakdown in August
  const pillarMap = new Map<string, number>();
  for (const m of merchants) {
    const p = m.subPillar || 'Other';
    pillarMap.set(p, (pillarMap.get(p) || 0) + m.augPA);
  }
  const pillarData = Array.from(pillarMap.entries())
    .map(([name, pa]) => ({ name, pa }))
    .sort((a, b) => b.pa - a.pa);

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Turnover Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Portfolio Monthly Turnover Trajectory</h2>
              <p className="text-xs text-slate-400">Total Payment Amount (PA) in BDT from Jan '26 to Aug '26</p>
            </div>
            <button
              onClick={() => onNavigateTab('trends')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center space-x-1"
            >
              <span>Trends Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(value: any) => [formatBDT(Number(value)), 'Total PA']}
                />
                <Bar dataKey="pa" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Client Activity Status</h2>
              <p className="text-xs text-slate-400">Portfolio health breakdown</p>
            </div>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val} merchants (${Math.round((Number(val) / stats.totalMerchants) * 100)}%)`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.name}</span>
                </div>
                <span className="font-semibold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Risk Overview & Urgent Audit Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Highest Priority Audit Cases</h2>
            </div>
            <button
              onClick={() => onNavigateTab('suspicious')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center space-x-1"
            >
              <span>View All AML Flags</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {highRiskMerchants.map((m) => (
              <div
                key={m.walletNo}
                onClick={() => onSelectMerchant(m)}
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/50 rounded-lg cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white truncate max-w-[220px]">{m.merchantName}</span>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                      Score: {m.riskScore}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                    <span>{m.walletNo}</span>
                    <span>•</span>
                    <span>{m.subPillar}</span>
                    <span>•</span>
                    <span>Aug PA: {formatBDT(m.augPA)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-200">
                    {m.flags.burstReactivation ? 'Burst Reactivation' : m.flags.singleCustomerRisk ? 'Single-Customer' : m.auditFlag}
                  </div>
                  <span className="text-[10px] text-teal-400">Inspect 360 →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar Turnover Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white tracking-tight">Turnover by Sub Pillar (August '26)</h2>
            <span className="text-xs text-slate-400">Volume share</span>
          </div>

          <div className="space-y-3.5">
            {pillarData.slice(0, 5).map((p) => {
              const pct = (p.pa / stats.augPA) * 100;
              return (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{p.name}</span>
                    <span className="text-slate-200 font-bold">{formatBDT(p.pa)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
