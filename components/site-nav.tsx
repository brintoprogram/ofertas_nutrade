"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

const links = [
  { href: "/", label: "Ofertas" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <BrandLogo />
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border/60 bg-background/60 p-1 shadow-sm">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-glow-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
