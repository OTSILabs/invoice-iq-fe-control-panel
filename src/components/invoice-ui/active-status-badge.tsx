import { StatusBadge as DesignStatusBadge, type SemanticTone } from "./design-system"

export function ActiveStatusBadge({
  status,
  active,
  color,
  className
}: {
  status?: string | null
  active?: boolean | null
  color?: "green" | "blue" | "red" | "yellow" | "gray" | "rose"
  className?: string
}) {
  const normalized = status ? status.toLowerCase().trim() : (active ?? true ? "active" : "inactive")
  let tone: SemanticTone = "neutral"
  if (color) {
    tone = color === "green"
      ? "success"
      : color === "blue"
      ? "info"
      : color === "red"
      ? "danger"
      : color === "yellow"
      ? "warning"
      : color === "rose"
      ? "danger"
      : "neutral"
  } else {
    tone = ["success", "active", "complete", "completed"].includes(normalized)
      ? "success"
      : ["blocked", "deactivated", "failed"].includes(normalized)
      ? "danger"
      : ["expired"].includes(normalized)
      ? "danger"
      : ["in_progress", "inprogress"].includes(normalized)
      ? "info"
      : ["pending"].includes(normalized)
      ? "warning"
      : "neutral"
  }

  return (
    <DesignStatusBadge
      status={status || (active ?? true ? "Active" : "Inactive")}
      tone={tone}
      className={className}
    />
  )
}
