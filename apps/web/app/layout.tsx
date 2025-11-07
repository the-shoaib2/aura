import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "@aura/design-system/css";
import "./globals.css";
import { Navigation } from "../components/Navigation";
import { I18nProvider } from "../providers/I18nProvider";
import { TopLoadingBar } from "../components/TopLoadingBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "AURA - AI Automation Platform",
  description: "Intelligent automation platform with AI agents, workflows, and plugins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <I18nProvider>
          <Suspense fallback={null}>
            <TopLoadingBar />
          </Suspense>
          <Navigation />
          <main>{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
