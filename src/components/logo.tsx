"use client";

import { cn } from "@/lib/utils";

export function LogoOTS({ className = "" }: { className?: string }) {
  return <img src="/logo/otsi.svg" className={cn(className)} alt="OTSI Logo" />;
}
