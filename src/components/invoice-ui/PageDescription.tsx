import type { ReactNode } from "react";

export function PageDescription({ description }: { description: ReactNode }) {
  return (
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
      {description}
    </p>
  );
}
