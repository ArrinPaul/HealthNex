import type { Metadata, Viewport } from "next";
import { Unbounded, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ClientProviders from "@/components/providers/ClientProviders";
import { validateEnv } from "@/lib/env-config";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Validate environment variables on server startup
validateEnv();

export const metadata: Metadata = {
  title: "HealthNex - Smart Surveillance",
  description: "Next-generation public health monitoring and early warning system.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HealthNex",
  },
  openGraph: {
    title: "HealthNex",
    description: "Next-generation public health monitoring and early warning system.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00d9ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: any;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${unbounded.variable} ${instrumentSans.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}