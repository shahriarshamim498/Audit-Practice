// Client Transaction Audit Dashboard Engine
let merchants = [];
let filteredExplorerMerchants = [];
let currentExplorerPage = 1;
const explorerPageSize = 25;
let currentSortField = 'augPA';
let isSortAsc = false;
let currentTrendMetric = 'pa';
let selectedGlobalMAO = 'ALL';
let selectedIndustryFilter = 'ALL';

const INDUSTRY_DEFINITIONS = {
  LAUNDRY: {
    id: 'LAUNDRY',
    name: 'Laundry & Dry Cleaning',
    icon: 'shirt',
    color: 'sky',
    badgeClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
    typicalGrowthMax: 60.0,
    typicalTicketMin: 150,
    typicalTicketMax: 2000,
    expectedDiversityRatio: 0.80,
    description: 'Commercial dry cleaners, laundries, steam press & garment care chains',
    auditFocus: 'Inspect counter order registers, seasonal customer laundry slips, and check for high-ticket corporate or laundry agent pooling.',
    benchmarkRationale: 'Dry cleaning and laundry serve recurring neighborhood and institutional customers. Growth exceeding 60% or tickets exceeding BDT 2,500 indicates artificial invoice creation or pooling.'
  },
  AUTOMOBILES: {
    id: 'AUTOMOBILES',
    name: 'Automobiles & Servicing',
    icon: 'car',
    color: 'rose',
    badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    typicalGrowthMax: 100.0,
    typicalTicketMin: 500,
    typicalTicketMax: 25000,
    expectedDiversityRatio: 0.65,
    description: 'Auto workshops, motorcycle showrooms, spare parts, tyre shops & servicing centres',
    auditFocus: 'Examine vehicle service job cards, spare parts inventory challans, and vehicle registration numbers on sales invoices.',
    benchmarkRationale: 'Auto parts and servicing have higher average transaction values. Tickets exceeding BDT 30,000 or customer wallet pooling should be audited for informal vehicle trade or trade finance diversion.'
  },
  FURNITURE: {
    id: 'FURNITURE',
    name: 'Furniture & Home Living',
    icon: 'armchair',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    typicalGrowthMax: 120.0,
    typicalTicketMin: 1000,
    typicalTicketMax: 40000,
    expectedDiversityRatio: 0.70,
    description: 'Furniture manufacturers, interior decor, bedding & timber showrooms',
    auditFocus: 'Verify delivery challans, showroom gate passes, and custom carpentry orders against customer payment wallets.',
    benchmarkRationale: 'Furniture purchases are high-ticket, durable goods. Multiple transactions from the same buyer within days or extreme spikes require physical delivery verification.'
  },
  BEAUTY_SALON: {
    id: 'BEAUTY_SALON',
    name: 'Beauty, Salon & Personal Care',
    icon: 'sparkles',
    color: 'pink',
    badgeClass: 'bg-pink-500/10 text-pink-400 border border-pink-500/30',
    typicalGrowthMax: 80.0,
    typicalTicketMin: 200,
    typicalTicketMax: 3500,
    expectedDiversityRatio: 0.75,
    description: 'Beauty parlours, hair styling salons, makeup studios & aesthetic clinics',
    auditFocus: 'Cross-check appointment registers against bKash transaction timestamps. Screen for cashier wallet looping or bridal service aggregations.',
    benchmarkRationale: 'Beauty salon bills are personal care service fees. Tickets exceeding BDT 5,000 or customer concentration (<75% diversity) indicate personal wallet pooling or unrecorded cash-outs.'
  },
  TRAVEL_TOURISM: {
    id: 'TRAVEL_TOURISM',
    name: 'Travel, Hospitality & Tourism',
    icon: 'plane',
    color: 'teal',
    badgeClass: 'bg-teal-500/10 text-teal-400 border border-teal-500/30',
    typicalGrowthMax: 150.0,
    typicalTicketMin: 2000,
    typicalTicketMax: 80000,
    expectedDiversityRatio: 0.65,
    description: 'Travel agencies, airlines ticketing, resorts, hotels & visa processing',
    auditFocus: 'Audit GDS/airline booking PNR numbers, resort guest registration folios, and Umrah/Hajj visa packages against bKash payer wallets.',
    benchmarkRationale: 'Travel packages and flight tickets naturally have high ticket values. Single customer repeated high-value bookings require PNR passenger verification to rule out hundi or informal remittance.'
  },
  HEALTHCARE: {
    id: 'HEALTHCARE',
    name: 'Healthcare & Pharmacy',
    icon: 'heart-pulse',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    typicalGrowthMax: 50.0, // Specific user rule: Pharmacy demand is inelastic; >50% growth is suspicious
    typicalTicketMin: 150,
    typicalTicketMax: 3500,
    expectedDiversityRatio: 0.70,
    description: 'Retail pharmacies, clinics & diagnostic centres (Inelastic demand)',
    auditFocus: 'Verify medicine distributor cash memos, check for prescription bulk OTC laundering or commission cash-ins.',
    benchmarkRationale: 'Healthcare & medicine demand is inelastic. MoM growth above 50% without documented seasonal epidemics or institutional supply tenders indicates high probability of artificial invoice looping or commission gaming.'
  },
  EDUCATION: {
    id: 'EDUCATION',
    name: 'Education & Institutes',
    icon: 'graduation-cap',
    color: 'indigo',
    badgeClass: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30',
    typicalGrowthMax: 100.0,
    typicalTicketMin: 500,
    typicalTicketMax: 15000,
    expectedDiversityRatio: 0.75,
    description: 'Schools, madrasas, academies, coaching centres & academic publishing',
    auditFocus: 'Verify student enrolment rolls and academic fee schedules. Check for single proxy wallet bulk-paying multiple student tuition fees.',
    benchmarkRationale: 'Tuition and academic fees typically exhibit seasonal term spikes, but repetitive collections from a small cluster of parent/guardian wallets suggest unauthorized fee aggregation or proxy commission loops.'
  },
  FOOD_DINING: {
    id: 'FOOD_DINING',
    name: 'Food, Dining & Bakeries',
    icon: 'utensils',
    color: 'orange',
    badgeClass: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    typicalGrowthMax: 100.0,
    typicalTicketMin: 150,
    typicalTicketMax: 2500,
    expectedDiversityRatio: 0.80,
    description: 'Restaurants, dining lounges, fast food outlets & bakeries',
    auditFocus: 'Cross-check physical POS terminal settlement slips against register slips. Audit cashier-side card and personal bKash wallet looping.',
    benchmarkRationale: 'Food and dining turnover is high-velocity with high unique customer turnover. Concentrated payments or overnight surges are highly anomalous for dine-in and counter food establishments.'
  },
  GROCERY: {
    id: 'GROCERY',
    name: 'Grocery & Superstores',
    icon: 'shopping-cart',
    color: 'lime',
    badgeClass: 'bg-lime-500/10 text-lime-400 border border-lime-500/30',
    typicalGrowthMax: 80.0,
    typicalTicketMin: 100,
    typicalTicketMax: 3500,
    expectedDiversityRatio: 0.75,
    description: 'Supermarket chains, daily grocery marts & general provisions',
    auditFocus: 'Inspect POS basket tickets exceeding BDT 8,000 for informal wholesale goods diversion or grey market supplier cash-ins.',
    benchmarkRationale: 'Retail grocery exhibits high customer count and steady basket sizes. MoM growth above 80% or large repetitive tickets indicates informal wholesale pass-through rather than standard retail commerce.'
  },
  ELECTRONICS: {
    id: 'ELECTRONICS',
    name: 'Electronics & Gadgets',
    icon: 'smartphone',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    typicalGrowthMax: 200.0,
    typicalTicketMin: 1500,
    typicalTicketMax: 50000,
    expectedDiversityRatio: 0.60,
    description: 'Consumer electronics, smartphones, computers & telecom devices',
    auditFocus: 'Verify device IMEI/serial number sales registers. Screen for smurfing/micro-structuring (<BDT 250 tickets) or grey market mobile phone trade.',
    benchmarkRationale: 'Electronics tickets are naturally high-value. High transaction volume with micro-ticket sizes (<BDT 250) is an AML indicator for structuring, cash-out diversion, or fee bypass.'
  },
  FASHION: {
    id: 'FASHION',
    name: 'Fashion & Lifestyle',
    icon: 'shirt',
    color: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    typicalGrowthMax: 120.0,
    typicalTicketMin: 500,
    typicalTicketMax: 6000,
    expectedDiversityRatio: 0.70,
    description: 'Apparel stores, boutique fashion, footwear, lifestyle & jewellery',
    auditFocus: 'Compare sales dates against national festival shopping calendar (Eid/Puja). Check for artificial inventory clearing transactions.',
    benchmarkRationale: 'Apparel follows distinct festival seasonality. In the absence of major national festivals in August, extreme MoM volume jumps warrant inventory and bank settlement audit.'
  },
  DIGITAL_SERVICES: {
    id: 'DIGITAL_SERVICES',
    name: 'Digital & Logistics Services',
    icon: 'globe',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    typicalGrowthMax: 250.0,
    typicalTicketMin: 200,
    typicalTicketMax: 20000,
    expectedDiversityRatio: 0.50,
    description: 'Online merchants, IT solutions, logistics, courier & digital platforms',
    auditFocus: 'Verify platform server transaction logs, domain SSL ownership, API checkout webhook validity, and parcel courier delivery proof.',
    benchmarkRationale: 'E-commerce can scale rapidly, but digital transactions without associated shipment tracking or software subscription proof risk being used for unauthorized fund transfer.'
  },
  GENERAL_RETAIL: {
    id: 'GENERAL_RETAIL',
    name: 'General Retail & Services',
    icon: 'store',
    color: 'slate',
    badgeClass: 'bg-slate-500/10 text-slate-300 border border-slate-500/30',
    typicalGrowthMax: 250.0,
    typicalTicketMin: 100,
    typicalTicketMax: 10000,
    expectedDiversityRatio: 0.65,
    description: 'General merchant retail & mixed trading businesses',
    auditFocus: 'Standard merchant audit: verify trade license validity, storefront operational status, and monthly sales register reconciliation.',
    benchmarkRationale: 'General retail requires standard merchant reconciliation against point-of-sale volume and local trading norms.'
  }
};

