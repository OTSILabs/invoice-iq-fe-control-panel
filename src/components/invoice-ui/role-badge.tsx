import { SemanticBadge, type SemanticTone } from "./design-system"

function getRoleBadgeTone(role: string): SemanticTone {
  const r = role?.toLowerCase()
  if (r === "admin" || r === "global_admin" || r === "global admin") return "info"
  if (r === "user" || r === "standard user") return "accent"
  return "neutral"
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <SemanticBadge tone={getRoleBadgeTone(role)} className="font-semibold">
      {String(role)}
    </SemanticBadge>
  )
}
