import { DialogFooter } from "@/components/ui/dialog";

export default function TemplateFieldDialogFooterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DialogFooter className="relative z-10 border-t bg-card px-5 py-3.5">{children}</DialogFooter>;
}
