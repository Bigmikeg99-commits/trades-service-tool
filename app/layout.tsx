export const runtime = "nodejs";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SoloPro — Field Service Software for Contractors",
  description: "Fast quotes, professional proposals, and smart scheduling for HVAC, plumbing, electrical, and general contractors. Built for the truck, not the conference room.",
  metadataBase: new URL("https://solopro.dev"),
  alternates: {
    canonical: "https://solopro.dev",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SoloPro — Field Service Software for Contractors",
    description: "Fast quotes, professional proposals, and smart scheduling for HVAC, plumbing, electrical, and general contractors.",
    url: "https://solopro.dev",
    siteName: "SoloPro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoloPro — Field Service Software for Contractors",
    description: "Fast quotes, professional proposals, and smart scheduling for HVAC, plumbing, electrical, and general contractors.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
