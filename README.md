# Audit-Practice
### Client Transaction Audit & Risk Analytics Dashboard (Jan - Aug 2026)

A comprehensive transaction audit and risk analytics platform built for analyzing client portfolio data (961 merchant accounts) across 8 months of activity (January through August 2026).

---

## ðŸŒŸ Features

- **Executive KPI Dashboard**: Real-time portfolio totals, August turnover, volume, and active client distributions.
- **Tenure-Adjusted Dormancy Engine**: Calculates true dormancy measured strictly from each merchant's official bKash registration/onboarding month forward, eliminating artificial dormancy penalties for pre-registration months.
- **Global MAO Navbar Filter**: Filter the entire application synchronously by Acquisition Officer (MAO) across all KPIs, charts, anomaly tables, and AML alerts.
- **Anomaly Detection Radar**: Identifies month-over-month growth surges (>300%), mega-volume outliers (>5M BDT), and cliff-edge volume drops.
- **AML & Suspicious Transaction Screener**: Detects single-customer looping / self-dealing risks (low unique customer ratio), dormant burst reactivations, micro-structuring, and 10% rate contract surges.
- **Merchant 360 Explorer & Audit Drawer**: Searchable, sortable client directory with an interactive 8-month history drawer, pre-onboarding distinction, and an auditor action checklist.
- **Workpaper Export**: One-click standardized CSV exports filtered by risk category and assigned officer.
- **Executive Dark & Light Mode**: Instant theme toggle with dynamic Chart.js and Recharts axis/grid adaptation.

---

## ðŸš€ Live Demo & Launch

### Instant Zero-Dependency Browser Version
Double-click `index.html` or run:
`cmd
start_dashboard.cmd
`
The dashboard will start on `http://localhost:3000/` and automatically launch in your browser.

### Next.js 14 Production App
Located in the 
extjs-dashboard/ folder:
`ash
cd nextjs-dashboard
npm install
npm run dev
`
Open [http://localhost:3000](http://localhost:3000) to view the Next.js App Router version.

---

## ðŸ“Š Dataset Structure

- **Records**: 961 verified merchant client accounts across 6 Acquisition Officers.
- **Monthly Trajectory**: Jan '26 (2.15M BDT) $\to$ Aug '26 (323.89M BDT).
- **Sanitized Dataset**: Available in merchants_cleaned.json and data.js.

---

## ðŸ›¡ï¸ License
Internal Audit Practice Project 2026.