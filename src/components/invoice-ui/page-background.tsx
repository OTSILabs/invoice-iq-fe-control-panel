import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function PageBackground({
  className,
  contentClassName,
  children,
}: PropsWithChildren<{ className?: string; contentClassName?: string }>) {
  return (
    <div
      className={cn(
        "relative min-h-[calc(100svh-6rem)] overflow-hidden bg-background",
        className,
      )}
    >
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  );
}
