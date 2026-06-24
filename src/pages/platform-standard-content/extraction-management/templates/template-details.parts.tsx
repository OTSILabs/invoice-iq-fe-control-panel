import { Fragment } from "react";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import type { TemplateDetailRow } from "./template-details.helpers";

export function TemplateDetailGrid({ rows }: { rows: TemplateDetailRow[] }) {
	return (
		<div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
			{rows.map((row) => {
				const shouldRender = row.always || (row.value !== null && row.value !== undefined && String(row.value) !== "");
				if (!shouldRender) return null;

				return (
					<dl key={row.label} className="min-w-0 break-words">
						<dt className="text-xs text-muted-foreground">{row.label}</dt>
						<dd className="mt-1 text-sm text-foreground">{row.value}</dd>
					</dl>
				);
			})}
		</div>
	);
}

export function TemplateDetailsSkeleton() {
	return (
		<PageContainers>
			<div className="space-y-6">
				<div className="space-y-3">
					<Skeleton className="h-6 w-64" />
					<Skeleton className="h-4 w-40" />
				</div>

				<Card className="surface-card gap-0 overflow-hidden p-0">
					<CardHeader className="border-b border-border/60 bg-muted/15 p-5">
						<Skeleton className="h-5 w-48" />
					</CardHeader>
					<CardContent className="p-5">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<Fragment key={i}>
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-5 w-full" />
								</Fragment>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</PageContainers>
	);
}
