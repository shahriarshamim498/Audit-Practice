// Client Transaction Audit Dashboard Engine
let merchants = [];
let filteredExplorerMerchants = [];
let currentExplorerPage = 1;
const explorerPageSize = 25;
let currentSortField = 'augPA';
let isSortAsc = false;
let currentTrendMetric = 'pa';
let selectedGlobalMAO = 'ALL';

function getActiveMerchants() {
  if (selectedGlobalMAO === 'ALL') return merchants;
  return merchants.filter(m => m.maoName === selectedGlobalMAO);
}

let overviewTurnoverChartInst = null;
let overviewStatusChartInst = null;
let macroTrendChartInst = null;
let districtTrendChartInst = null;
let dormancyHistogramChartInst = null;
let drawerChartInst = null;

let currentTheme = localStorage.getItem('audit_theme') || 'dark';

function getChartColors() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    grid: isDark ? '#1e293b' : '#e2e8f0',
    tick: isDark ? '#94a3b8' : '#64748b',
  };
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('audit_theme', theme);
  const html = document.documentElement;
  const sun = document.getElementById('themeSunIcon');
  const moon = document.getElementById('themeMoonIcon');

  if (theme === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
    if (sun) sun.classList.remove('hidden');
    if (moon) moon.classList.add('hidden');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    if (sun) sun.classList.add('hidden');
    if (moon) moon.classList.remove('hidden');
  }

  // Update chart colors if initialized
  if (overviewTurnoverChartInst) {
    renderOverviewCharts();
  }
  if (macroTrendChartInst && document.getElementById('tab-trends') && !document.getElementById('tab-trends').classList.contains('hidden')) {
    renderTrendsView();
  }
  if (dormancyHistogramChartInst && document.getElementById('tab-dormancy') && !document.getElementById('tab-dormancy').classList.contains('hidden')) {
    renderDormancyView();
  }
  if (window.lucide) window.lucide.createIcons();
}

