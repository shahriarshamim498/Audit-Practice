# Client Transaction Audit & Risk Analytics Dashboard (Next.js)

A high-performance audit intelligence and risk analytics platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

## Features
- **Executive Overview**: Portfolio turnover (Jan-Aug '26), transaction velocity, client health status (Active, Amber, Zero Transacting).
- **Trends & Macro Studio**: 8-month time-series progression for Payment Amount (PA), Payment Count (PC), and Ticket Size with Sub-Pillar and District breakdowns.
- **Anomaly Radar**: Outlier detection for extreme MoM growth surges (>300%), Mega-volume accounts (Ambala Commerce), and cliff-edge volume dropouts.
- **AML & Suspicious Activity Screener**: Single-customer domination detection ($CC \ll PC$), dormant burst reactivations, micro-ticket structuring ($< \text{BDT } 100$), and 10% commission rate tier activity.
- **Dormancy Matrix**: 0 to 7 months inactivity histogram, churn tracking, and Sudden Reactivation review queue.
- **Merchant 360 Explorer**: Searchable, filterable, sortable data grid across all 961 clients with slide-out audit drawer.
- **Audit Workpaper Export**: Instant CSV export for internal review and audit documentation.

## Running the Next.js Project

### Prerequisites
- Node.js (v18.17+ or v20+ LTS)
- npm or yarn

### Quick Start
```bash
# 1. Navigate to the dashboard directory
cd nextjs-dashboard

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
