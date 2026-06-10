import { LogoOTS } from "./logo";

const currentYear = new Date().getFullYear();

export function PoweredByFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`flex shrink-0 flex-col items-center justify-center gap-1 px-4 py-1.5 text-center text-[11px] leading-4 text-muted-foreground sm:flex-row sm:gap-2 ${className}`}
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
