import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nutrade — Comercial Exportadora LTDA",
  description:
    "Plataforma de cadastro e análise de ofertas de commodities agrícolas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-hero min-h-screen font-sans">
        <SiteNav />
        <main className="fade-in">{children}</main>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