function toggleTheme() {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

function formatBDT(val) {
  if (!val || isNaN(val)) return 'BDT 0';
  if (val >= 10000000) return `BDT ${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `BDT ${(val / 100000).toFixed(2)} Lac`;
  return `BDT ${Math.round(val).toLocaleString()}`;
}

function formatNumber(val) {
  if (!val || isNaN(val)) return '0';
  return Math.round(val).toLocaleString();
}

function formatPercent(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.MERCHANT_DATA && window.MERCHANT_DATA.merchants) {
    merchants = window.MERCHANT_DATA.merchants;
    initDashboard();
  } else {
    fetch('./merchants_cleaned.json')
      .then(res => res.json())
      .then(json => {
        merchants = json.merchants || [];
        initDashboard();
      })
      .catch(err => console.error(err));
  }
});

function initDashboard() {
  applyTheme(currentTheme);
  initGlobalMAOFilter();
  initExplorerFilters();
  refreshAllDashboardViews();
  setupEventListeners();
  if (window.lucide) window.lucide.createIcons();
}

function initGlobalMAOFilter() {
  const maoMap = new Map();
  merchants.forEach(m => {
    const name = m.maoName || 'Unassigned';
    maoMap.set(name, (maoMap.get(name) || 0) + 1);
  });

  const select = document.getElementById('globalMAOSelect');
  if (!select) return;

  select.innerHTML = `<option value="ALL" class="bg-slate-900 text-white">All Officers (All ${merchants.length} Clients)</option>`;

  const sortedMAOs = Array.from(maoMap.entries()).sort((a, b) => b[1] - a[1]);
  sortedMAOs.forEach(([mao, count]) => {
    const opt = document.createElement('option');
    opt.value = mao;
    opt.className = 'bg-slate-900 text-white';
    opt.innerText = `${mao} (${count} clients)`;
    select.appendChild(opt);
  });

  select.addEventListener('change', (e) => {
    selectedGlobalMAO = e.target.value;
    refreshAllDashboardViews();
  });
}

function refreshAllDashboardViews() {
  const activeList = getActiveMerchants();
  const spikeCount = activeList.filter(m => m.flags.growthSpike).length;
  const amlCount = activeList.filter(m => m.flags.singleCustomerRisk || m.flags.burstReactivation).length;
  const dormantReviewCount = activeList.filter(m => m.auditFlag === 'Sudden Reactivation - Review' || m.dormantMonths >= 4).length;

  const bSpikes = document.getElementById('badgeSpikes');
  if (bSpikes) bSpikes.innerText = spikeCount;

  const bAML = document.getElementById('badgeAML');
  if (bAML) bAML.innerText = amlCount;

  const bDormant = document.getElementById('badgeDormant');
  if (bDormant) bDormant.innerText = dormantReviewCount;

  renderKPICards();
  renderOverviewCharts();
  renderOverviewLists();
  renderTrendsView();
  renderAnomalyView();
  renderSuspiciousView();
  renderDormancyView();
  applyExplorerFilters();
  if (window.lucide) window.lucide.createIcons();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.className = 'tab-btn active flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all text-teal-400 bg-slate-800 border border-teal-500/30';
    } else {
      btn.className = 'tab-btn flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800/50';
    }
  });

  if (tabId === 'trends') renderTrendsView();
  if (tabId === 'dormancy') renderDormancyView();
  if (tabId === 'overview') renderOverviewCharts();
  if (window.lucide) window.lucide.createIcons();
}
function renderKPICards() {
  const list = getActiveMerchants();
  let totalPA = 0, augPA = 0, totalPC = 0, augPC = 0;
  let active = 0, amber = 0, dormant = 0;
  let bursts = 0, singleCust = 0, spikes = 0;

  for (const m of list) {
    totalPA += m.totalPA;
    augPA += m.augPA;
    totalPC += m.totalPC;
    augPC += m.augPC;
    if (m.augActive === 'Active') active++;
    else if (m.augActive === 'Amber') amber++;
    else dormant++;

    if (m.flags.burstReactivation) bursts++;
    if (m.flags.singleCustomerRisk) singleCust++;
    if (m.flags.growthSpike) spikes++;
  }

  const avgTicket = augPC > 0 ? augPA / augPC : 0;
  document.getElementById('statActiveCount').innerText = active;
  document.getElementById('statAmberCount').innerText = amber;
  document.getElementById('statDormantCount').innerText = dormant;
  document.getElementById('badgeSpikes').innerText = spikes;
  document.getElementById('badgeAML').innerText = bursts + singleCust;

  const html = `
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio Turnover</span>
        <div class="p-2 bg-teal-500/10 text-teal-400 rounded-lg"><i data-lucide="dollar-sign" class="w-4 h-4"></i></div>
      </div>
      <div class="text-2xl font-bold text-white tracking-tight">${formatBDT(totalPA)}</div>
      <div class="flex items-center space-x-2 mt-2 text-xs text-slate-400">
        <span class="text-teal-400 font-semibold">${formatBDT(augPA)}</span>
        <span>in August '26</span>
      </div>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">August Transactions</span>
        <div class="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><i data-lucide="activity" class="w-4 h-4"></i></div>
      </div>
      <div class="text-2xl font-bold text-white tracking-tight">${formatNumber(augPC)}</div>
      <div class="flex items-center space-x-2 mt-2 text-xs text-slate-400">
        <span>Avg Ticket:</span>
        <span class="text-cyan-400 font-semibold">${formatBDT(avgTicket)}</span>
      </div>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Merchants</span>
        <div class="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><i data-lucide="user-check" class="w-4 h-4"></i></div>
      </div>
      <div class="flex items-baseline space-x-2">
        <div class="text-2xl font-bold text-white tracking-tight">${active}</div>
        <span class="text-xs text-slate-400">/ ${list.length} (${list.length > 0 ? Math.round((active / list.length) * 100) : 0}%)</span>
      </div>
      <div class="flex items-center space-x-3 mt-2 text-xs">
        <span class="text-amber-400">${amber} Amber</span>
        <span class="text-slate-500">•</span>
        <span class="text-rose-400">${dormant} Dormant</span>
      </div>
    </div>
    <div onclick="switchTab('suspicious')" class="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-rose-500/60 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Audit Red Flags</span>
        </span>
        <div class="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><i data-lucide="shield-alert" class="w-4 h-4"></i></div>
      </div>
      <div class="text-2xl font-bold text-white tracking-tight">${bursts + singleCust + spikes}</div>
      <div class="flex items-center space-x-2 mt-2 text-xs text-slate-400">
        <span class="text-rose-400 font-semibold">${bursts} Burst</span>
        <span>•</span>
        <span class="text-amber-400 font-semibold">${singleCust} Looping</span>
        <span>•</span>
        <span class="text-cyan-400 font-semibold">${spikes} Spikes</span>
      </div>
    </div>
  `;
  document.getElementById('kpiContainer').innerHTML = html;
}

function renderOverviewCharts() {
  const list = getActiveMerchants();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const monthlySums = months.map((m, idx) => {
    return list.reduce((sum, merch) => sum + (merch.monthly && merch.monthly[idx] ? merch.monthly[idx].pa : 0), 0);
  });

  const colors = getChartColors();
  const ctxTurnover = document.getElementById('overviewTurnoverChart').getContext('2d');
  if (overviewTurnoverChartInst) overviewTurnoverChartInst.destroy();

  overviewTurnoverChartInst = new Chart(ctxTurnover, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{ data: monthlySums, backgroundColor: '#0d9488', borderRadius: 4 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.tick } },
        y: { grid: { color: colors.grid }, ticks: { color: colors.tick, callback: v => `${(v / 1000000).toFixed(1)}M` } }
      }
    }
  });

  const ctxStatus = document.getElementById('overviewStatusChart').getContext('2d');
  if (overviewStatusChartInst) overviewStatusChartInst.destroy();

  let active = 0, amber = 0, dormant = 0;
  list.forEach(m => {
    if (m.augActive === 'Active') active++;
    else if (m.augActive === 'Amber') amber++;
    else dormant++;
  });

  overviewStatusChartInst = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Amber', 'Zero Transacting'],
      datasets: [{ data: [active, amber, dormant], backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'], borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { display: false } }
    }
  });
}

function renderOverviewLists() {
  const list = getActiveMerchants();
  const topRisks = [...list].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  const riskHtml = topRisks.length ? topRisks.map(m => `
    <div onclick="inspectWallet('${m.walletNo}')" class="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/50 rounded-lg cursor-pointer transition-all flex items-center justify-between">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-semibold text-white truncate max-w-[200px]">${m.merchantName}</span>
          <span class="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">Score: ${m.riskScore}</span>
        </div>
        <div class="text-[11px] text-slate-400">${m.walletNo} • ${m.subPillar} • Aug PA: ${formatBDT(m.augPA)}</div>
      </div>
      <div class="text-right">
        <div class="text-xs font-semibold text-slate-200">${m.flags.burstReactivation ? 'Burst' : m.flags.singleCustomerRisk ? 'Single Cust' : m.auditFlag}</div>
        <span class="text-[10px] text-teal-400">Inspect &rarr;</span>
      </div>
    </div>
  `).join('') : `<div class="p-4 text-xs text-slate-400 text-center">No high risk merchants found for this officer.</div>`;
  document.getElementById('overviewPriorityCases').innerHTML = riskHtml;

  const pMap = new Map();
  let augTotal = 0;
  list.forEach(m => {
    augTotal += m.augPA;
    const p = m.subPillar || 'Other';
    pMap.set(p, (pMap.get(p) || 0) + m.augPA);
  });
  const pillars = Array.from(pMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const pillarHtml = pillars.length ? pillars.map(([name, pa]) => {
    const pct = augTotal > 0 ? (pa / augTotal) * 100 : 0;
    return `
      <div class="space-y-1.5">
        <div class="flex justify-between text-xs">
          <span class="text-slate-300 font-medium">${name}</span>
          <span class="text-slate-200 font-bold">${formatBDT(pa)} (${pct.toFixed(1)}%)</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div class="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style="width: ${Math.min(100, Math.max(2, pct))}%"></div>
        </div>
      </div>
    `;
  }).join('') : `<div class="p-4 text-xs text-slate-400 text-center">No turnover recorded for this officer.</div>`;
  document.getElementById('overviewPillars').innerHTML = pillarHtml;
}

function changeTrendMetric(metric) {
  currentTrendMetric = metric;
  ['pa', 'pc', 'ts'].forEach(m => {
    const btn = document.getElementById(`btnTrend${m.toUpperCase()}`);
    if (m === metric) {
      btn.className = 'px-3 py-1.5 rounded-md text-xs font-medium bg-teal-600 text-white';
    } else {
      btn.className = 'px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white';
    }
  });
  updateMacroTrendChart();
}

function updateMacroTrendChart() {
  const list = getActiveMerchants();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const dataSeries = months.map((m, idx) => {
    let pa = 0, pc = 0;
    list.forEach(merch => {
      if (merch.monthly && merch.monthly[idx]) {
        pa += merch.monthly[idx].pa;
        pc += merch.monthly[idx].pc;
      }
    });
    if (currentTrendMetric === 'pa') return pa;
    if (currentTrendMetric === 'pc') return pc;
    return pc > 0 ? Math.round(pa / pc) : 0;
  });

  if (macroTrendChartInst) {
    macroTrendChartInst.data.datasets[0].data = dataSeries;
    macroTrendChartInst.options.scales.y.ticks.callback = v => {
      if (currentTrendMetric === 'pa') return `${(v / 1000000).toFixed(1)}M`;
      if (currentTrendMetric === 'pc') return `${(v / 1000).toFixed(0)}k`;
      return `${v}`;
    };
    macroTrendChartInst.update();
  }
}

function renderTrendsView() {
  const list = getActiveMerchants();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const monthlySums = months.map((m, idx) => {
    return list.reduce((sum, merch) => sum + (merch.monthly && merch.monthly[idx] ? merch.monthly[idx].pa : 0), 0);
  });

  const colors = getChartColors();
  const ctxMacro = document.getElementById('macroTrendChart').getContext('2d');
  if (macroTrendChartInst) macroTrendChartInst.destroy();

  macroTrendChartInst = new Chart(ctxMacro, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        data: monthlySums,
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: '#14b8a6',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.tick } },
        y: { grid: { color: colors.grid }, ticks: { color: colors.tick, callback: v => `${(v / 1000000).toFixed(1)}M` } }
      }
    }
  });

  const distMap = new Map();
  list.forEach(m => {
    const d = m.district && m.district !== '#N/A' ? m.district : 'OTHER';
    distMap.set(d, (distMap.get(d) || 0) + m.augPA);
  });
  const topDists = Array.from(distMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const ctxDist = document.getElementById('districtTrendChart').getContext('2d');
  if (districtTrendChartInst) districtTrendChartInst.destroy();

  districtTrendChartInst = new Chart(ctxDist, {
    type: 'bar',
    data: {
      labels: topDists.map(d => d[0]),
      datasets: [{ data: topDists.map(d => d[1]), backgroundColor: '#06b6d4', borderRadius: 4 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: colors.grid }, ticks: { color: colors.tick, callback: v => `${(v / 1000000).toFixed(1)}M` } },
        y: { grid: { display: false }, ticks: { color: colors.tick } }
      }
    }
  });

  // MAO breakdown
  const maoMap = new Map();
  merchants.forEach(m => {
    const mao = m.maoName || 'Unassigned';
    const curr = maoMap.get(mao) || { pa: 0, count: 0, active: 0 };
    curr.pa += m.augPA;
    curr.count++;
    if (m.augActive === 'Active') curr.active++;
    maoMap.set(mao, curr);
  });
  const maoList = Array.from(maoMap.entries()).sort((a, b) => b[1].pa - a[1].pa);

  const maoHtml = maoList.map(([mao, data]) => {
    const isSelected = selectedGlobalMAO === mao;
    return `
      <div onclick="selectMAOFromList('${mao}')" class="p-3 ${isSelected ? 'bg-teal-950/40 border-teal-500/60' : 'bg-slate-800/40 border-slate-800'} border rounded-lg flex items-center justify-between text-xs cursor-pointer hover:border-teal-500/40 transition-all">
        <div>
          <div class="font-semibold ${isSelected ? 'text-teal-300' : 'text-white'} flex items-center space-x-1.5">
            <span>${mao}</span>
            ${isSelected ? '<span class="text-[10px] px-1 bg-teal-500/20 rounded text-teal-300">Filtered</span>' : ''}
          </div>
          <div class="text-[11px] text-slate-400">${data.count} accounts managed</div>
        </div>
        <div class="text-right">
          <div class="font-bold text-teal-400">${formatBDT(data.pa)}</div>
          <div class="text-[11px] text-emerald-400">${Math.round((data.active / data.count) * 100)}% active rate</div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('maoTrendList').innerHTML = maoHtml;
}

function selectMAOFromList(mao) {
  selectedGlobalMAO = selectedGlobalMAO === mao ? 'ALL' : mao;
  const select = document.getElementById('globalMAOSelect');
  if (select) select.value = selectedGlobalMAO;
  refreshAllDashboardViews();
}

function renderAnomalyView() {
  const list = getActiveMerchants();
  const growthSpikes = list.filter(m => m.flags.growthSpike);
  const megaVolume = list.filter(m => m.flags.megaVolume);
  const cliffDrops = list.filter(m => m.flags.cliffDrop);

  document.getElementById('anomalyPills').innerHTML = `
    <div class="p-4 rounded-xl border bg-amber-950/20 border-amber-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Growth Spikes (>300%)</span>
        <i data-lucide="trending-up" class="w-4 h-4 text-amber-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${growthSpikes.length} Accounts</div>
      <p class="text-xs text-slate-400 mt-1">Sudden extreme MoM acceleration</p>
    </div>
    <div class="p-4 rounded-xl border bg-cyan-950/20 border-cyan-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Mega-Volume Entities</span>
        <i data-lucide="dollar-sign" class="w-4 h-4 text-cyan-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${megaVolume.length} Accounts</div>
      <p class="text-xs text-slate-400 mt-1">>BDT 5M in Aug or >BDT 10M total</p>
    </div>
    <div class="p-4 rounded-xl border bg-rose-950/20 border-rose-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Cliff-edge Dropouts</span>
        <i data-lucide="trending-down" class="w-4 h-4 text-rose-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${cliffDrops.length} Accounts</div>
      <p class="text-xs text-slate-400 mt-1">July high volume crashing to 0 in Aug</p>
    </div>
  `;

  const anomalyList = merchants.filter(m => m.flags.growthSpike || m.flags.megaVolume || m.flags.cliffDrop);
  document.getElementById('anomalyCountLabel').innerText = `Showing ${anomalyList.length} anomalies`;

  const tableHtml = anomalyList.slice(0, 30).map(m => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="p-3">
        <div class="font-semibold text-white truncate max-w-[200px]">${m.merchantName}</div>
        <div class="text-[11px] text-slate-400">${m.walletNo}</div>
      </td>
      <td class="p-3 text-slate-300">${m.subPillar}</td>
      <td class="p-3 text-slate-300">${m.district}</td>
      <td class="p-3 text-right text-slate-300">${formatBDT(m.monthly[6]?.pa || 0)}</td>
      <td class="p-3 text-right font-bold text-white">${formatBDT(m.augPA)}</td>
      <td class="p-3 text-right font-bold ${m.growth >= 100 ? 'text-amber-400' : 'text-slate-300'}">
        ${m.isNewGrowth ? 'New' : formatPercent(m.growth)}
      </td>
      <td class="p-3 text-center">
        <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${
          m.flags.megaVolume ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
          m.flags.cliffDrop ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }">
          ${m.flags.megaVolume ? 'Mega Volume' : m.flags.cliffDrop ? 'Cliff Drop' : 'Growth Spike'}
        </span>
      </td>
      <td class="p-3 text-center">
        <button onclick="inspectWallet('${m.walletNo}')" class="text-teal-400 hover:underline font-medium">Inspect</button>
      </td>
    </tr>
  `).join('');
  document.getElementById('anomalyTableBody').innerHTML = tableHtml;
}

function renderSuspiciousView() {
  const activeList = getActiveMerchants();
  const singleCust = activeList.filter(m => m.flags.singleCustomerRisk);
  const burst = activeList.filter(m => m.flags.burstReactivation);
  const micro = activeList.filter(m => m.flags.microTicketRisk);
  const highRate = activeList.filter(m => m.flags.highRateSurge);

  document.getElementById('suspiciousPills').innerHTML = `
    <div class="p-4 rounded-xl border bg-rose-950/20 border-rose-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Single-Customer Looping</span>
        <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${singleCust.length} Flagged</div>
      <p class="text-[11px] text-slate-400 mt-1">CC/PC &le; 0.35 (Self-trading risk)</p>
    </div>
    <div class="p-4 rounded-xl border bg-amber-950/20 border-amber-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Dormant Burst Rebirth</span>
        <i data-lucide="user-x" class="w-4 h-4 text-amber-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${burst.length} Flagged</div>
      <p class="text-[11px] text-slate-400 mt-1">Dormant &ge;4 mos, suddenly >50k</p>
    </div>
    <div class="p-4 rounded-xl border bg-purple-950/20 border-purple-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-purple-400 uppercase tracking-wider">Micro-Structuring</span>
        <i data-lucide="zap" class="w-4 h-4 text-purple-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${micro.length} Flagged</div>
      <p class="text-[11px] text-slate-400 mt-1">&ge;50 txns with ticket &lt;BDT 100</p>
    </div>
    <div class="p-4 rounded-xl border bg-cyan-950/20 border-cyan-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">10% Rate Surges</span>
        <i data-lucide="shield-alert" class="w-4 h-4 text-cyan-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${highRate.length} Flagged</div>
      <p class="text-[11px] text-slate-400 mt-1">High-rate tier accounts</p>
    </div>
  `;

  const susList = activeList.filter(m => m.riskScore >= 30 || m.flags.burstReactivation || m.flags.singleCustomerRisk);
  document.getElementById('suspiciousCountLabel').innerText = `Showing ${susList.length} flagged accounts`;

  const tableHtml = susList.map(m => {
    const ratio = m.augPC > 0 ? (m.augCC / m.augPC).toFixed(2) : 'N/A';
    return `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="p-3">
          <div class="font-semibold text-white truncate max-w-[200px]">${m.merchantName}</div>
          <div class="text-[11px] text-slate-400">${m.walletNo} (${m.walletType})</div>
        </td>
        <td class="p-3">
          <div class="text-slate-200">${m.subPillar}</div>
          <div class="text-[11px] text-slate-400">${m.maoName}</div>
        </td>
        <td class="p-3 text-right font-bold text-white">${formatBDT(m.augPA)}</td>
        <td class="p-3 text-center">
          <span class="font-semibold text-slate-200">${m.augPC} : ${m.augCC}</span>
          <div class="text-[10px] text-slate-400">Ratio: ${ratio}</div>
        </td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded-full font-bold text-[10px] border ${
            m.riskScore >= 50 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }">${m.riskScore} / 100</span>
        </td>
        <td class="p-3">
          <div class="flex flex-wrap gap-1">
            ${m.flags.singleCustomerRisk ? '<span class="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded text-[10px]">Single Customer</span>' : ''}
            ${m.flags.burstReactivation ? '<span class="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px]">Burst Reactivation</span>' : ''}
            ${m.flags.microTicketRisk ? '<span class="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[10px]">Micro-Structuring</span>' : ''}
            ${m.flags.highRateSurge ? '<span class="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded text-[10px]">10% Tier</span>' : ''}
          </div>
        </td>
        <td class="p-3 text-center">
          <button onclick="inspectWallet('${m.walletNo}')" class="text-teal-400 hover:underline font-medium">Audit 360</button>
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('suspiciousTableBody').innerHTML = tableHtml;
}

function renderDormancyView() {
  const activeList = getActiveMerchants();
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

  activeList.forEach(m => {
    const idx = Math.min(7, Math.max(0, Math.round(m.dormantMonths || 0)));
    if (dormantBuckets[idx]) dormantBuckets[idx].count++;
  });

  const zeroDormantList = activeList.filter(m => (m.dormantMonths || 0) === 0);
  const suddenList = activeList.filter(m => m.auditFlag === 'Sudden Reactivation - Review' || m.flags.burstReactivation);
  const deepList = activeList.filter(m => m.dormantMonths >= 5 && m.augPA === 0);
  const highDormancyList = activeList.filter(m => m.auditFlag === 'High Dormancy - Review' || m.dormantMonths >= 4);

  document.getElementById('dormancyPills').innerHTML = `
    <div class="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Zero Dormancy (Active)</span>
        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${zeroDormantList.length} Accounts</div>
      <p class="text-xs text-slate-400 mt-1">Transacting every month since registration</p>
    </div>
    <div class="p-4 rounded-xl border bg-slate-900 border-slate-800 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Dormancy (4+ Mos)</span>
        <i data-lucide="clock" class="w-4 h-4 text-slate-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${highDormancyList.length} Accounts</div>
      <p class="text-xs text-slate-400 mt-1">Dormant &ge;4 months of actual tenure</p>
    </div>
    <div class="p-4 rounded-xl border bg-amber-950/20 border-amber-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Sudden Reactivations</span>
        <i data-lucide="refresh-cw" class="w-4 h-4 text-amber-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${suddenList.length} Queue</div>
      <p class="text-xs text-slate-400 mt-1">Active in August after prolonged dormancy</p>
    </div>
    <div class="p-4 rounded-xl border bg-rose-950/20 border-rose-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Deep Dormancy (5+ Mos)</span>
        <i data-lucide="user-x" class="w-4 h-4 text-rose-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${deepList.length} Accounts</div>
      <p class="text-xs text-slate-400 mt-1">Zero turnover for &ge;5 consecutive mos</p>
    </div>
  `;

  const colors = getChartColors();
  const ctxHist = document.getElementById('dormancyHistogramChart').getContext('2d');
  if (dormancyHistogramChartInst) dormancyHistogramChartInst.destroy();
  dormancyHistogramChartInst = new Chart(ctxHist, {
    type: 'bar',
    data: {
      labels: dormantBuckets.map(b => b.name),
      datasets: [{ data: dormantBuckets.map(b => b.count), backgroundColor: '#f59e0b', borderRadius: 4 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.tick } },
        y: { grid: { color: colors.grid }, ticks: { color: colors.tick } }
      }
    }
  });

  const reviewQueue = activeList.filter(m => (m.dormantMonths || 0) >= 3 || m.auditFlag.includes('Review') || m.auditFlag.includes('Inactive') || m.flags.burstReactivation);
  const queueLabel = document.getElementById('dormancyQueueLabel');
  if (queueLabel) queueLabel.innerText = `Showing ${reviewQueue.length} at-risk accounts`;

  const dormantTableHtml = reviewQueue.map(m => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="p-3">
        <div class="font-semibold text-white truncate max-w-[200px]">${m.merchantName}</div>
        <div class="text-[10px] text-slate-400">${m.subPillar}</div>
      </td>
      <td class="p-3 text-slate-300 font-mono text-[11px]">${m.walletNo}</td>
      <td class="p-3 text-slate-300">${m.maoName}</td>
      <td class="p-3 text-center text-slate-300 font-medium">${m.regDate || 'N/A'}</td>
      <td class="p-3 text-center">
        <span class="text-teal-400 font-bold">${m.tenureMonths || 8} mos</span>
        <div class="text-[10px] text-slate-400">M${m.onboardMonth || 1} to M8</div>
      </td>
      <td class="p-3 text-center">
        <span class="font-bold ${m.dormantMonths >= 4 ? 'text-rose-400' : m.dormantMonths > 0 ? 'text-amber-400' : 'text-emerald-400'}">${m.dormantMonths} mos</span>
        ${m.preOnboardingMonths > 0 ? `<div class="text-[10px] text-slate-500">(${m.preOnboardingMonths}m pre)</div>` : ''}
      </td>
      <td class="p-3 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
          m.augActive === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : m.augActive === 'Amber' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        }">${m.augActive}</span>
      </td>
      <td class="p-3 text-right font-bold text-white">${formatBDT(m.augPA)}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded font-semibold text-[10px] border ${
          m.auditFlag.includes('Review') || m.auditFlag.includes('Inactive') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
        }">
          ${m.auditFlag}
        </span>
      </td>
      <td class="p-3 text-center">
        <button onclick="inspectWallet('${m.walletNo}')" class="text-teal-400 hover:underline font-medium">Audit 360</button>
      </td>
    </tr>
  `).join('');
  document.getElementById('dormancyTableBody').innerHTML = dormantTableHtml;
}

function initExplorerFilters() {
  const pSet = new Set(), fSet = new Set();
  merchants.forEach(m => {
    if (m.subPillar) pSet.add(m.subPillar);
    if (m.auditFlag) fSet.add(m.auditFlag);
  });

  const pSelect = document.getElementById('filterPillar');
  Array.from(pSet).sort().forEach(p => { pSelect.innerHTML += `<option value="${p}">${p}</option>`; });

  const fSelect = document.getElementById('filterFlag');
  Array.from(fSet).sort().forEach(f => { fSelect.innerHTML += `<option value="${f}">${f}</option>`; });
}

function applyExplorerFilters() {
  const pillar = document.getElementById('filterPillar').value;
  const flag = document.getElementById('filterFlag').value;
  const status = document.getElementById('filterStatus').value;
  const q = document.getElementById('globalSearchInput').value.toLowerCase();
  const baseList = getActiveMerchants();

  filteredExplorerMerchants = baseList.filter(m => {
    if (pillar !== 'ALL' && m.subPillar !== pillar) return false;
    if (flag !== 'ALL' && m.auditFlag !== flag) return false;
    if (status !== 'ALL' && m.augActive !== status) return false;
    if (q) {
      const match = m.merchantName.toLowerCase().includes(q) ||
                    m.walletNo.includes(q) ||
                    m.maoName.toLowerCase().includes(q) ||
                    m.district.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  filteredExplorerMerchants.sort((a, b) => {
    let valA = a[currentSortField], valB = b[currentSortField];
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return isSortAsc ? -1 : 1;
    if (valA > valB) return isSortAsc ? 1 : -1;
    return 0;
  });

  currentExplorerPage = 1;
  renderExplorerTable();
}

function sortTable(field) {
  if (currentSortField === field) {
    isSortAsc = !isSortAsc;
  } else {
    currentSortField = field;
    isSortAsc = false;
  }
  applyExplorerFilters();
}

function renderExplorerTable() {
  const total = filteredExplorerMerchants.length;
  const totalPages = Math.ceil(total / explorerPageSize) || 1;
  const start = (currentExplorerPage - 1) * explorerPageSize;
  const pageItems = filteredExplorerMerchants.slice(start, start + explorerPageSize);

  document.getElementById('explorerCountLabel').innerText = `Showing ${total} merchants`;
  document.getElementById('pageInfoLabel').innerText = `Page ${currentExplorerPage} of ${totalPages}`;

  document.getElementById('btnPrevPage').disabled = currentExplorerPage <= 1;
  document.getElementById('btnNextPage').disabled = currentExplorerPage >= totalPages;

  const html = pageItems.map(m => `
    <tr onclick="inspectWallet('${m.walletNo}')" class="hover:bg-slate-800/50 cursor-pointer transition-colors">
      <td class="p-3">
        <div class="font-semibold text-white truncate max-w-[220px]">${m.merchantName}</div>
        <div class="text-[11px] text-slate-400">${m.walletNo} • ${m.walletType} (${m.rate})</div>
      </td>
      <td class="p-3">
        <div class="text-slate-200">${m.subPillar}</div>
        <div class="text-[11px] text-slate-400">${m.maoName}</div>
      </td>
      <td class="p-3 text-right font-bold text-white">${formatBDT(m.augPA)}</td>
      <td class="p-3 text-right text-slate-300 font-mono">${formatNumber(m.augPC)}</td>
      <td class="p-3 text-right text-slate-300 font-mono">${formatBDT(m.avgTicketSize)}</td>
      <td class="p-3 text-right font-semibold ${m.growth > 0 ? 'text-teal-400' : 'text-slate-400'}">
        ${m.isNewGrowth ? 'New' : formatPercent(m.growth)}
      </td>
      <td class="p-3 text-center text-slate-300 font-semibold">${m.dormantMonths} mos</td>
      <td class="p-3 text-center">
        <span class="px-2 py-0.5 rounded-full font-bold text-[10px] border ${
          m.riskScore >= 50 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
          m.riskScore >= 30 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
          'bg-teal-500/20 text-teal-300 border-teal-500/40'
        }">${m.riskScore}</span>
      </td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">${m.auditFlag}</span>
      </td>
      <td class="p-3 text-center">
        <span class="text-teal-400 font-medium text-xs hover:underline">360 &rarr;</span>
      </td>
    </tr>
  `).join('');
  document.getElementById('explorerTableBody').innerHTML = html;
}

function inspectWallet(walletNo) {
  const m = merchants.find(item => item.walletNo === walletNo);
  if (!m) return;

  document.getElementById('drawerTitle').innerText = m.merchantName;
  document.getElementById('drawerSubTitle').innerText = `${m.subCategory || 'Merchant'} • ${m.subPillar} • District: ${m.district}`;

  document.getElementById('drawerBadges').innerHTML = `
    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Wallet: ${m.walletNo}</span>
    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">${m.walletType} (${m.rate})</span>
    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
      m.riskScore >= 50 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    }">Risk: ${m.riskScore}/100</span>
  `;

  document.getElementById('drawerQuickMetrics').innerHTML = `
    <div class="p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
      <span class="text-[10px] uppercase font-bold text-slate-400">Aug PA</span>
      <div class="text-sm font-bold text-white mt-0.5">${formatBDT(m.augPA)}</div>
    </div>
    <div class="p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
      <span class="text-[10px] uppercase font-bold text-slate-400">Aug PC</span>
      <div class="text-sm font-bold text-white mt-0.5">${formatNumber(m.augPC)}</div>
    </div>
    <div class="p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
      <span class="text-[10px] uppercase font-bold text-slate-400">Avg Ticket</span>
      <div class="text-sm font-bold text-teal-400 mt-0.5">${formatBDT(m.avgTicketSize)}</div>
    </div>
    <div class="p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
      <span class="text-[10px] uppercase font-bold text-slate-400">MoM Growth</span>
      <div class="text-sm font-bold text-white mt-0.5">${m.isNewGrowth ? 'New' : formatPercent(m.growth)}</div>
    </div>
  `;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const data = m.monthly ? m.monthly.map(item => item.pa) : [0,0,0,0,0,0,0,m.augPA];
  const barColors = m.monthly ? m.monthly.map(item => item.isPreOnboarding ? 'rgba(100, 116, 139, 0.3)' : '#14b8a6') : '#14b8a6';

  const colors = getChartColors();
  const ctxDrawer = document.getElementById('drawerMonthlyChart').getContext('2d');
  if (drawerChartInst) drawerChartInst.destroy();

  drawerChartInst = new Chart(ctxDrawer, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Turnover (BDT)',
        data: data,
        backgroundColor: barColors,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const item = m.monthly ? m.monthly[ctx.dataIndex] : null;
              if (item && item.isPreOnboarding) return ' Pre-Onboarding (Not yet registered with bKash)';
              return ` Turnover: ${formatBDT(ctx.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.tick } },
        y: { grid: { color: colors.grid }, ticks: { color: colors.tick, callback: v => `${(v/1000).toFixed(0)}k` } }
      }
    }
  });

  let flagsHtml = '';
  if (m.flags.burstReactivation) {
    flagsHtml += `
      <div class="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg text-xs">
        <div class="text-amber-400 font-bold mb-0.5">Dormant Burst Reactivation Triggered</div>
        <div class="text-slate-300 text-[11px]">Account had ${m.dormantMonths} dormant months post-onboarding, then processed ${formatBDT(m.augPA)} in August.</div>
      </div>
    `;
  }
  if (m.flags.singleCustomerRisk) {
    flagsHtml += `
      <div class="p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg text-xs">
        <div class="text-rose-400 font-bold mb-0.5">Single-Customer Looping Triggered</div>
        <div class="text-slate-300 text-[11px]">${m.augCC} customer(s) for ${m.augPC} transactions. Possible self-funding or commission cycling.</div>
      </div>
    `;
  }
  if (m.flags.growthSpike) {
    flagsHtml += `
      <div class="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg text-xs">
        <div class="text-amber-400 font-bold mb-0.5">Growth Surge (+${m.growth}%)</div>
        <div class="text-slate-300 text-[11px]">Turnover accelerated exponentially compared to the previous month.</div>
      </div>
    `;
  }
  if (m.flags.megaVolume) {
    flagsHtml += `
      <div class="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg text-xs">
        <div class="text-cyan-400 font-bold mb-0.5">Mega-Volume Concentration</div>
        <div class="text-slate-300 text-[11px]">Turnover represents an extreme outlier in the portfolio (${formatBDT(m.totalPA)} total).</div>
      </div>
    `;
  }
  if (!flagsHtml) {
    flagsHtml = `<div class="p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-xs text-slate-300">No anomalous AML or burst triggers detected. System Flag: <strong>${m.auditFlag}</strong></div>`;
  }
  document.getElementById('drawerFlagsContainer').innerHTML = flagsHtml;

  document.getElementById('drawerDemographics').innerHTML = `
    <div class="flex justify-between"><span class="text-slate-400">Acquisition Officer:</span><span class="font-semibold text-white">${m.maoName}</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Territory:</span><span class="font-semibold text-white">${m.isdOsd}</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Registration Date:</span><span class="font-semibold text-teal-400">${m.regDate}</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Active Evaluation Tenure:</span><span class="font-semibold text-white">${m.tenureMonths || 8} month(s) (Month ${m.onboardMonth || 1} to 8)</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Pre-Onboarding Months:</span><span class="font-semibold text-slate-400">${m.preOnboardingMonths || 0} month(s) (Prior to Registration)</span></div>
    <div class="flex justify-between"><span class="text-slate-400">True Post-Onboard Dormancy:</span><span class="font-bold ${m.dormantMonths >= 4 ? 'text-rose-400' : m.dormantMonths > 0 ? 'text-amber-400' : 'text-emerald-400'}">${m.dormantMonths || 0} month(s)</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Address:</span><span class="font-semibold text-white truncate max-w-[280px]">${m.address}</span></div>
  `;

  document.getElementById('merchantDrawer').classList.remove('hidden');
}

