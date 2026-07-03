import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer  justify-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground  hover:bg-primary/92 hover:shadow-md hover:shadow-primary/15 active:translate-y-px",
        outline: "border border-border/70 bg-background/80  hover:bg-muted/60 hover:text-foreground",
        ghost: "bg-transparent hover:bg-muted/65",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-white  shadow-destructive/15 hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-5 text-sm",
        xs: "h-7 px-2.5 text-xs",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-xs": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonVariantsProps = VariantProps<typeof buttonVariants>

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentPropsWithoutRef<"button"> &
  ButtonVariantsProps & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    // props are cast to any to avoid incompatible ref type propagation
    // when `asChild` is true and `Slot.Root` is used.
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)}
    />
  )
}

export { Button }
