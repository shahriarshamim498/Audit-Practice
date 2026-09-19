'use client';

import React from 'react';
import { Merchant } from '../types';
import { calculateMAOComplianceStats } from '../lib/auditRules';
import { Award, Crown, Clock, ShieldCheck, BarChart3, Filter, Check } from 'lucide-react';

interface MAOScorecardTabProps {
  merchants: Merchant[];
  selectedMAO: string;
  onSelectMAO: (mao: string) => void;
}

export const MAOScorecardTab: React.FC<MAOScorecardTabProps> = ({
  merchants,
  selectedMAO,
  onSelectMAO,
}) => {
  const maoStats = calculateMAOComplianceStats(merchants);
  if (!maoStats.length) return null;

  const topOfficer = maoStats[0];
  const lowestDormant = [...maoStats].sort((a, b) => a.dormantPct - b.dormantPct)[0];
  const lowestAML = [...maoStats].sort((a, b) => a.amlPct - b.amlPct)[0];
  const avgScore = (maoStats.reduce((sum, o) => sum + o.score, 0) / maoStats.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Acquisition Officer (MAO) Compliance & Quality Scorecard
              </h2>
              <p className="text-xs text-slate-400">
                Objective portfolio health evaluation based on healthy merchant ratio, active retention, dormancy containment & AML safety — independent of raw volume.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30 self-start sm:self-auto">
            {maoStats.length} Officers Evaluated
          </span>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span>Top Compliance Officer</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white truncate" title={topOfficer.name}>
            {topOfficer.name}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Score: {topOfficer.score}
            </span>
            <span className="text-slate-400">{topOfficer.healthyPct.toFixed(1)}% Healthy</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-teal-950/20 border-teal-500/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-400">
            <span>Lowest Dormancy Rate</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white truncate" title={lowestDormant.name}>
            {lowestDormant.name}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              {lowestDormant.dormantPct.toFixed(1)}% Dormant
            </span>
            <span className="text-slate-400">{lowestDormant.dormant} of {lowestDormant.total} accts</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-cyan-950/20 border-cyan-500/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
            <span>Cleanest AML Record</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white truncate" title={lowestAML.name}>
            {lowestAML.name}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {lowestAML.amlPct.toFixed(1)}% AML Risk
            </span>
            <span className="text-slate-400">{lowestAML.amlRisk} flagged</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-indigo-950/20 border-indigo-500/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
            <span>Portfolio Quality Avg</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgScore} / 100</div>
          <div className="text-xs text-slate-400">Across {maoStats.length} field officers</div>
        </div>
      </div>

      {/* Officer Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Officer Quality Rankings</h3>
          <span className="text-xs text-slate-400">Ranked by Compliance Quality Score</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maoStats.map((o) => {
            const isSelected = selectedMAO === o.name;
            const medalIcon = o.rank === 1 ? '🥇' : o.rank === 2 ? '🥈' : o.rank === 3 ? '🥉' : `#${o.rank}`;

            return (
              <div
                key={o.name}
                className={`bg-slate-900 border ${
                  isSelected ? 'border-teal-500 ring-1 ring-teal-500/50 shadow-md' : 'border-slate-800'
                } rounded-2xl p-5 space-y-4 transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg font-bold text-amber-400">{medalIcon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{o.name}</h4>
                      <p className="text-xs text-slate-400">{o.total} merchants managed</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-extrabold text-teal-400">{o.score}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${o.gradeBadge}`}>
                      Grade {o.grade}
                    </span>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-400 font-medium">Healthy Portfolio</span>
                      <span className="text-slate-300 font-bold">{o.healthyPct.toFixed(1)}% ({o.healthy} accts)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${o.healthyPct}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-teal-400 font-medium">Active Retention</span>
                      <span className="text-slate-300 font-bold">{o.activePct.toFixed(1)}% ({o.active} accts)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${o.activePct}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-amber-400 font-medium">Dormancy Rate</span>
                      <span className="text-slate-300 font-bold">{o.dormantPct.toFixed(1)}% ({o.dormant} accts)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${o.dormantPct}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-rose-400 font-medium">AML / Suspicious Risk</span>
                      <span className="text-slate-300 font-bold">{o.amlPct.toFixed(1)}% ({o.amlRisk} accts)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, o.amlPct * 5)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[170px]" title={o.auditVerdict}>
                    {o.auditVerdict}
                  </span>
                  <button
                    onClick={() => onSelectMAO(isSelected ? 'ALL' : o.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      isSelected ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 text-teal-400 hover:bg-slate-700'
                    }`}
                  >
                    <span>{isSelected ? 'Active Filter' : 'Filter MAO'}</span>
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Filter className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Officer Compliance Comparison Matrix</h3>
            <p className="text-xs text-slate-400">Comprehensive breakdown across all 6 Acquisition Officers</p>
          </div>
          {selectedMAO !== 'ALL' && (
            <button
              onClick={() => onSelectMAO('ALL')}
              className="text-xs text-teal-400 hover:underline font-semibold"
            >
              Clear Filter ({selectedMAO})
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-3 text-center">Rank</th>
                <th className="p-3">Acquisition Officer (MAO)</th>
                <th className="p-3 text-center">Compliance Score</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-center">Healthy Rate</th>
                <th className="p-3 text-center">Active Rate</th>
                <th className="p-3 text-center">Dormant Rate</th>
                <th className="p-3 text-center">AML Risk Rate</th>
                <th className="p-3 text-center">Sudden React.</th>
                <th className="p-3 text-right">Accounts</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {maoStats.map((o) => {
                const isSelected = selectedMAO === o.name;
                return (
                  <tr key={o.name} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-teal-950/20' : ''}`}>
                    <td className="p-3 text-center font-bold text-amber-400">#{o.rank}</td>
                    <td className="p-3">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>{o.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            Filtered
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{o.total} merchants managed</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-sm font-extrabold text-teal-400">{o.score}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${o.gradeBadge}`}>
                        Grade {o.grade}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-emerald-400">{o.healthyPct.toFixed(1)}%</span>
                      <div className="text-[10px] text-slate-400">{o.healthy} accts</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-teal-300">{o.activePct.toFixed(1)}%</span>
                      <div className="text-[10px] text-slate-400">{o.active} accts</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${o.dormantPct > 30 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {o.dormantPct.toFixed(1)}%
                      </span>
                      <div className="text-[10px] text-slate-400">{o.dormant} accts</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${o.amlPct > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {o.amlPct.toFixed(1)}%
                      </span>
                      <div className="text-[10px] text-slate-400">{o.amlRisk} flagged</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-slate-300">{o.suddenReactPct.toFixed(1)}%</span>
                      <div className="text-[10px] text-slate-400">{o.suddenReact} accts</div>
                    </td>
                    <td className="p-3 text-right font-medium text-slate-300">{o.total}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onSelectMAO(isSelected ? 'ALL' : o.name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          isSelected ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 text-teal-400 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Clear Filter' : 'Filter Dashboard'}
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