function getMerchantIndustry(m) {
  const name = (m.merchantName || '').toLowerCase().trim();
  const subCat = (m.subCategory || '').toLowerCase().trim();
  const subPillar = (m.subPillar || '').toLowerCase().trim();

  // 1. LAUNDRY & DRY CLEANING (Top Priority Override - fixes Calcutta Dry Cleaners mislabeled as Home Appliance)
  if (/dry cleaner|dry cleaners|cleaner|cleaners|laundry|wash & dry|ironing|dhupikana|dhobi/.test(name)) {
    return INDUSTRY_DEFINITIONS.LAUNDRY;
  }

  // 2. AUTOMOBILES & SERVICING (Fixes FS Motors, Raj Auto Care, Auto Smith, Bike Doctor tagged Home Appliance/Travel)
  if (
    /\b(motors|motor|auto care|auto mall|auto smith|automobile|automobiles|bike|motorcycle|garage|tyre|filling|petrol|cng)\b/.test(name) &&
    !/academy|school|college|education/.test(name)
  ) {
    return INDUSTRY_DEFINITIONS.AUTOMOBILES;
  }

  // 3. LOGISTICS, TRUCKING & COURIER (Truck Lagbe, Courier, Cargo)
  if (/\b(truck lagbe|courier|parcel|logistics|moving|transport|cargo)\b/.test(name)) {
    return INDUSTRY_DEFINITIONS.DIGITAL_SERVICES;
  }

  // 4. FURNITURE, BEDDING & HOME LIVING (Fixes Tanin Industries, Trend Furniture, Allora, B.J. Bed)
  if (/\b(furniture|interior|timber|sofa|tanin|linens|bedding|allora|b\.j\.bed|decor|furnishing)\b/.test(name)) {
    return INDUSTRY_DEFINITIONS.FURNITURE;
  }

  // 5. BEAUTY, SALON & PERSONAL CARE (Chuler Karigor, Dhanmondi Beauty hub, Jonaki, Saloon)
  if (
    /\b(beauty|parlour|parlor|salon|saloon|spa|makeover|barber|chuler karigor|perfumes|fragrance|cosmetics|jonaki|skincare|glamorous by farzana)\b/.test(name) ||
    (subCat === 'personal care' && /hub|skin|glow|look|care/.test(name))
  ) {
    return INDUSTRY_DEFINITIONS.BEAUTY_SALON;
  }

  // 6. TRAVEL, HOSPITALITY & TOURISM (Travella, Travox, Muscat Holiday Resort, Hotels)
  if (
    subPillar === 'travel & tourism' ||
    (/\b(travel|travels|tour|tours|resort|holiday|visa|aviation|ticketing|hajj|umrah|hotel|motel|travox|travella|air travels|fly|trip)\b/.test(name) &&
     !/academy|school|college/.test(name))
  ) {
    return INDUSTRY_DEFINITIONS.TRAVEL_TOURISM;
  }

  // 7. HEALTHCARE & PHARMACY (Top priority for user: inelastic demand)
  if (
    /pharmacy|hospital|diagnostic|medical|health/.test(subCat) ||
    /\b(pharma|pharmacy|medicine|drug|hospital|diagnostic|health|clinic|doctor|cure|medico|ayurved|herbal|dental|physio|optical|optics|eye care|homeo|medical|chemi|medibuy|herblife|nutrition|healing haven|qheal|well being)\b/.test(name)
  ) {
    return INDUSTRY_DEFINITIONS.HEALTHCARE;
  }

  // 8. EDUCATION, INSTITUTES & PUBLISHING (Adarsha, Pustok Prokashon, Campus UAC)
  if (
    /coaching|training|college|school|national curriculum|education/.test(subCat) ||
    subPillar === 'education' ||
    /\b(academy|school|college|madrasa|madrasha|university|vidyapith|education|coaching|training|admission|institute|prokashon|prokashoni|ptokashoni|publication|tuition|learning|polytechnic|shikkha|pathshala|cadet|english|adarsha|bookshop|library|tutor|campus|edubase)\b/.test(name)
  ) {
    return INDUSTRY_DEFINITIONS.EDUCATION;
  }

  // 9. FOOD, DINING, CAFES & BAKERIES (The Safeworks - Ginni Tehari, Beirut Bistro, Clove Chocolate, Let's Roll)
  if (
    /restaurant|bakery|fast food|dining/.test(subCat) ||
    /\b(restaurant|cafe|dining|kitchen|kabab|biryani|tehari|pizza|coffee|bakery|baking|sweets|fast food|food|foods|burger|tea|lounge|catering|chabaw|bakers|shawarma|juice|khana|diner|cha|roast|confectionery|bistro|quickbrew|chocolate|roll|gosto)\b/.test(name)
  ) {
    return INDUSTRY_DEFINITIONS.FOOD_DINING;
  }

  // 10. ELECTRONICS & GADGETS (Edison, Cellbox, Telecom)
  if (
    /mobile & gadget|service center/.test(subCat) ||
    (/home appliance/.test(subCat) && !/cleaner|dry|wash|furniture|timber|motor|auto/.test(name)) ||
    /\b(gadget|mobile|electronics|electric|telecom|app store|tech|computer|phone|cellbox|device|welburg|repair|servicing|edison|gaming)\b/.test(name)
  ) {
    return INDUSTRY_DEFINITIONS.ELECTRONICS;
  }

  // 11. FASHION, APPAREL & JEWELLERY (G te goyna, House of Chaiti, Footloose)
  if (
    /apparel|footwear|gifts and wearables/.test(subCat) ||
    /\b(fashion|clothing|tailor|boutique|textile|poshaak|wear|lifestyle|shoes|footloose|collection|fabrics|jewellers|jeweller|jewel|gold|goyna|watch|attire|outfit|garments|sharee|hijab|style|chaiti|vittorio|shaandaar|alpona|velamore)\b/.test(name)
  ) {
    return INDUSTRY_DEFINITIONS.FASHION;
  }

  // 12. GROCERY, SUPERSTORES & PROVISIONS
  if (
    /superstore|department store/.test(subCat) ||
    /\b(superstore|grocery|mart|bazaar|bazar|provisions|super shop|fish|organic)\b/.test(name) ||
    (/\b(store|shop)\b/.test(name) &&
     !/gadget|mobile|tech|app|phone|fashion|cloth|wear|tailor|boutique|jewel|gold|book|prokashon|pharma|medicine|dental|cleaner|dry|motor|auto|furniture|bistro|baking|sweet|coffee|cafe/.test(name))
  ) {
    return INDUSTRY_DEFINITIONS.GROCERY;
  }

  // 13. DIGITAL SERVICES & E-COMMERCE
  if (
    /e-commerce|online|content/.test(subCat) ||
    /\b(software|digital|media|automation|network|it limited|technolog|web|borno ai|cloud 7|solutions|techno lab)\b/.test(name)
  ) {
    return INDUSTRY_DEFINITIONS.DIGITAL_SERVICES;
  }

  return INDUSTRY_DEFINITIONS.GENERAL_RETAIL;
}

