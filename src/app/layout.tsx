import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import { OfflineSupport } from "@/components/offline-support";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lagu Sion Edisi Lengkap",
    template: "%s | Lagu Sion Edisi Lengkap",
  },
  description: "Butuh lirik, tampilan PPT, chord, atau audio? Cobain kami di Lagu Sion Edisi Lengkap.",
  applicationName: "Lagu Sion Edisi Lengkap",
  keywords: ["LSED", "LSEL", "Lagu Sion Edisi Lengkap", "Lagu Sion", "lirik Lagu Sion", "chord Lagu Sion", "lagu gereja Advent", "Gereja Masehi Advent Hari Ketujuh"],
  authors: [{ name: "Peter Shaan", url: "https://petershaan.net" }],
  creator: "Peter Shaan",
  category: "music",
  alternates: { canonical: "/" },
  // Without this, an iOS home-screen icon opens as a normal Safari tab.
  appleWebApp: { capable: true, title: "Lagu Sion", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Lagu Sion Edisi Lengkap",
    title: "Lagu Sion Edisi Lengkap",
    description: "Butuh lirik, tampilan PPT, chord, atau audio? Cobain kami di Lagu Sion Edisi Lengkap.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lagu Sion Edisi Lengkap",
    description: "Butuh lirik, tampilan PPT, chord, atau audio? Cobain kami di Lagu Sion Edisi Lengkap.",
  },
};

export const viewport: Viewport = {
  themeColor: "#204FEF",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={plusJakartaSans.variable}>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <OfflineSupport />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
