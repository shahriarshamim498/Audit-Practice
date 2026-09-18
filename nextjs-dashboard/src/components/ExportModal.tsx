'use client';

import React, { useState } from 'react';
import { Merchant } from '../types';
import { X, Download, FileSpreadsheet, ShieldAlert, Clock, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: Merchant[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, merchants }) => {
  const [downloadedType, setDownloadedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadCSV = (data: Merchant[], filename: string, typeKey: string) => {
    const headers = [
      'Wallet No',
      'Merchant Name',
      'Sub Pillar',
      'District',
      'Acquisition Officer',
      'Rate',
      'August PA',
      'August PC',
      'August CC',
      'Avg Ticket Size',
      'MoM Growth',
      'Dormant Months',
      'Risk Score',
      'Audit Flag',
      'Single Cust Risk',
      'Burst Reactivation',
      'Growth Spike',
      'Cliff Drop',
      'Total PA (8 Mos)',
    ];

    const rows = data.map((m) => [
      `"${m.walletNo}"`,
      `"${m.merchantName.replace(/"/g, '""')}"`,
      `"${m.subPillar}"`,
      `"${m.district}"`,
      `"${m.maoName}"`,
      `"${m.rate}"`,
      m.augPA,
      m.augPC,
      m.augCC,
      m.avgTicketSize,
      m.isNewGrowth ? 'New' : `${m.growth}%`,
      m.dormantMonths,
      m.riskScore,
      `"${m.auditFlag}"`,
      m.flags.singleCustomerRisk ? 'YES' : 'NO',
      m.flags.burstReactivation ? 'YES' : 'NO',
      m.flags.growthSpike ? 'YES' : 'NO',
      m.flags.cliffDrop ? 'YES' : 'NO',
      m.totalPA,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedType(typeKey);
    setTimeout(() => setDownloadedType(null), 3000);
  };

  const handleExportFlagged = () => {
    const flagged = merchants.filter(
      (m) => m.riskScore >= 30 || m.flags.burstReactivation || m.flags.singleCustomerRisk || m.flags.growthSpike
    );
    downloadCSV(flagged, 'Audit_Flagged_Suspicious_Merchants', 'flagged');
  };

  const handleExportDormant = () => {
    const dormant = merchants.filter((m) => m.dormantMonths >= 4 || m.auditFlag.includes('Review'));
    downloadCSV(dormant, 'Audit_Dormant_AtRisk_Merchants', 'dormant');
  };

  const handleExportAll = () => {
    downloadCSV(merchants, 'Audit_Master_Client_Dataset', 'all');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Export Audit Workpapers</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Export standardized CSV workpapers ready for internal review, regulatory submission, or Excel pivot analysis.
        </p>

        <div className="space-y-3">
          {/* Option 1: Suspicious / AML Flags */}
          <div
            onClick={handleExportFlagged}
            className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg group-hover:bg-rose-500/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Flagged & Suspicious Accounts</div>
                <div className="text-[11px] text-slate-400">High-risk, burst reactivations, single-customer</div>
              </div>
            </div>
            {downloadedType === 'flagged' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            )}
          </div>

          {/* Option 2: Dormancy Queue */}
          <div
            onClick={handleExportDormant}
            className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">High Dormancy & Review Queue</div>
                <div className="text-[11px] text-slate-400">All accounts dormant ≥4 months or flagged</div>
              </div>
            </div>
            {downloadedType === 'dormant' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            )}
          </div>

          {/* Option 3: Full Master Cleaned Dataset */}
          <div
            onClick={handleExportAll}
            className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg group-hover:bg-teal-500/20">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Complete Master Dataset (961 Clients)</div>
                <div className="text-[11px] text-slate-400">Includes all calculated scores and audit flags</div>
              </div>
            </div>
            {downloadedType === 'all' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
