import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"
import { HoverCardTrigger } from "./hover-card-trigger"
import { HoverCardContent } from "./hover-card-content"

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

export { HoverCard, HoverCardTrigger, HoverCardContent }

