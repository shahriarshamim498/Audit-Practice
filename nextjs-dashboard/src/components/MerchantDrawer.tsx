'use client';

import React from 'react';
import { Merchant } from '../types';
import { formatBDT, formatNumber, formatPercent } from '../lib/auditRules';
import { X, ShieldAlert, AlertTriangle, UserCheck, Calendar, MapPin, Tag, Percent, ArrowUpRight, CheckSquare } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl overflow-y-auto flex flex-col">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
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
