import { LogoOTS } from "./logo";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();

type PoweredByFooterProps = {
  className?: string
  variant?: "bar" | "sidebar"
}

export function PoweredByFooter({ className = "", variant = "bar" }: PoweredByFooterProps) {
  if (variant === "sidebar") {
    return (
      <div
        className={cn(
          "rounded-lg border border-sidebar-border/70 bg-sidebar-accent/35 px-3 py-2.5 text-center text-sidebar-foreground/68",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2 text-[11px] leading-none">
          <span>Powered by</span>
          <a
            href="https://otsi-global.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-sm outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-sidebar-ring/40"
            aria-label="Visit OTSI Global"
          >
            <LogoOTS className="h-auto w-10 brightness-0 invert opacity-90" />
          </a>
        </div>
        <p className="mt-1.5 text-[10px] leading-3 text-sidebar-foreground/42">
          Copyright © {currentYear} OTSI
        </p>
      </div>
    )
  }

  return (
    <footer
      className={cn(
        "flex shrink-0 flex-col items-center justify-center gap-1 px-4 py-1.5 text-center text-[11px] leading-4 text-muted-foreground sm:flex-row sm:gap-2",
        className
      )}
    >
      <span>Powered by</span>
      <a
        href="https://otsi-global.com"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/30"
        aria-label="Visit OTSI Global"
      >
        <LogoOTS className="h-auto w-12" />
      </a>
      <span className="hidden text-border sm:inline">|</span>
      <span>
        Copyright © {currentYear} Object Technology Solutions, Inc. All rights reserved.
      </span>
    </footer>
  );
}
