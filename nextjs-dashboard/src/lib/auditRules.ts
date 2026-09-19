import { Merchant, PortfolioStats } from '../types';

export function calculatePortfolioStats(merchants: Merchant[]): PortfolioStats {
  let activeCount = 0;
  let amberCount = 0;
  let dormantCount = 0;
  let totalPA = 0;
  let augPA = 0;
  let totalPC = 0;
  let augPC = 0;

  const flaggedCounts = {
    suddenReactivation: 0,
    highDormancy: 0,
    monitor: 0,
    healthy: 0,
    burstReactivation: 0,
    singleCustomerRisk: 0,
    growthSpike: 0,
    cliffDrop: 0,
    microTicket: 0,
    highRateSurge: 0,
    megaVolume: 0,
  };

  for (const m of merchants) {
    if (m.augActive === 'Active') activeCount++;
    else if (m.augActive === 'Amber') amberCount++;
    else dormantCount++;

    totalPA += m.totalPA;
    augPA += m.augPA;
    totalPC += m.totalPC;
    augPC += m.augPC;

    if (m.auditFlag === 'Sudden Reactivation - Review') flaggedCounts.suddenReactivation++;
    if (m.auditFlag === 'High Dormancy - Review') flaggedCounts.highDormancy++;
    if (m.auditFlag === 'Monitor') flaggedCounts.monitor++;
    if (m.auditFlag === 'Healthy/Active') flaggedCounts.healthy++;

    if (m.flags.burstReactivation) flaggedCounts.burstReactivation++;
    if (m.flags.singleCustomerRisk) flaggedCounts.singleCustomerRisk++;
    if (m.flags.growthSpike) flaggedCounts.growthSpike++;
    if (m.flags.cliffDrop) flaggedCounts.cliffDrop++;
    if (m.flags.microTicketRisk) flaggedCounts.microTicket++;
    if (m.flags.highRateSurge) flaggedCounts.highRateSurge++;
    if (m.flags.megaVolume) flaggedCounts.megaVolume++;
  }

  const avgAugTicketSize = augPC > 0 ? augPA / augPC : 0;

  return {
    totalMerchants: merchants.length,
    activeCount,
    amberCount,
    dormantCount,
    totalPA,
    augPA,
    totalPC,
    augPC,
    avgAugTicketSize,
    flaggedCounts,
  };
}

export function formatBDT(val: number): string {
  if (val >= 10000000) {
    return `BDT ${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `BDT ${(val / 100000).toFixed(2)} Lac`;
  }
  return `BDT ${Math.round(val).toLocaleString()}`;
}

export function formatNumber(val: number): string {
  return Math.round(val).toLocaleString();
}

export function formatPercent(val: number): string {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

export const INDUSTRY_DEFINITIONS: Record<string, import('../types').IndustryProfile> = {
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

export function getMerchantIndustry(m: Merchant): import('../types').IndustryProfile {
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

export function assessIndustryAnomaly(m: Merchant, ind: import('../types').IndustryProfile): import('../types').IndustryAnomaly {
  const reasons: string[] = [];
  const flags: string[] = [];
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

  // Macro anomalies
  if (m.flags && (m.flags.megaVolume || m.flags.cliffDrop || m.flags.growthSpike)) {
    isAnomaly = true;
    if (m.flags.megaVolume) reasons.push(`Mega-Volume Outlier (${formatBDT(m.augPA)} Aug / ${formatBDT(m.totalPA)} total)`);
    if (m.flags.cliffDrop) reasons.push(`Cliff-edge dropout: July ${formatBDT(m.monthly[6]?.pa || 0)} dropped to BDT 0 in August`);
    if (m.flags.growthSpike && !flags.includes('SURGE_CEILING')) reasons.push(`Extreme MoM growth spike (+${m.growth.toFixed(1)}%)`);
  }

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

export function enrichMerchantsWithIndustry(list: Merchant[]): void {
  list.forEach((m) => {
    m.industry = getMerchantIndustry(m);
    m.industryName = m.industry.name;
    m.industryAnomaly = assessIndustryAnomaly(m, m.industry);
  });
}