function assessIndustryAnomaly(m, ind) {
  const reasons = [];
  const flags = [];
  let isAnomaly = false;

  // Metric 1: Sector-Tailored MoM Growth Ceiling
  // (e.g. Pharmacy MoM >50% or Laundry >60% is suspicious as inelastic demand does not randomly jump)
  if (m.growth >= ind.typicalGrowthMax && m.augPA >= 5000 && !m.isNewGrowth) {
    isAnomaly = true;
    flags.push('SURGE_CEILING');
    reasons.push(`${ind.name} MoM surge (+${m.growth.toFixed(1)}%) exceeds sector baseline ceiling (+${ind.typicalGrowthMax}%)`);
  }

  // Metric 2: Laundry & Dry Cleaning specific (Calcutta Dry Cleaners & others)
  if (ind.id === 'LAUNDRY') {
    if (m.avgTicketSize >= 2500 && m.augPC >= 5) {
      isAnomaly = true;
      flags.push('LAUNDRY_BULK_TICKET');
      reasons.push(`Unusually high avg ticket (${formatBDT(m.avgTicketSize)}) for retail dry cleaning/laundry`);
    }
    if (m.augPC >= 10 && m.augCC <= 3) {
      isAnomaly = true;
      flags.push('LAUNDRY_LOOPING');
      reasons.push(`Laundry customer concentration: ${m.augPC} bills paid by only ${m.augCC} customer(s)`);
    }
  }

  // Metric 3: Automobiles & Servicing specific
  if (ind.id === 'AUTOMOBILES') {
    if (m.avgTicketSize >= 30000 && m.augPC >= 4) {
      isAnomaly = true;
      flags.push('AUTO_MEGA_TICKET');
      reasons.push(`Avg ticket (${formatBDT(m.avgTicketSize)}) exceeds typical retail workshop/servicing benchmark`);
    }
    if (m.augPC >= 12 && m.augCC <= 3) {
      isAnomaly = true;
      flags.push('AUTO_WALLET_LOOPING');
      reasons.push(`Automobile customer pooling: ${m.augPC} payments from only ${m.augCC} wallet(s)`);
    }
  }

  // Metric 4: Furniture & Home Living specific
  if (ind.id === 'FURNITURE') {
    if (m.avgTicketSize >= 45000 && m.augPC >= 3) {
      isAnomaly = true;
      flags.push('FURNITURE_MEGA_TICKET');
      reasons.push(`Avg ticket (${formatBDT(m.avgTicketSize)}) exceeds typical retail furniture basket`);
    }
  }

  // Metric 5: Beauty, Salon & Personal Care specific
  if (ind.id === 'BEAUTY_SALON') {
    if (m.avgTicketSize >= 4500 && m.augPC >= 5) {
      isAnomaly = true;
      flags.push('SALON_LARGE_TICKET');
      reasons.push(`Unusually high avg ticket (${formatBDT(m.avgTicketSize)}) for personal salon service`);
    }
    if (m.augPC >= 10 && m.augCC <= 2) {
      isAnomaly = true;
      flags.push('SALON_LOOPING');
      reasons.push(`Salon counter wallet looping: ${m.augPC} visits from only ${m.augCC} wallet(s)`);
    }
  }

  // Metric 6: Travel, Hospitality & Tourism specific
  if (ind.id === 'TRAVEL_TOURISM') {
    if (m.augPC >= 8 && m.augCC <= 2) {
      isAnomaly = true;
      flags.push('TRAVEL_WALLET_POOLING');
      reasons.push(`Travel wallet pooling: ${m.augPC} ticketing txns paid by only ${m.augCC} wallet(s)`);
    }
  }

  // Metric 7: Pharmacy specific bulk ticket or looping
  if (ind.id === 'HEALTHCARE') {
    if (m.avgTicketSize >= 5000 && m.augPC >= 5) {
      isAnomaly = true;
      flags.push('HEALTHCARE_BULK_TICKET');
      reasons.push(`Unusually large avg ticket (${formatBDT(m.avgTicketSize)}) for retail medicine dispensing`);
    }
    if (m.augPC >= 10 && m.augCC <= 3) {
      isAnomaly = true;
      flags.push('HEALTHCARE_LOOPING');
      reasons.push(`Pharmacy customer looping: ${m.augPC} txns concentrated in only ${m.augCC} customer(s)`);
    }
  }

  // Metric 8: Education tuition proxy pooling
  if (ind.id === 'EDUCATION') {
    if (m.augPC >= 8 && (m.augPC / Math.max(1, m.augCC)) >= 3.5) {
      isAnomaly = true;
      flags.push('TUITION_PROXY_POOLING');
      reasons.push(`Tuition proxy looping: ${m.augPC} tuition transactions paid by only ${m.augCC} wallets`);
    }
    if (m.avgTicketSize >= 20000 && m.augPC >= 5) {
      isAnomaly = true;
      flags.push('TUITION_MEGA_TICKET');
      reasons.push(`Avg ticket (${formatBDT(m.avgTicketSize)}) exceeds typical academic term fee baseline`);
    }
  }

  // Metric 9: Food & Dining counter loop
  if (ind.id === 'FOOD_DINING') {
    if (m.augPC >= 15 && m.augCC <= 3) {
      isAnomaly = true;
      flags.push('DINING_COUNTER_LOOP');
      reasons.push(`Dining counter looping: ${m.augPC} dining bills paid by only ${m.augCC} wallet(s)`);
    }
  }

  // Metric 10: Grocery wholesale pass-through
  if (ind.id === 'GROCERY') {
    if (m.avgTicketSize >= 8000 && m.augPC >= 5) {
      isAnomaly = true;
      flags.push('GROCERY_BULK_PASS_THROUGH');
      reasons.push(`Unusually high avg grocery ticket (${formatBDT(m.avgTicketSize)}) indicates wholesale diversion`);
    }
  }

  // Metric 11: Electronics micro-structuring or smurfing
  if (ind.id === 'ELECTRONICS') {
    if (m.avgTicketSize < 250 && m.augPC >= 15) {
      isAnomaly = true;
      flags.push('TECH_MICRO_STRUCTURING');
      reasons.push(`Micro-structuring in electronics: Avg ticket ${formatBDT(m.avgTicketSize)} across ${m.augPC} transactions`);
    }
  }

  // Also include general macro anomalies (megaVolume, cliffDrop, growthSpike >300%)
  if (m.flags && (m.flags.megaVolume || m.flags.cliffDrop || m.flags.growthSpike)) {
    isAnomaly = true;
    if (m.flags.megaVolume) reasons.push(`Mega-Volume Outlier (${formatBDT(m.augPA)} Aug / ${formatBDT(m.totalPA)} total)`);
    if (m.flags.cliffDrop) reasons.push(`Cliff-edge dropout: July ${formatBDT(m.monthly[6]?.pa || 0)} dropped to BDT 0 in August`);
    if (m.flags.growthSpike && !flags.includes('SURGE_CEILING')) reasons.push(`Extreme MoM growth spike (+${m.growth.toFixed(1)}%)`);
  }

  // Benchmark status evaluation for the 3 key pillars
  const growthStatus = m.isNewGrowth
    ? 'NEW'
    : m.growth > ind.typicalGrowthMax
    ? 'BREACH'
    : 'NORMAL';

  const ticketStatus = m.avgTicketSize > ind.typicalTicketMax
    ? 'HIGH'
    : m.avgTicketSize < ind.typicalTicketMin && m.augPC >= 10
    ? 'LOW'
    : 'NORMAL';

  const diversityRatio = m.augPC > 0 ? (m.augCC / m.augPC) : 1;
  const diversityStatus = diversityRatio < ind.expectedDiversityRatio && m.augPC >= 8
    ? 'CONCENTRATED'
    : 'NORMAL';

  return {
    isAnomaly,
    flags,
    reasons,
    summaryReason: reasons[0] || 'Normal transaction velocity for sector',
    growthStatus,
    ticketStatus,
    diversityRatio,
    diversityStatus
  };
}