function exportData(type) {
  const baseList = getActiveMerchants();
  let exportList = baseList;
  let filename = 'Audit_Master_Client_Dataset';

  if (type === 'flagged') {
    exportList = baseList.filter(m => m.riskScore >= 30 || m.flags.burstReactivation || m.flags.singleCustomerRisk || m.flags.growthSpike);
    filename = 'Audit_Flagged_Suspicious_Merchants';
  } else if (type === 'dormant') {
    exportList = baseList.filter(m => m.dormantMonths >= 4 || m.auditFlag.includes('Review'));
    filename = 'Audit_Dormant_AtRisk_Merchants';
  }

  const headers = [
    'Wallet No', 'Merchant Name', 'Sub Pillar', 'District', 'Acquisition Officer',
    'Registration Date', 'Onboard Month', 'Tenure Months', 'Pre-Onboarding Months',
    'Rate', 'August PA', 'August PC', 'August CC', 'Avg Ticket Size',
    'MoM Growth', 'Post-Onboard Dormant Months', 'Naive Jan-Aug Dormant', 'Risk Score', 'Audit Flag',
    'Single Cust Risk', 'Burst Reactivation', 'Growth Spike', 'Total PA (8 Mos)'
  ];

  const rows = exportList.map(m => [
    `"${m.walletNo}"`,
    `"${(m.merchantName || '').replace(/"/g, '""')}"`,
    `"${m.subPillar}"`,
    `"${m.district}"`,
    `"${m.maoName}"`,
    `"${m.regDate}"`,
    m.onboardMonth || 1,
    m.tenureMonths || 8,
    m.preOnboardingMonths || 0,
    `"${m.rate}"`,
    m.augPA,
    m.augPC,
    m.augCC,
    m.avgTicketSize,
    m.isNewGrowth ? 'New' : `${m.growth}%`,
    m.dormantMonths,
    m.naiveDormantMonths || m.dormantMonths,
    m.riskScore,
    `"${m.auditFlag}"`,
    m.flags.singleCustomerRisk ? 'YES' : 'NO',
    m.flags.burstReactivation ? 'YES' : 'NO',
    m.flags.growthSpike ? 'YES' : 'NO',
    m.totalPA
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function setupEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  document.getElementById('globalSearchInput').addEventListener('input', () => {
    applyExplorerFilters();
    switchTab('explorer');
  });

  document.getElementById('filterPillar').addEventListener('change', applyExplorerFilters);
  document.getElementById('filterFlag').addEventListener('change', applyExplorerFilters);
  document.getElementById('filterStatus').addEventListener('change', applyExplorerFilters);
  document.getElementById('btnResetFilters').addEventListener('click', () => {
    document.getElementById('filterPillar').value = 'ALL';
    document.getElementById('filterFlag').value = 'ALL';
    document.getElementById('filterStatus').value = 'ALL';
    document.getElementById('globalSearchInput').value = '';
    applyExplorerFilters();
  });

  document.getElementById('btnPrevPage').addEventListener('click', () => {
    if (currentExplorerPage > 1) { currentExplorerPage--; renderExplorerTable(); }
  });
  document.getElementById('btnNextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredExplorerMerchants.length / explorerPageSize) || 1;
    if (currentExplorerPage < totalPages) { currentExplorerPage++; renderExplorerTable(); }
  });

  document.getElementById('closeDrawerBtn').addEventListener('click', () => {
    document.getElementById('merchantDrawer').classList.add('hidden');
  });
  document.getElementById('closeDrawerBtn2').addEventListener('click', () => {
    document.getElementById('merchantDrawer').classList.add('hidden');
  });

  document.getElementById('openExportBtn').addEventListener('click', () => {
    document.getElementById('exportModal').classList.remove('hidden');
  });
  document.getElementById('closeExportBtn').addEventListener('click', () => {
    document.getElementById('exportModal').classList.add('hidden');
  });
  document.getElementById('closeExportBtn2').addEventListener('click', () => {
    document.getElementById('exportModal').classList.add('hidden');
  });

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}
