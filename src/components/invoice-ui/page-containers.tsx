import type { PropsWithChildren } from "react";

import { PageBackground } from "@/components/invoice-ui/page-background";
import { cn } from "@/lib/utils";

export function PageContainers({
  children,
  className,
  backgroundClassName,
  contentClassName,
}: PropsWithChildren<{
  className?: string;
  backgroundClassName?: string;
  contentClassName?: string;
}>) {
  return (
    <PageBackground
      className={backgroundClassName}
      contentClassName={contentClassName}
    >
      <div
        className={cn(
          "page-container",
          className,
        )}
      >
        {children}
      </div>
    </PageBackground>
  );
}
