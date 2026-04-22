import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nutrade — Ofertas de Commodities",
  description: "Cadastro de ofertas de commodities agrícolas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-background">
          <SiteNav />
          <main>{children}</main>
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