function enrichMerchantsWithIndustry(list) {
  list.forEach(m => {
    m.industry = getMerchantIndustry(m);
    m.industryName = m.industry.name;
    m.industryAnomaly = assessIndustryAnomaly(m, m.industry);
  });
}

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
let maoComplianceChartInst = null;

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
  enrichMerchantsWithIndustry(merchants);
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
  renderMAOScorecardView();
  applyExplorerFilters();
  if (window.lucide) window.lucide.createIcons();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.remove('hidden');

  // Desktop tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.className = 'tab-btn active flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium nav-transition text-teal-400 bg-slate-800 surface-card border border-teal-500/30';
    } else {
      btn.className = 'tab-btn flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium nav-transition text-slate-400 text-secondary hover:text-white hover:bg-slate-800/50';
    }
  });

  // Mobile bottom dock navigation
  document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active', 'text-teal-400');
      btn.classList.remove('text-slate-400', 'text-secondary');
    } else {
      btn.classList.remove('active', 'text-teal-400');
      btn.classList.add('text-slate-400', 'text-secondary');
    }
  });

  if (tabId === 'trends') renderTrendsView();
  if (tabId === 'dormancy') renderDormancyView();
  if (tabId === 'overview') renderOverviewCharts();
  if (tabId === 'mao') renderMAOScorecardView();
  if (window.lucide) window.lucide.createIcons();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderKPICards() {
  const list = getActiveMerchants();
  let totalPA = 0, augPA = 0, totalPC = 0, augPC = 0;
  let julPA = 0, julPC = 0;
  let active = 0, amber = 0, dormant = 0;
  let bursts = 0, singleCust = 0, spikes = 0;

  for (const m of list) {
    totalPA += m.totalPA;
    augPA += m.augPA;
    totalPC += m.totalPC;
    augPC += m.augPC;
    if (m.monthly && m.monthly[6]) {
      julPA += m.monthly[6].pa || 0;
      julPC += m.monthly[6].pc || 0;
    }
    if (m.augActive === 'Active') active++;
    else if (m.augActive === 'Amber') amber++;
    else dormant++;

    if (m.flags.burstReactivation) bursts++;
    if (m.flags.singleCustomerRisk) singleCust++;
    if (m.flags.growthSpike) spikes++;
  }

  const paGrowth = julPA > 0 ? ((augPA - julPA) / julPA) * 100 : 0;
  const pcGrowth = julPC > 0 ? ((augPC - julPC) / julPC) * 100 : 0;
  const activePct = list.length > 0 ? ((active / list.length) * 100).toFixed(1) : '0';
  const totalFlags = bursts + singleCust + spikes;
  const flagPct = list.length > 0 ? ((totalFlags / list.length) * 100).toFixed(1) : '0';

  const activeElem = document.getElementById('statActiveCount');
  const amberElem = document.getElementById('statAmberCount');
  const dormantElem = document.getElementById('statDormantCount');
  if (activeElem) activeElem.innerText = active;
  if (amberElem) amberElem.innerText = amber;
  if (dormantElem) dormantElem.innerText = dormant;

  const bSpikes = document.getElementById('badgeSpikes');
  const bAML = document.getElementById('badgeAML');
  if (bSpikes) bSpikes.innerText = spikes;
  if (bAML) bAML.innerText = bursts + singleCust;

  const html = `
    <!-- Card 1: Page Views / Portfolio Turnover -->
    <div class="bg-white dark:bg-slate-900 surface-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Portfolio Turnover</span>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <i data-lucide="eye" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex items-baseline flex-wrap gap-2">
          <span class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${formatBDT(totalPA)}</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${paGrowth >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'}">
            <span class="mr-0.5 text-[9px]">${paGrowth >= 0 ? '▲' : '▼'}</span>${Math.abs(paGrowth).toFixed(1)}%
          </span>
        </div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal truncate">
          vs. ${formatBDT(julPA)} last period
        </div>
      </div>
    </div>

    <!-- Card 2: Visitors / Active Merchants -->
    <div class="bg-white dark:bg-slate-900 surface-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Active Merchants</span>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <i data-lucide="users" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex items-baseline flex-wrap gap-2">
          <span class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${formatNumber(active)}</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <span class="mr-0.5 text-[9px]">▲</span>${activePct}%
          </span>
        </div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal truncate">
          vs. ${list.length} total accounts
        </div>
      </div>
    </div>

    <!-- Card 3: Click / August Transactions -->
    <div class="bg-white dark:bg-slate-900 surface-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">August Transactions</span>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <i data-lucide="mouse-pointer" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex items-baseline flex-wrap gap-2">
          <span class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${formatNumber(augPC)}</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${pcGrowth >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'}">
            <span class="mr-0.5 text-[9px]">${pcGrowth >= 0 ? '▲' : '▼'}</span>${Math.abs(pcGrowth).toFixed(1)}%
          </span>
        </div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal truncate">
          vs. ${formatNumber(julPC)} last period
        </div>
      </div>
    </div>

    <!-- Card 4: Orders / Audit Red Flags -->
    <div onclick="switchTab('suspicious')" class="bg-white dark:bg-slate-900 surface-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md cursor-pointer transition-all flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Audit Red Flags</span>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <i data-lucide="inbox" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex items-baseline flex-wrap gap-2">
          <span class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${formatNumber(totalFlags)}</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <span class="mr-0.5 text-[9px]">▼</span>${flagPct}%
          </span>
        </div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal truncate">
          vs. ${formatNumber(list.length - totalFlags)} clean accounts
        </div>
      </div>
    </div>
  `;
  document.getElementById('kpiContainer').innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
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

  // MAO breakdown with Compliance Intelligence
  const maoStats = calculateMAOComplianceStats(merchants);
  const maoHtml = maoStats.map(o => {
    const isSelected = selectedGlobalMAO === o.name;
    return `
      <div onclick="selectMAOFromList('${o.name}')" class="p-3 ${isSelected ? 'bg-teal-950/40 border-teal-500/60' : 'bg-slate-800/40 border-slate-800'} border rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-teal-500/40 transition-all">
        <div class="space-y-0.5">
          <div class="font-semibold ${isSelected ? 'text-teal-300' : 'text-white'} flex items-center space-x-1.5">
            <span class="text-amber-400 font-bold">#${o.rank}</span>
            <span>${o.name}</span>
            ${isSelected ? '<span class="text-[10px] px-1 bg-teal-500/20 rounded text-teal-300">Filtered</span>' : ''}
          </div>
          <div class="text-[11px] text-slate-400">${o.total} accounts • Aug: ${formatBDT(o.totalAugPA)}</div>
        </div>
        <div class="text-right space-y-0.5">
          <div class="flex items-center justify-end space-x-1.5">
            <span class="font-extrabold ${o.score >= 75 ? 'text-emerald-400' : o.score >= 65 ? 'text-teal-400' : 'text-amber-400'}">${o.score}</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-bold border ${o.gradeBadge}">Grade ${o.grade}</span>
          </div>
          <div class="text-[10px] text-emerald-400">${o.healthyPct.toFixed(0)}% healthy • ${o.dormantPct.toFixed(0)}% dormant</div>
        </div>
      </div>
    `;
  }).join('');
  const maoContainer = document.getElementById('maoTrendList');
  if (maoContainer) maoContainer.innerHTML = maoHtml;
}

function selectMAOFromList(mao) {
  selectedGlobalMAO = selectedGlobalMAO === mao ? 'ALL' : mao;
  const select = document.getElementById('globalMAOSelect');
  if (select) select.value = selectedGlobalMAO;
  refreshAllDashboardViews();
}

function setIndustryAnomalyFilter(indId) {
  selectedIndustryFilter = indId;
  renderAnomalyView();
}

