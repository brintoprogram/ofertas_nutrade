import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Logo oficial da Nutrade.
 * Arquivo em `public/logo.png` — substitua pelo vetor oficial se disponível
 * (basta sobrescrever o arquivo ou trocar o src abaixo) sem mexer no resto
 * do componente.
 */
export function BrandLogo({
  tagline = "Comercial Exportadora LTDA",
  className,
}: {
  tagline?: string | false;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Nutrade"
        className="h-16 w-auto select-none md:h-20"
        draggable={false}
      />

      {tagline && (
        <>
          <div
            className="hidden h-12 w-px bg-border/80 md:block"
            aria-hidden
          />
          <div className="hidden text-xs font-semibold uppercase leading-[1.35] tracking-[0.2em] text-muted-foreground md:block">
            Comercial
            <br />
            Exportadora LTDA
          </div>
        </>
      )}
    </div>
  );
}
