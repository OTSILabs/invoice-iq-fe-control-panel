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
          "mx-auto w-full max-w-[1680px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7",
          className,
        )}
      >
        {children}
      </div>
    </PageBackground>
  );
}
