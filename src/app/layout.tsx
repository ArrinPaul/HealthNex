import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import ClientProviders from "@/components/ClientProviders";
import { validateEnv } from "@/lib/env-config";

// Validate environment variables on server startup
validateEnv();

export const metadata: Metadata = {
  title: "Smart Health Surveillance System",
  description: "Early Warning System for Health Officials and Community - Disease Monitoring and Water Quality Tracking",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Health Surveillance",
  },
  openGraph: {
    title: "Smart Health Surveillance System",
    description: "Early Warning System for Disease Monitoring and Water Quality Tracking",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: any;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}