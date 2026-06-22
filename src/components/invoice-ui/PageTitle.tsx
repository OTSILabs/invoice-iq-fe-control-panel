import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageTitle({
  title,
  className,
}: {
  title: ReactNode;
  className?: string;
}) {
  return (
    <h1 className={cn("text-lg font-semibold leading-6 text-foreground", className)}>
      {title}
    </h1>
  );
}