function renderAnomalyView() {
  const list = getActiveMerchants();

  // All anomalous merchants under active MAO filter
  const allAnomaliesInActive = list.filter(m => m.industryAnomaly && m.industryAnomaly.isAnomaly);

  // Calculate anomaly counts per sector
  const sectorCounts = { ALL: allAnomaliesInActive.length };
  Object.keys(INDUSTRY_DEFINITIONS).forEach(k => { sectorCounts[k] = 0; });
  allAnomaliesInActive.forEach(m => {
    if (m.industry && sectorCounts[m.industry.id] !== undefined) {
      sectorCounts[m.industry.id]++;
    }
  });

  // Render Industry Sector Radar Filter Pills
  const pillsContainer = document.getElementById('industryFilterPills');
  if (pillsContainer) {
    const pillKeys = ['ALL', 'LAUNDRY', 'AUTOMOBILES', 'FURNITURE', 'BEAUTY_SALON', 'TRAVEL_TOURISM', 'HEALTHCARE', 'EDUCATION', 'FOOD_DINING', 'GROCERY', 'ELECTRONICS', 'FASHION', 'DIGITAL_SERVICES', 'GENERAL_RETAIL'];
    pillsContainer.innerHTML = pillKeys.map(k => {
      const isAll = k === 'ALL';
      const label = isAll ? 'All Industries' : INDUSTRY_DEFINITIONS[k].name;
      const count = sectorCounts[k] || 0;
      const isSelected = selectedIndustryFilter === k;
      const activeClass = isSelected
        ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
        : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/60';

      return `
        <button onclick="setIndustryAnomalyFilter('${k}')" class="px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${activeClass}">
          <span>${label}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-900/60 text-slate-400'}">${count}</span>
        </button>
      `;
    }).join('');
  }

  const activeLabel = document.getElementById('industryFilterActiveLabel');
  if (activeLabel) {
    activeLabel.innerText = selectedIndustryFilter === 'ALL'
      ? 'All Industries Active'
      : `Filtered: ${INDUSTRY_DEFINITIONS[selectedIndustryFilter]?.name || selectedIndustryFilter}`;
  }

  // Filter anomalies based on selected industry
  const anomalyList = selectedIndustryFilter === 'ALL'
    ? allAnomaliesInActive
    : allAnomaliesInActive.filter(m => m.industry && m.industry.id === selectedIndustryFilter);

  const growthSurges = anomalyList.filter(m => (m.growth >= (m.industry?.typicalGrowthMax || 100) && m.augPA >= 5000 && !m.isNewGrowth) || m.flags.growthSpike);
  const megaOutliers = anomalyList.filter(m => m.flags.megaVolume);
  const cliffDrops = anomalyList.filter(m => m.flags.cliffDrop);

  document.getElementById('anomalyPills').innerHTML = `
    <div class="p-4 rounded-xl border bg-amber-950/20 border-amber-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Sector Growth Surges</span>
        <i data-lucide="trending-up" class="w-4 h-4 text-amber-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${growthSurges.length} Accounts</div>
      <p class="text-xs text-slate-400 mt-1">Exceeds industry normal growth ceiling</p>
    </div>
    <div class="p-4 rounded-xl border bg-cyan-950/20 border-cyan-500/50 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Mega-Volume Entities</span>
        <i data-lucide="dollar-sign" class="w-4 h-4 text-cyan-400"></i>
      </div>
      <div class="text-2xl font-bold text-white">${megaOutliers.length} Accounts</div>
      <p class="text-xs text-slate-400 mt-1">>BDT 5M in Aug or >BDT 10M total volume</p>
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

  // Dynamic Spotlight strictly for selected MAO & Industry
  const officerLabel = document.getElementById('anomalySpotlightOfficerLabel');
  if (officerLabel) {
    const maoStr = selectedGlobalMAO === 'ALL' ? 'All Officers' : selectedGlobalMAO;
    const indStr = selectedIndustryFilter === 'ALL' ? 'All Sectors' : INDUSTRY_DEFINITIONS[selectedIndustryFilter]?.name;
    officerLabel.innerText = `${maoStr} • ${indStr}`;
  }

  const spotlightContainer = document.getElementById('anomalySpotlightCards');
  if (spotlightContainer) {
    const topAnomalies = [...anomalyList]
      .sort((a, b) => (b.growth || 0) - (a.growth || 0) || b.augPA - a.augPA)
      .slice(0, 2);

    if (topAnomalies.length === 0) {
      spotlightContainer.innerHTML = `
        <div class="col-span-1 md:col-span-2 p-4 bg-slate-800/40 surface-subtle border border-slate-700/60 rounded-xl text-center text-slate-400 text-xs">
          No industry anomaly triggers detected for <strong>${selectedGlobalMAO === 'ALL' ? 'the portfolio' : selectedGlobalMAO}</strong> in <strong>${selectedIndustryFilter === 'ALL' ? 'any sector' : INDUSTRY_DEFINITIONS[selectedIndustryFilter]?.name}</strong>.
        </div>
      `;
    } else {
      spotlightContainer.innerHTML = topAnomalies.map(m => {
        const ind = m.industry || INDUSTRY_DEFINITIONS.GENERAL_RETAIL;
        const mainReason = m.industryAnomaly?.reasons?.[0] || 'Unusual sector pattern detected';
        let tag = ind.name;
        let tagColor = ind.badgeClass;

        let desc = `${mainReason}. August Turnover: ${formatBDT(m.augPA)} across ${formatNumber(m.augPC)} txns (Avg Ticket: ${formatBDT(m.avgTicketSize)}).`;

        return `
          <div class="p-3.5 bg-slate-800/40 surface-subtle border border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/60 transition-colors" onclick="inspectWallet('${m.walletNo}')">
            <div class="flex justify-between items-start mb-1 gap-2">
              <span class="font-bold text-teal-400 text-sm truncate max-w-[220px]">${m.merchantName}</span>
              <span class="px-2 py-0.5 ${tagColor} rounded-full font-semibold text-[10px] shrink-0">${tag}</span>
            </div>
            <div class="text-[10px] text-slate-400 font-mono mb-1.5">${m.walletNo} • MAO: ${m.maoName}</div>
            <div class="p-2 bg-slate-900/60 rounded-lg text-amber-300/90 text-[11px] leading-relaxed border border-amber-500/20 mb-1">
              ⚠️ ${mainReason}
            </div>
            <p class="text-slate-400 text-[10px] mt-1">${desc}</p>
          </div>
        `;
      }).join('');
    }
  }

  // Anomaly Table
  const countLabel = document.getElementById('anomalyCountLabel');
  if (countLabel) {
    countLabel.innerText = `Showing ${anomalyList.length} anomalies`;
  }

  const tableBody = document.getElementById('anomalyTableBody');
  if (anomalyList.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="p-6 text-center text-slate-400 text-xs">
          No anomalous accounts found for ${selectedGlobalMAO === 'ALL' ? 'this portfolio' : selectedGlobalMAO} under ${selectedIndustryFilter === 'ALL' ? 'current filters' : INDUSTRY_DEFINITIONS[selectedIndustryFilter]?.name}.
        </td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = anomalyList.slice(0, 50).map(m => {
      const ind = m.industry || INDUSTRY_DEFINITIONS.GENERAL_RETAIL;
      const mainReason = m.industryAnomaly?.reasons?.[0] || 'Unusual sector pattern';
      const isSurge = m.growth >= ind.typicalGrowthMax;

      return `
        <tr class="hover:bg-slate-800/40 table-row transition-colors">
          <td class="p-3">
            <div class="font-semibold text-white text-primary truncate max-w-[200px]">${m.merchantName}</div>
            <div class="text-[11px] text-slate-400 font-mono">${m.walletNo}</div>
          </td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${ind.badgeClass}">
              ${ind.name}
            </span>
          </td>
          <td class="p-3 text-slate-300 text-secondary">${m.subPillar}</td>
          <td class="p-3 text-right text-slate-300 text-secondary">${formatBDT(m.monthly[6]?.pa || 0)}</td>
          <td class="p-3 text-right font-bold text-white text-primary">${formatBDT(m.augPA)}</td>
          <td class="p-3 text-right font-bold ${isSurge ? 'text-amber-400' : 'text-slate-300'}">
            ${m.isNewGrowth ? 'New' : formatPercent(m.growth)}
          </td>
          <td class="p-3">
            <div class="text-[11px] font-medium text-amber-300/90 max-w-[260px] truncate" title="${mainReason}">
              ${mainReason}
            </div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">
              Sector Ceiling: &le;+${ind.typicalGrowthMax}% • Ticket: BDT ${ind.typicalTicketMin}-${ind.typicalTicketMax}
            </div>
          </td>
          <td class="p-3 text-center">
            <button onclick="inspectWallet('${m.walletNo}')" class="text-teal-400 hover:underline font-medium">Audit 360</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (window.lucide) window.lucide.createIcons();
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

function calculateMAOComplianceStats(merchantsList = merchants) {
  const maoMap = new Map();
  merchantsList.forEach(m => {
    const mao = m.maoName || 'Unassigned';
    if (!maoMap.has(mao)) {
      maoMap.set(mao, {
        name: mao,
        total: 0,
        healthy: 0,
        active: 0,
        amber: 0,
        dormant: 0,
        amlRisk: 0,
        suddenReact: 0,
        highDormancy: 0,
        totalAugPA: 0,
        merchants: []
      });
    }
    const stat = maoMap.get(mao);
    stat.total++;
    stat.merchants.push(m);
    stat.totalAugPA += (m.augPA || 0);
    if (m.auditFlag === 'Healthy/Active') stat.healthy++;
    if (m.augActive === 'Active') stat.active++;
    else if (m.augActive === 'Amber') stat.amber++;
    else stat.dormant++;

    if (m.flags && (m.flags.singleCustomerRisk || m.flags.burstReactivation || m.flags.microTicketRisk)) stat.amlRisk++;
    if (m.auditFlag === 'Sudden Reactivation - Review') stat.suddenReact++;
    if (m.auditFlag === 'High Dormancy - Review') stat.highDormancy++;
  });

  const list = Array.from(maoMap.values()).map(stat => {
    const healthyPct = stat.total > 0 ? (stat.healthy / stat.total) * 100 : 0;
    const activePct = stat.total > 0 ? (stat.active / stat.total) * 100 : 0;
    const dormantPct = stat.total > 0 ? (stat.dormant / stat.total) * 100 : 0;
    const amlPct = stat.total > 0 ? (stat.amlRisk / stat.total) * 100 : 0;
    const suddenReactPct = stat.total > 0 ? (stat.suddenReact / stat.total) * 100 : 0;
    const highDormancyPct = stat.total > 0 ? (stat.highDormancy / stat.total) * 100 : 0;

    // Standardized Portfolio Quality & Compliance Score (0 to 100)
    let score = 50 + (healthyPct * 0.45) + (activePct * 0.15) - (dormantPct * 0.35) - (amlPct * 0.50) - (suddenReactPct * 0.15);
    score = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

    let grade = 'D';
    let gradeLabel = 'High Audit Risk';
    let gradeBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    let auditVerdict = 'High Dormancy / AML Concentration';

    if (score >= 75) {
      grade = 'A';
      gradeLabel = 'Exemplary Compliance';
      gradeBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      auditVerdict = 'Prime Portfolio Health & High Retention';
    } else if (score >= 65) {
      grade = 'B';
      gradeLabel = 'Stable Portfolio';
      gradeBadge = 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      auditVerdict = 'Healthy Retention & Controlled Risk';
    } else if (score >= 55) {
      grade = 'C';
      gradeLabel = 'Needs Monitoring';
      gradeBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      auditVerdict = 'Elevated Dormancy / Emerging AML';
    }

    return {
      ...stat,
      healthyPct,
      activePct,
      dormantPct,
      amlPct,
      suddenReactPct,
      highDormancyPct,
      score,
      grade,
      gradeLabel,
      gradeBadge,
      auditVerdict
    };
  });

  list.sort((a, b) => b.score - a.score);
  list.forEach((item, idx) => { item.rank = idx + 1; });
  return list;
}

function renderMAOScorecardView() {
  const maoStats = calculateMAOComplianceStats(merchants);
  if (!maoStats || !maoStats.length) return;

  const topOfficer = maoStats[0];
  const lowestDormant = [...maoStats].sort((a, b) => a.dormantPct - b.dormantPct)[0];
  const lowestAML = [...maoStats].sort((a, b) => a.amlPct - b.amlPct)[0];
  const avgScore = (maoStats.reduce((sum, o) => sum + o.score, 0) / maoStats.length).toFixed(1);

  // 1. Render Highlight Badges
  const highlightElem = document.getElementById('maoHighlightCards');
  if (highlightElem) {
    highlightElem.innerHTML = `
      <div class="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/40 shadow-sm space-y-1">
        <div class="flex items-center justify-between text-xs font-semibold text-emerald-400">
          <span>Top Compliance Officer</span>
          <i data-lucide="crown" class="w-4 h-4 text-amber-400"></i>
        </div>
        <div class="text-lg font-bold text-white truncate" title="${topOfficer.name}">${topOfficer.name}</div>
        <div class="flex items-center space-x-2 text-xs">
          <span class="px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Score: ${topOfficer.score}</span>
          <span class="text-slate-400">${topOfficer.healthyPct.toFixed(1)}% Healthy</span>
        </div>
      </div>

      <div class="p-4 rounded-xl border bg-teal-950/20 border-teal-500/40 shadow-sm space-y-1">
        <div class="flex items-center justify-between text-xs font-semibold text-teal-400">
          <span>Lowest Dormancy Rate</span>
          <i data-lucide="clock" class="w-4 h-4 text-teal-400"></i>
        </div>
        <div class="text-lg font-bold text-white truncate" title="${lowestDormant.name}">${lowestDormant.name}</div>
        <div class="flex items-center space-x-2 text-xs">
          <span class="px-2 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">${lowestDormant.dormantPct.toFixed(1)}% Dormant</span>
          <span class="text-slate-400">${lowestDormant.dormant} of ${lowestDormant.total} accts</span>
        </div>
      </div>

      <div class="p-4 rounded-xl border bg-cyan-950/20 border-cyan-500/40 shadow-sm space-y-1">
        <div class="flex items-center justify-between text-xs font-semibold text-cyan-400">
          <span>Cleanest AML Record</span>
          <i data-lucide="shield-check" class="w-4 h-4 text-cyan-400"></i>
        </div>
        <div class="text-lg font-bold text-white truncate" title="${lowestAML.name}">${lowestAML.name}</div>
        <div class="flex items-center space-x-2 text-xs">
          <span class="px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">${lowestAML.amlPct.toFixed(1)}% AML Risk</span>
          <span class="text-slate-400">${lowestAML.amlRisk} flagged</span>
        </div>
      </div>

      <div class="p-4 rounded-xl border bg-indigo-950/20 border-indigo-500/40 shadow-sm space-y-1">
        <div class="flex items-center justify-between text-xs font-semibold text-indigo-400">
          <span>Portfolio Quality Avg</span>
          <i data-lucide="bar-chart-3" class="w-4 h-4 text-indigo-400"></i>
        </div>
        <div class="text-2xl font-bold text-white">${avgScore} / 100</div>
        <div class="text-xs text-slate-400">Across ${maoStats.length} field officers</div>
      </div>
    `;
  }

  // 2. Render Officer Cards Grid
  const cardsElem = document.getElementById('maoCardsContainer');
  if (cardsElem) {
    cardsElem.innerHTML = maoStats.map(o => {
      const isSelected = selectedGlobalMAO === o.name;
      const medalIcon = o.rank === 1 ? '🥇' : o.rank === 2 ? '🥈' : o.rank === 3 ? '🥉' : `#${o.rank}`;

      return `
        <div class="bg-slate-900/90 surface-card border ${isSelected ? 'border-teal-500 ring-1 ring-teal-500/50 shadow-md' : 'border-slate-800/80'} rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-2.5">
              <span class="text-lg font-bold ${o.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}">${medalIcon}</span>
              <div>
                <h4 class="text-sm font-bold text-white text-primary leading-tight">${o.name}</h4>
                <p class="text-[11px] text-slate-400 text-secondary">${o.total} merchants managed</p>
              </div>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-lg font-extrabold ${o.score >= 75 ? 'text-emerald-400' : o.score >= 65 ? 'text-teal-400' : o.score >= 55 ? 'text-amber-400' : 'text-rose-400'}">${o.score}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold border ${o.gradeBadge}">Grade ${o.grade}</span>
            </div>
          </div>

          <!-- Progress Ratios -->
          <div class="space-y-2 text-xs">
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-emerald-400 font-medium">Healthy Portfolio</span>
                <span class="text-slate-300 font-bold">${o.healthyPct.toFixed(1)}% (${o.healthy} accts)</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${o.healthyPct}%"></div>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-teal-400 font-medium">Active Retention</span>
                <span class="text-slate-300 font-bold">${o.activePct.toFixed(1)}% (${o.active} accts)</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-teal-500 h-1.5 rounded-full" style="width: ${o.activePct}%"></div>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-amber-400 font-medium">Dormancy Rate</span>
                <span class="text-slate-300 font-bold">${o.dormantPct.toFixed(1)}% (${o.dormant} accts)</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-amber-500 h-1.5 rounded-full" style="width: ${o.dormantPct}%"></div>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-rose-400 font-medium">AML / Suspicious Risk</span>
                <span class="text-slate-300 font-bold">${o.amlPct.toFixed(1)}% (${o.amlRisk} accts)</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-rose-500 h-1.5 rounded-full" style="width: ${Math.min(100, o.amlPct * 5)}%"></div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800/60 border-theme flex items-center justify-between">
            <span class="text-[11px] text-slate-400 truncate max-w-[170px]" title="${o.auditVerdict}">
              ${o.auditVerdict}
            </span>
            <button onclick="selectMAOFromList('${o.name}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
              isSelected ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 surface-subtle text-teal-400 hover:bg-slate-700'
            }">
              <span>${isSelected ? 'Active Filter' : 'Filter MAO'}</span>
              <i data-lucide="${isSelected ? 'check' : 'filter'}" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Render Matrix Table
  const tableElem = document.getElementById('maoComplianceTableBody');
  if (tableElem) {
    tableElem.innerHTML = maoStats.map(o => {
      const isSelected = selectedGlobalMAO === o.name;
      return `
        <tr class="hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-teal-950/20' : ''}">
          <td class="p-3 text-center font-bold ${o.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}">
            #${o.rank}
          </td>
          <td class="p-3">
            <div class="font-bold text-white text-primary flex items-center space-x-2">
              <span>${o.name}</span>
              ${isSelected ? '<span class="px-1.5 py-0.2 text-[10px] font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Filtered</span>' : ''}
            </div>
            <div class="text-[10px] text-slate-400">${o.total} total merchants managed</div>
          </td>
          <td class="p-3 text-center">
            <span class="text-sm font-extrabold ${o.score >= 75 ? 'text-emerald-400' : o.score >= 65 ? 'text-teal-400' : o.score >= 55 ? 'text-amber-400' : 'text-rose-400'}">
              ${o.score}
            </span>
          </td>
          <td class="p-3 text-center">
            <span class="px-2 py-0.5 rounded font-bold text-[10px] border ${o.gradeBadge}">
              Grade ${o.grade}
            </span>
          </td>
          <td class="p-3 text-center">
            <span class="font-bold text-emerald-400">${o.healthyPct.toFixed(1)}%</span>
            <div class="text-[10px] text-slate-400">${o.healthy} accts</div>
          </td>
          <td class="p-3 text-center">
            <span class="font-bold text-teal-300">${o.activePct.toFixed(1)}%</span>
            <div class="text-[10px] text-slate-400">${o.active} accts</div>
          </td>
          <td class="p-3 text-center">
            <span class="font-bold ${o.dormantPct > 30 ? 'text-rose-400' : 'text-amber-400'}">${o.dormantPct.toFixed(1)}%</span>
            <div class="text-[10px] text-slate-400">${o.dormant} accts</div>
          </td>
          <td class="p-3 text-center">
            <span class="font-bold ${o.amlPct > 1 ? 'text-rose-400' : 'text-emerald-400'}">${o.amlPct.toFixed(1)}%</span>
            <div class="text-[10px] text-slate-400">${o.amlRisk} flagged</div>
          </td>
          <td class="p-3 text-center">
            <span class="font-bold text-slate-300">${o.suddenReactPct.toFixed(1)}%</span>
            <div class="text-[10px] text-slate-400">${o.suddenReact} accts</div>
          </td>
          <td class="p-3 text-right font-medium text-slate-300">${o.total}</td>
          <td class="p-3 text-center">
            <button onclick="selectMAOFromList('${o.name}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold ${
              isSelected ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 surface-subtle text-teal-400 hover:bg-slate-700'
            }">
              ${isSelected ? 'Clear Filter' : 'Filter Dashboard'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 4. Render Comparison Chart
  const chartCanvas = document.getElementById('maoComplianceChart');
  if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    if (maoComplianceChartInst) maoComplianceChartInst.destroy();

    const colors = getChartColors();
    maoComplianceChartInst = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: maoStats.map(o => o.name.split(' ')[0] + ' ' + (o.name.split(' ')[1] || '')),
        datasets: [
          {
            label: 'Healthy Ratio (%)',
            data: maoStats.map(o => o.healthyPct),
            backgroundColor: '#10b981',
            borderRadius: 4
          },
          {
            label: 'Active Retention (%)',
            data: maoStats.map(o => o.activePct),
            backgroundColor: '#14b8a6',
            borderRadius: 4
          },
          {
            label: 'Dormancy Containment (%)',
            data: maoStats.map(o => Math.max(0, 100 - o.dormantPct)),
            backgroundColor: '#3b82f6',
            borderRadius: 4
          },
          {
            label: 'AML Safety (%)',
            data: maoStats.map(o => Math.max(0, 100 - (o.amlPct * 10))),
            backgroundColor: '#8b5cf6',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: colors.tick, boxWidth: 10, font: { size: 10 } }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: colors.tick, font: { size: 10 } } },
          y: { min: 0, max: 100, grid: { color: colors.grid }, ticks: { color: colors.tick, callback: v => `${v}%` } }
        }
      }
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

function initExplorerFilters() {
  const pSet = new Set(), fSet = new Set();
  merchants.forEach(m => {
    if (m.subPillar) pSet.add(m.subPillar);
    if (m.auditFlag) fSet.add(m.auditFlag);
  });

  const indSelect = document.getElementById('filterIndustry');
  if (indSelect) {
    indSelect.innerHTML = '<option value="ALL">All Industries</option>';
    Object.values(INDUSTRY_DEFINITIONS).forEach(ind => {
      indSelect.innerHTML += `<option value="${ind.id}">${ind.name}</option>`;
    });
  }

  const pSelect = document.getElementById('filterPillar');
  Array.from(pSet).sort().forEach(p => { pSelect.innerHTML += `<option value="${p}">${p}</option>`; });

  const fSelect = document.getElementById('filterFlag');
  Array.from(fSet).sort().forEach(f => { fSelect.innerHTML += `<option value="${f}">${f}</option>`; });
}

function applyExplorerFilters() {
  const indSelect = document.getElementById('filterIndustry');
  const industry = indSelect ? indSelect.value : 'ALL';
  const pillar = document.getElementById('filterPillar').value;
  const flag = document.getElementById('filterFlag').value;
  const status = document.getElementById('filterStatus').value;
  const q = document.getElementById('globalSearchInput').value.toLowerCase();
  const baseList = getActiveMerchants();

  filteredExplorerMerchants = baseList.filter(m => {
    if (industry !== 'ALL' && m.industry && m.industry.id !== industry) return false;
    if (pillar !== 'ALL' && m.subPillar !== pillar) return false;
    if (flag !== 'ALL' && m.auditFlag !== flag) return false;
    if (status !== 'ALL' && m.augActive !== status) return false;
    if (q) {
      const match = m.merchantName.toLowerCase().includes(q) ||
                    m.walletNo.includes(q) ||
                    m.maoName.toLowerCase().includes(q) ||
                    (m.industry && m.industry.name.toLowerCase().includes(q)) ||
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

  const html = pageItems.map(m => {
    const ind = m.industry || INDUSTRY_DEFINITIONS.GENERAL_RETAIL;
    return `
      <tr onclick="inspectWallet('${m.walletNo}')" class="hover:bg-slate-800/50 cursor-pointer transition-colors">
        <td class="p-3">
          <div class="font-semibold text-white truncate max-w-[200px]">${m.merchantName}</div>
          <div class="text-[11px] text-slate-400">${m.walletNo} • ${m.walletType} (${m.rate})</div>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${ind.badgeClass}">
            ${ind.name}
          </span>
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
    `;
  }).join('');
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
    <div class="p-2.5 sm:p-3 bg-slate-800/40 surface-subtle border border-slate-800/80 rounded-xl">
      <span class="text-[10px] uppercase font-bold text-slate-400 text-secondary">Aug PA</span>
      <div class="text-xs sm:text-sm font-bold text-white text-primary mt-0.5 truncate">${formatBDT(m.augPA)}</div>
    </div>
    <div class="p-2.5 sm:p-3 bg-slate-800/40 surface-subtle border border-slate-800/80 rounded-xl">
      <span class="text-[10px] uppercase font-bold text-slate-400 text-secondary">Aug PC</span>
      <div class="text-xs sm:text-sm font-bold text-white text-primary mt-0.5 truncate">${formatNumber(m.augPC)}</div>
    </div>
    <div class="p-2.5 sm:p-3 bg-slate-800/40 surface-subtle border border-slate-800/80 rounded-xl">
      <span class="text-[10px] uppercase font-bold text-slate-400 text-secondary">Avg Ticket</span>
      <div class="text-xs sm:text-sm font-bold text-teal-400 mt-0.5 truncate">${formatBDT(m.avgTicketSize)}</div>
    </div>
    <div class="p-2.5 sm:p-3 bg-slate-800/40 surface-subtle border border-slate-800/80 rounded-xl">
      <span class="text-[10px] uppercase font-bold text-slate-400 text-secondary">MoM Growth</span>
      <div class="text-xs sm:text-sm font-bold text-white text-primary mt-0.5 truncate">${m.isNewGrowth ? 'New' : formatPercent(m.growth)}</div>
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

  // Render Industry Benchmark & Sector Surveillance in Drawer
  const ind = m.industry || INDUSTRY_DEFINITIONS.GENERAL_RETAIL;
  const indAnom = m.industryAnomaly || { isAnomaly: false, reasons: [], growthStatus: 'NORMAL', ticketStatus: 'NORMAL', diversityStatus: 'NORMAL' };

  const benchContainer = document.getElementById('drawerIndustryBenchmark');
  if (benchContainer) {
    const isSurgeBreach = m.growth > ind.typicalGrowthMax && !m.isNewGrowth;
    const isTicketAnomaly = m.avgTicketSize > ind.typicalTicketMax || (m.avgTicketSize < ind.typicalTicketMin && m.augPC >= 10);
    const isDiversityAnom = indAnom.diversityStatus === 'CONCENTRATED';

    benchContainer.innerHTML = `
      <div class="bg-slate-800/40 surface-subtle border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        <!-- Sector Header -->
        <div class="flex items-start justify-between">
          <div class="space-y-0.5">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${ind.badgeClass}">
                ${ind.name}
              </span>
              <span class="text-[10px] text-slate-400 font-mono">Matched by SubCategory & Name Pattern</span>
            </div>
            <p class="text-[11px] text-slate-300 text-secondary pt-1 leading-relaxed">${ind.description}</p>
          </div>
        </div>

        <!-- 3-Pillar Benchmark Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <!-- 1. MoM Growth vs Sector Baseline -->
          <div class="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MoM Growth Ceiling</span>
            <div class="flex items-baseline justify-between">
              <span class="font-bold text-white">${m.isNewGrowth ? 'New' : formatPercent(m.growth)}</span>
              <span class="text-[10px] text-slate-400">&le;+${ind.typicalGrowthMax}% max</span>
            </div>
            <div>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                m.isNewGrowth ? 'bg-slate-800 text-slate-300' :
                isSurgeBreach ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                'bg-emerald-500/20 text-emerald-300'
              }">
                ${m.isNewGrowth ? 'Onboarding' : isSurgeBreach ? '⚠️ Surge Breach' : '✅ Baseline Compliant'}
              </span>
            </div>
          </div>

          <!-- 2. Avg Ticket vs Expected Range -->
          <div class="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Range</span>
            <div class="flex items-baseline justify-between">
              <span class="font-bold text-white">${formatBDT(m.avgTicketSize)}</span>
              <span class="text-[10px] text-slate-400">${formatNumber(ind.typicalTicketMin)}-${formatNumber(ind.typicalTicketMax)}</span>
            </div>
            <div>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                isTicketAnomaly ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
              }">
                ${isTicketAnomaly ? '⚠️ Out of Range' : '✅ Standard Ticket'}
              </span>
            </div>
          </div>

          <!-- 3. Customer Diversity (Ratio) -->
          <div class="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Diversity</span>
            <div class="flex items-baseline justify-between">
              <span class="font-bold text-white">${m.augPC > 0 ? Math.round((m.augCC / m.augPC) * 100) : 0}%</span>
              <span class="text-[10px] text-slate-400">&ge;${Math.round(ind.expectedDiversityRatio * 100)}% target</span>
            </div>
            <div>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                isDiversityAnom ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
              }">
                ${isDiversityAnom ? '⚠️ Concentrated' : '✅ Organic Ratio'}
              </span>
            </div>
          </div>
        </div>

        <!-- Risk Rationale / Audit Explanation -->
        <div class="p-2.5 bg-slate-900/70 border ${indAnom.isAnomaly ? 'border-amber-500/30 bg-amber-950/10' : 'border-slate-800'} rounded-lg text-xs space-y-1">
          <div class="font-bold ${indAnom.isAnomaly ? 'text-amber-400' : 'text-slate-300'} flex items-center space-x-1.5">
            <i data-lucide="${indAnom.isAnomaly ? 'alert-triangle' : 'info'}" class="w-3.5 h-3.5"></i>
            <span>Sector Audit Rationale</span>
          </div>
          <p class="text-[11px] text-slate-300 text-secondary leading-relaxed">
            ${ind.benchmarkRationale}
          </p>
          ${indAnom.isAnomaly ? `
            <div class="mt-1.5 pt-1.5 border-t border-amber-500/20 text-[11px] text-amber-200">
              <strong>Triggered Sector Exception:</strong> ${indAnom.reasons.join('; ')}
            </div>
          ` : ''}
        </div>

        <!-- Sector-Specific Audit Action -->
        <div class="text-[11px] text-teal-300/90 bg-teal-950/20 border border-teal-500/30 rounded-lg p-2.5">
          <strong class="text-teal-400 block mb-0.5">Recommended Sector Inquiries:</strong>
          ${ind.auditFocus}
        </div>
      </div>
    `;
  }

  document.getElementById('drawerDemographics').innerHTML = `
    <div class="flex justify-between items-center"><span class="text-slate-400 text-secondary">Acquisition Officer:</span><span class="font-semibold text-white text-primary">${m.maoName}</span></div>
    <div class="flex justify-between items-center"><span class="text-slate-400 text-secondary">Territory:</span><span class="font-semibold text-white text-primary">${m.isdOsd}</span></div>
    <div class="flex justify-between items-center"><span class="text-slate-400 text-secondary">Registration Date:</span><span class="font-semibold text-teal-400 font-mono text-[11px]">${m.regDate}</span></div>
    <div class="flex justify-between items-center"><span class="text-slate-400 text-secondary">Active Evaluation Tenure:</span><span class="font-semibold text-white text-primary">${m.tenureMonths || 8} month(s) (Month ${m.onboardMonth || 1} to 8)</span></div>
    <div class="flex justify-between items-center"><span class="text-slate-400 text-secondary">Pre-Onboarding Months:</span><span class="font-semibold text-slate-400 text-secondary">${m.preOnboardingMonths || 0} month(s) (Prior to Registration)</span></div>
    <div class="flex justify-between items-center"><span class="text-slate-400 text-secondary">True Post-Onboard Dormancy:</span><span class="font-bold ${m.dormantMonths >= 4 ? 'text-rose-400' : m.dormantMonths > 0 ? 'text-amber-400' : 'text-emerald-400'}">${m.dormantMonths || 0} month(s)</span></div>
    <div class="flex justify-between items-center"><span class="text-slate-400 text-secondary">Address:</span><span class="font-semibold text-white text-primary truncate max-w-[200px] sm:max-w-[280px]">${m.address}</span></div>
  `;

  document.getElementById('merchantDrawer').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function exportData(type) {
  const baseList = getActiveMerchants();
  let exportList = baseList;
  let filename = 'Audit_Master_Client_Dataset';

  if (type === 'flagged') {
    exportList = baseList.filter(m => m.riskScore >= 30 || m.flags.burstReactivation || m.flags.singleCustomerRisk || m.flags.growthSpike || (m.industryAnomaly && m.industryAnomaly.isAnomaly));
    filename = 'Audit_Flagged_Suspicious_Merchants';
  } else if (type === 'dormant') {
    exportList = baseList.filter(m => m.dormantMonths >= 4 || m.auditFlag.includes('Review'));
    filename = 'Audit_Dormant_AtRisk_Merchants';
  }

  const headers = [
    'Wallet No', 'Merchant Name', 'Industry Sector', 'Sub Pillar', 'District', 'Acquisition Officer',
    'Registration Date', 'Onboard Month', 'Tenure Months', 'Pre-Onboarding Months',
    'Rate', 'August PA', 'August PC', 'August CC', 'Avg Ticket Size',
    'MoM Growth', 'Post-Onboard Dormant Months', 'Naive Jan-Aug Dormant', 'Risk Score', 'Audit Flag',
    'Sector Anomaly Flag', 'Sector Anomaly Reasons', 'Single Cust Risk', 'Burst Reactivation', 'Growth Spike', 'Total PA (8 Mos)'
  ];

  const rows = exportList.map(m => [
    `"${m.walletNo}"`,
    `"${(m.merchantName || '').replace(/"/g, '""')}"`,
    `"${m.industry?.name || 'General Retail'}"`,
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
    m.industryAnomaly?.isAnomaly ? 'YES' : 'NO',
    `"${(m.industryAnomaly?.reasons || []).join('; ').replace(/"/g, '""')}"`,
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
  // Desktop tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // Mobile bottom dock buttons
  document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // Synchronized Search (Desktop & Mobile)
  const desktopSearch = document.getElementById('globalSearchInput');
  const mobileSearch = document.getElementById('mobileGlobalSearchInput');

  if (desktopSearch) {
    desktopSearch.addEventListener('input', (e) => {
      if (mobileSearch) mobileSearch.value = e.target.value;
      applyExplorerFilters();
      switchTab('explorer');
    });
  }

  if (mobileSearch) {
    mobileSearch.addEventListener('input', (e) => {
      if (desktopSearch) desktopSearch.value = e.target.value;
      applyExplorerFilters();
      switchTab('explorer');
    });
  }

  const indFilterElem = document.getElementById('filterIndustry');
  if (indFilterElem) indFilterElem.addEventListener('change', applyExplorerFilters);

  document.getElementById('filterPillar').addEventListener('change', applyExplorerFilters);
  document.getElementById('filterFlag').addEventListener('change', applyExplorerFilters);
  document.getElementById('filterStatus').addEventListener('change', applyExplorerFilters);
  document.getElementById('btnResetFilters').addEventListener('click', () => {
    if (indFilterElem) indFilterElem.value = 'ALL';
    document.getElementById('filterPillar').value = 'ALL';
    document.getElementById('filterFlag').value = 'ALL';
    document.getElementById('filterStatus').value = 'ALL';
    if (desktopSearch) desktopSearch.value = '';
    if (mobileSearch) mobileSearch.value = '';
    applyExplorerFilters();
  });

  document.getElementById('btnPrevPage').addEventListener('click', () => {
    if (currentExplorerPage > 1) { currentExplorerPage--; renderExplorerTable(); }
  });
  document.getElementById('btnNextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredExplorerMerchants.length / explorerPageSize) || 1;
    if (currentExplorerPage < totalPages) { currentExplorerPage++; renderExplorerTable(); }
  });

  const closeDrawer = () => {
    document.getElementById('merchantDrawer').classList.add('hidden');
  };
  document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
  document.getElementById('closeDrawerBtn2').addEventListener('click', closeDrawer);
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  const openExport = () => {
    document.getElementById('exportModal').classList.remove('hidden');
  };
  const closeExport = () => {
    document.getElementById('exportModal').classList.add('hidden');
  };
  document.getElementById('openExportBtn').addEventListener('click', openExport);
  document.getElementById('closeExportBtn').addEventListener('click', closeExport);
  document.getElementById('closeExportBtn2').addEventListener('click', closeExport);
  const exportBackdrop = document.getElementById('exportBackdrop');
  if (exportBackdrop) exportBackdrop.addEventListener('click', closeExport);

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}
