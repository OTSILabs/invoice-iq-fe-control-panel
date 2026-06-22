import { PageContainers } from "@/components/invoice-ui/page-containers";
import { Skeleton } from "@/components/ui/skeleton";
import type { TemplateDetailRow } from "./template-details.helpers";

export function TemplateDetailGrid({
  rows,
  emptyMessage = "No metadata available.",
}: {
  rows: TemplateDetailRow[];
  emptyMessage?: string;
}) {
  const visibleRows = rows.filter(
    (row) => row.always || row.value !== null && row.value !== undefined && row.value !== "",
  );

  if (!visibleRows.length) {
    return (
      <p className="rounded-md border border-dashed bg-background px-3 py-2 text-xs text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <dl className="overflow-hidden rounded-md border border-border/50 bg-card text-sm">
      {visibleRows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(7.5rem,34%)_minmax(0,1fr)] border-b border-border/50 last:border-b-0"
        >
          <dt className="min-w-0 border-r border-border/50 bg-muted/45 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/65">
            {row.label}
          </dt>
          <dd className="min-w-0 break-words px-3 py-2.5 text-[13px] leading-5 text-foreground">
            {row.value !== null && row.value !== undefined && row.value !== "" ? row.value : "N/A"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// getTagBadges moved to helpers

export function TemplateDetailsSkeleton() {
  return (
    <PageContainers>
      <section className="space-y-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-8 w-56 rounded-md bg-muted-foreground/15" />
              <Skeleton className="h-5 w-16 rounded-full bg-muted-foreground/15" />
              <Skeleton className="h-5 w-20 rounded-full bg-muted-foreground/15" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Skeleton className="h-3 w-14 rounded bg-muted-foreground/15" />
              <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
              <Skeleton className="h-3 w-24 rounded bg-muted-foreground/15" />
              <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
              <Skeleton className="h-3 w-24 rounded bg-muted-foreground/15" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-md bg-muted-foreground/15" />
            <Skeleton className="h-9 w-28 rounded-md bg-muted-foreground/15" />
            <Skeleton className="h-9 w-20 rounded-md bg-muted-foreground/15" />
          </div>
        </div>
      </section>

      <section>
        <div className="overflow-hidden rounded-md border bg-card shadow-xs">
          <div className="hidden grid-cols-[auto_2.5rem_minmax(10rem,0.8fr)_minmax(16rem,1.4fr)_minmax(10rem,14rem)_6rem] items-center gap-3 border-b bg-muted/30 px-4 py-2 md:grid">
            <span className="size-7" />
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="mx-auto h-3 w-12 rounded" />
          </div>

          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid min-h-12 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 md:grid-cols-[auto_2.5rem_minmax(10rem,0.8fr)_minmax(16rem,1.4fr)_minmax(10rem,14rem)_6rem]"
              >
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />

                <div className="min-w-0 space-y-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-40 rounded" />
                    {index === 1 ? (
                      <Skeleton className="h-5 w-16 rounded-full" />
                    ) : null}
                  </div>
                  <Skeleton className="h-3 w-full max-w-xs rounded md:hidden" />
                </div>

                <div className="hidden min-w-0 space-y-2 md:block">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>

                <div className="hidden min-w-0 md:block">
                  <Skeleton className="h-4 w-32 rounded" />
                </div>

                <div className="flex min-w-0 items-center justify-center gap-1">
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageContainers>
  );
}
