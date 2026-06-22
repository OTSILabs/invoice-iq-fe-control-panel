import * as React from "react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet"

type DrawerDirection = "top" | "right" | "bottom" | "left"

function Drawer({
  direction = "right",
  children,
  ...props
}: React.ComponentProps<typeof Sheet> & { direction?: DrawerDirection }) {
  return (
    <div data-vaul-drawer-direction={direction}>
      <Sheet {...(props as any)}>{children}</Sheet>
    </div>
  )
}

const DrawerClose = SheetClose
const DrawerContent = SheetContent
const DrawerDescription = SheetDescription
const DrawerHeader = SheetHeader
const DrawerTitle = SheetTitle

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
}
