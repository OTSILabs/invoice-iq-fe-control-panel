import type { PropsWithChildren } from "react";

export function PageDescriptiveSection({ children }: PropsWithChildren) {
  return <div className="min-w-0">{children}</div>;
}
