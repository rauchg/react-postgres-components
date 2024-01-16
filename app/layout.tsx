import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "React Postgres Components",
  description: "An experiment of deploying functions directly inside Postgres",
  metadataBase: new URL("https://react-postgres-components.vercel.app"),
  openGraph: {
    title: "React Postgres Components",
    url: "https://react-postgres-components.vercel.app",
    siteName: "An experiment of deploying functions directly inside Postgres",
  },
  twitter: {
    title: "React Postgres Components",
    card: "summary_large_image",
    site: "@rauchg",
    creator: "@rauchg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
