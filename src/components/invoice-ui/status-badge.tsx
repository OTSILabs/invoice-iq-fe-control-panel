import { StatusBadge as DesignStatusBadge } from "./design-system"

export function StatusBadge({ status }: { status: string }) {
  return <DesignStatusBadge status={status} showDot />
}
