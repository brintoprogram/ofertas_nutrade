import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimensions = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-12 w-12 rounded-2xl",
  }[size];

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const dotSize = {
    sm: "h-2 w-2 ring-2",
    md: "h-2.5 w-2.5 ring-2",
    lg: "h-3 w-3 ring-[3px]",
  }[size];

  return (
    <div
      className={cn(
        "relative overflow-visible shadow-glow-primary",
        dimensions,
        className
      )}
    >
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover ring-1 ring-white/10",
          dimensions
        )}
      >
        {/* glass highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
        <Leaf className={cn("relative text-white drop-shadow-sm", iconSize)} />
      </div>
      {/* gold seed dot */}
      <div
        className={cn(
          "absolute -right-0.5 -top-0.5 rounded-full bg-brand-gold ring-background",
          dotSize
        )}
      />
    </div>
  );
}

export function BrandWordmark({
  tagline,
  className,
}: {
  tagline?: string;
  className?: string;
}) {
  return (
    <div className={cn("leading-tight", className)}>
      <div className="text-[15px] font-bold tracking-[0.18em] text-foreground">
        NUTRADE
      </div>
      {tagline && (
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {tagline}
        </div>
      )}
    </div>
  );
}

export function BrandLogo({
  size = "md",
  tagline = "Commodities Trading",
}: {
  size?: "sm" | "md" | "lg";
  tagline?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={size} />
      <BrandWordmark tagline={tagline} />
    </div>
  );
}
