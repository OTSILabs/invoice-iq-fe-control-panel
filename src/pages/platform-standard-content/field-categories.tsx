import { Tags } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"

export function FieldCategories() {
  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
      <PageHeader
        title="Field Categories"
        description="Organize invoice and document fields into standard categories."
      />

      <Card className="flex min-h-[300px] flex-col overflow-hidden rounded-xl border-border bg-card">
        <CardContent className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="bg-primary/5 p-4 rounded-full mb-3 text-primary border border-primary/10">
            <Tags className="size-8 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Field Categories Content</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
            This page will display the listing of platform standard field categories once implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
