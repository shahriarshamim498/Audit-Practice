import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Transaction Audit & Risk Analytics Dashboard",
  description: "Advanced transaction monitoring, AML screening, anomaly detection, and dormancy tracking dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
