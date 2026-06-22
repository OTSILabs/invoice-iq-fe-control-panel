import type { ComponentProps } from "react";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";

export const PageLoader = ({ className, ...props }: ComponentProps<"div">) => {
    return <div className={cn("flex flex-col justify-center items-center h-full gap-3", className)} {...props}>
        <Spinner />
        <p className="text-xs text-muted-foreground">Loading please wait...</p>
    </div>
}
