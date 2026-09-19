'use client';

import React from 'react';
import { Merchant } from '../types';
import { formatBDT, formatNumber, formatPercent, INDUSTRY_DEFINITIONS } from '../lib/auditRules';
import { X, ShieldAlert, AlertTriangle, UserCheck, Calendar, MapPin, Tag, Percent, ArrowUpRight, CheckSquare, Building2, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MerchantDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

export const MerchantDrawer: React.FC<MerchantDrawerProps> = ({ merchant, onClose }) => {
  if (!merchant) return null;

  const monthlyChartData = merchant.monthly.map((m) => ({
    month: m.month,
    pa: m.pa,
    pc: m.pc,
    ticketSize: m.ticketSize,
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-stretch sm:justify-end transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl bg-slate-900 border-t sm:border-t-0 sm:border-l border-slate-800 rounded-t-3xl sm:rounded-none max-h-[90vh] sm:max-h-full h-full shadow-2xl overflow-y-auto flex flex-col z-10">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Drawer Header */}
        <div className="px-5 py-4 sm:p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10 flex items-start justify-between">
          <div className="space-y-1 pr-3">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Wallet: {merchant.walletNo}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {merchant.walletType} ({merchant.rate})
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  merchant.riskScore >= 50
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : merchant.riskScore >= 30
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                Risk Score: {merchant.riskScore}/100
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{merchant.merchantName}</h2>
            <p className="text-xs text-slate-400 flex items-center space-x-2">
              <span>{merchant.subCategory}</span>
              <span>•</span>
              <span>{merchant.subPillar}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Key Metrics Quick Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400">Aug PA</span>
              <div className="text-sm font-bold text-white mt-0.5">{formatBDT(merchant.augPA)}</div>
            </div>
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400">Aug PC</span>
              <div className="text-sm font-bold text-white mt-0.5">{formatNumber(merchant.augPC)}</div>
            </div>
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400">Avg Ticket</span>
              <div className="text-sm font-bold text-teal-400 mt-0.5">{formatBDT(merchant.avgTicketSize)}</div>
            </div>
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400">Growth</span>
              <div className="text-sm font-bold text-white mt-0.5">
                {merchant.isNewGrowth ? 'New' : formatPercent(merchant.growth)}
              </div>
            </div>
          </div>

          {/* 8-Month Turnover Chart */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-white mb-1">Monthly Transaction History (Jan - Aug '26)</h3>
            <p className="text-[11px] text-slate-400 mb-3">Payment Amount progression in BDT</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: any) => [formatBDT(Number(val)), 'Turnover']}
                  />
                  <Bar dataKey="pa" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Triggered Audit Flags & Rationale */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Triggered Risk & Audit Indicators</h3>
            <div className="space-y-2">
              {merchant.flags.burstReactivation && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg text-xs">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Dormant Burst Reactivation Triggered</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Account had {merchant.dormantMonths} dormant months, then suddenly processed {formatBDT(merchant.augPA)} in August. Possible sleeper account reactivation.
                  </p>
                </div>
              )}

              {merchant.flags.singleCustomerRisk && (
                <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg text-xs">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Single-Customer Domination / Looping Triggered</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Customer-to-transaction ratio is low ({merchant.augCC} customers for {merchant.augPC} transactions). High probability of self-funding or volume churning.
                  </p>
                </div>
              )}

              {merchant.flags.growthSpike && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg text-xs">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Extreme MoM Growth Surge (+{merchant.growth}%)</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Turnover jumped dramatically compared to the previous month. Requires verification of sales surge legitimacy.
                  </p>
                </div>
              )}

              {merchant.flags.megaVolume && (
                <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg text-xs">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Mega-Volume Portfolio Concentration</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Volume represents an extreme outlier in portfolio turnover (Total PA: {formatBDT(merchant.totalPA)}).
                  </p>
                </div>
              )}

              {merchant.auditFlag && merchant.auditFlag !== 'Unflagged' && (
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-lg text-xs flex items-center justify-between">
                  <span className="text-slate-300">System Master Audit Flag:</span>
                  <span className="font-bold text-teal-400">{merchant.auditFlag}</span>
                </div>
              )}
            </div>
          </div>

          {/* Industry Benchmark & Sector Intelligence */}
          {(() => {
            const ind = merchant.industry || INDUSTRY_DEFINITIONS.GENERAL_RETAIL;
            const indAnom = merchant.industryAnomaly;
            const isSurgeBreach = merchant.growth > ind.typicalGrowthMax && !merchant.isNewGrowth;
            const isTicketAnomaly = merchant.avgTicketSize > ind.typicalTicketMax || (merchant.avgTicketSize < ind.typicalTicketMin && merchant.augPC >= 10);
            const isDiversityAnom = indAnom?.diversityStatus === 'CONCENTRATED';

            return (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Industry Baseline & Sector Intelligence</h3>
                <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ind.badgeClass}`}>
                          {ind.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Matched Pattern</span>
                      </div>
                      <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">{ind.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MoM Ceiling</span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-white">{merchant.isNewGrowth ? 'New' : formatPercent(merchant.growth)}</span>
                        <span className="text-[10px] text-slate-400">&le;+{ind.typicalGrowthMax}% max</span>
                      </div>
                      <div>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          merchant.isNewGrowth ? 'bg-slate-800 text-slate-300' :
                          isSurgeBreach ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {merchant.isNewGrowth ? 'Onboarding' : isSurgeBreach ? '⚠️ Surge Breach' : '✅ Compliant'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Range</span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-white">{formatBDT(merchant.avgTicketSize)}</span>
                        <span className="text-[10px] text-slate-400">{formatNumber(ind.typicalTicketMin)}-{formatNumber(ind.typicalTicketMax)}</span>
                      </div>
                      <div>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          isTicketAnomaly ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {isTicketAnomaly ? '⚠️ Out of Range' : '✅ Standard'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diversity</span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-white">{merchant.augPC > 0 ? Math.round((merchant.augCC / merchant.augPC) * 100) : 0}%</span>
                        <span className="text-[10px] text-slate-400">&ge;{Math.round(ind.expectedDiversityRatio * 100)}% target</span>
                      </div>
                      <div>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          isDiversityAnom ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {isDiversityAnom ? '⚠️ Concentrated' : '✅ Organic'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-2.5 bg-slate-900/70 border ${indAnom?.isAnomaly ? 'border-amber-500/30 bg-amber-950/10' : 'border-slate-800'} rounded-lg text-xs space-y-1`}>
                    <div className={`font-bold ${indAnom?.isAnomaly ? 'text-amber-400' : 'text-slate-300'} flex items-center space-x-1.5`}>
                      <Info className="w-3.5 h-3.5" />
                      <span>Sector Audit Rationale</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {ind.benchmarkRationale}
                    </p>
                    {indAnom?.isAnomaly && (
                      <div className="mt-1.5 pt-1.5 border-t border-amber-500/20 text-[11px] text-amber-200">
                        <strong>Triggered Sector Exception:</strong> {indAnom.reasons.join('; ')}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-teal-300/90 bg-teal-950/20 border border-teal-500/30 rounded-lg p-2.5">
                    <strong className="text-teal-400 block mb-0.5">Recommended Sector Inquiries:</strong>
                    {ind.auditFocus}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Account Profile & Demographics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Information</h3>
            <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Acquisition Officer (MAO):</span>
                <span className="font-semibold text-white">{merchant.maoName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Territory (ISD/OSD):</span>
                <span className="font-semibold text-white">{merchant.isdOsd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">District:</span>
                <span className="font-semibold text-white">{merchant.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Type:</span>
                <span className="font-semibold text-white">{merchant.leadType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registration Date:</span>
                <span className="font-semibold text-teal-400">{merchant.regDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Evaluation Tenure:</span>
                <span className="font-semibold text-white">{merchant.tenureMonths || 8} month(s) (Month {merchant.onboardMonth || 1} to 8)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pre-Onboarding Months:</span>
                <span className="font-semibold text-slate-400">{merchant.preOnboardingMonths || 0} month(s) (Prior to Registration)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">True Post-Onboard Dormancy:</span>
                <span className={`font-bold ${merchant.dormantMonths >= 4 ? 'text-rose-400' : merchant.dormantMonths > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {merchant.dormantMonths} month(s)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-0.5">Address:</span>
                <span className="text-slate-200">{merchant.address}</span>
              </div>
            </div>
          </div>

          {/* Audit Checklist */}
          <div className="p-4 bg-teal-950/20 border border-teal-500/30 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-teal-400 flex items-center space-x-1.5">
              <CheckSquare className="w-4 h-4" />
              <span>Recommended Auditor Action Checklist</span>
            </h4>
            <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc pl-4">
              <li>Review bank reconciliation and merchant settlement statements for August.</li>
              <li>Inspect transaction logs to verify diverse paying customer identities.</li>
              <li>Confirm valid physical / e-commerce business operations at registered address.</li>
              <li>Verify commission contract rate tier ({merchant.rate}) application.</li>
            </ul>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
