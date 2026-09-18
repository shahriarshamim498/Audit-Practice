'use client';

import React, { useState, useMemo } from 'react';
import { Merchant } from '../types';
import { formatBDT, formatNumber, formatPercent } from '../lib/auditRules';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUpRight } from 'lucide-react';

interface MerchantTableProps {
  merchants: Merchant[];
  onSelectMerchant: (m: Merchant) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const MerchantTable: React.FC<MerchantTableProps> = ({
  merchants,
  onSelectMerchant,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [selectedFlag, setSelectedFlag] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<keyof Merchant>('augPA');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 25;

  // Filter options
  const pillars = useMemo(() => {
    const set = new Set<string>();
    merchants.forEach((m) => { if (m.subPillar) set.add(m.subPillar); });
    return Array.from(set).sort();
  }, [merchants]);

  const flags = useMemo(() => {
    const set = new Set<string>();
    merchants.forEach((m) => { if (m.auditFlag) set.add(m.auditFlag); });
    return Array.from(set).sort();
  }, [merchants]);

  // Filtered and sorted dataset
  const filteredMerchants = useMemo(() => {
    return merchants
      .filter((m) => {
        if (selectedPillar !== 'ALL' && m.subPillar !== selectedPillar) return false;
        if (selectedFlag !== 'ALL' && m.auditFlag !== selectedFlag) return false;
        if (selectedStatus !== 'ALL' && m.augActive !== selectedStatus) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const match =
            m.merchantName.toLowerCase().includes(q) ||
            m.walletNo.includes(q) ||
            m.maoName.toLowerCase().includes(q) ||
            m.district.toLowerCase().includes(q) ||
            m.subCategory.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy];
        let valB: any = b[sortBy];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [merchants, selectedPillar, selectedFlag, selectedStatus, searchQuery, sortBy, sortAsc]);

  const totalPages = Math.ceil(filteredMerchants.length / pageSize) || 1;
  const paginatedList = filteredMerchants.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: keyof Merchant) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-4 p-5">
      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub Pillar Filter */}
          <select
            value={selectedPillar}
            onChange={(e) => { setSelectedPillar(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Pillars ({merchants.length})</option>
            {pillars.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Audit Flag Filter */}
          <select
            value={selectedFlag}
            onChange={(e) => { setSelectedFlag(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Audit Flags</option>
            {flags.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Amber">Amber</option>
            <option value="Zero Transacting">Zero Transacting</option>
          </select>

          {(selectedPillar !== 'ALL' || selectedFlag !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedPillar('ALL');
                setSelectedFlag('ALL');
                setSelectedStatus('ALL');
                onSearchChange('');
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { onSearchChange(e.target.value); setPage(1); }}
            placeholder="Search merchant, wallet, officer, district..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
        <span>Showing {filteredMerchants.length} matching client records</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider select-none">
              <th onClick={() => handleSort('merchantName')} className="p-3 cursor-pointer hover:text-white">
                <div className="flex items-center space-x-1">
                  <span>Merchant & Wallet</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('subPillar')} className="p-3 cursor-pointer hover:text-white">
                <div className="flex items-center space-x-1">
                  <span>Pillar / Officer</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('augPA')} className="p-3 text-right cursor-pointer hover:text-white">
                <div className="flex items-center justify-end space-x-1">
                  <span>Aug PA (BDT)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('augPC')} className="p-3 text-right cursor-pointer hover:text-white">
                <div className="flex items-center justify-end space-x-1">
                  <span>Aug PC</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('avgTicketSize')} className="p-3 text-right cursor-pointer hover:text-white">
                <div className="flex items-center justify-end space-x-1">
                  <span>Avg Ticket</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('growth')} className="p-3 text-right cursor-pointer hover:text-white">
                <div className="flex items-center justify-end space-x-1">
                  <span>Growth</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('dormantMonths')} className="p-3 text-center cursor-pointer hover:text-white">
                <div className="flex items-center justify-center space-x-1">
                  <span>Dormancy</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('riskScore')} className="p-3 text-center cursor-pointer hover:text-white">
                <div className="flex items-center justify-center space-x-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3">Audit Flag</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedList.map((m) => (
              <tr
                key={m.walletNo}
                onClick={() => onSelectMerchant(m)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="p-3">
                  <div className="font-semibold text-white truncate max-w-[220px]">{m.merchantName}</div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <span>{m.walletNo}</span>
                    <span>•</span>
                    <span>{m.walletType} ({m.rate})</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-slate-200">{m.subPillar}</div>
                  <div className="text-[11px] text-slate-400">{m.maoName}</div>
                </td>
                <td className="p-3 text-right font-bold text-white">{formatBDT(m.augPA)}</td>
                <td className="p-3 text-right text-slate-300 font-mono">{formatNumber(m.augPC)}</td>
                <td className="p-3 text-right text-slate-300 font-mono">{formatBDT(m.avgTicketSize)}</td>
                <td className="p-3 text-right">
                  {m.isNewGrowth ? (
                    <span className="text-[10px] text-slate-400">New</span>
                  ) : (
                    <span className={`font-semibold ${m.growth > 0 ? 'text-teal-400' : m.growth < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {formatPercent(m.growth)}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center font-semibold text-slate-300">
                  {m.dormantMonths} mos
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
                    {m.riskScore}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      m.auditFlag === 'Sudden Reactivation - Review'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : m.auditFlag === 'High Dormancy - Review'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : m.auditFlag === 'Healthy/Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {m.auditFlag}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center space-x-0.5">
                    <span>360</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 rounded-lg text-xs text-white flex items-center space-x-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="text-xs text-slate-400">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 rounded-lg text-xs text-white flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
