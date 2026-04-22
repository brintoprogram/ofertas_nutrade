import { cn } from "@/lib/utils";

/**
 * Logo oficial da Nutrade.
 * O arquivo vive em `public/nutrade-logo.svg` — substitua por um SVG
 * de maior fidelidade (ex: vetor oficial enviado pelo time de marca)
 * sem precisar mexer neste componente.
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
        className="h-10 w-auto select-none md:h-11"
        draggable={false}
      />

      {tagline && (
        <>
          <div
            className="hidden h-8 w-px bg-border/80 md:block"
            aria-hidden
          />
          <div className="hidden text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.2em] text-muted-foreground md:block">
            Comercial
            <br />
            Exportadora LTDA
          </div>
        </>
      )}
    </div>
  );
}
