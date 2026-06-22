import type { ReactNode } from "react";

export function PageDescription({ description }: { description: ReactNode }) {
  return (
    <p className="mt-1 text-[13px] leading-4 text-muted-foreground">
      {description}
    </p>
  );
}
