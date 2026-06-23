import type { FieldDialogSidebarProps } from "@/types";
import { cn } from "@/lib/utils";



export function FieldDialogSidebar({
  activeStepIndex,
  handleStepChange,
  steps,
}: FieldDialogSidebarProps) {
  return (
    <aside className="overflow-hidden border-b bg-muted/15 p-3 md:border-b-0 md:border-r md:p-4">
      <nav
        aria-label="Field form sections"
        className="relative flex gap-2 overflow-x-auto md:flex-col md:gap-1.5 md:overflow-visible"
      >
        {/* Connecting line */}
        <div className="absolute left-[21px] top-[26px] bottom-[46px] w-px bg-border hidden md:block" />

        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isComplete = index < activeStepIndex;
         

          return (
            <button
              key={step.title}
              type="button"
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "relative z-10 flex min-w-56 items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors md:min-w-0 border",
                isActive
                  ? "bg-background text-foreground border-border"
                  : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
              )}
              onClick={() => void handleStepChange(index)}
            >
              {/* Mask to block the vertical line behind the semi-transparent circle */}
              <span className="absolute size-7.5 rounded-full bg-background z-0 hidden md:block" />

              <span
                className={cn(
                  "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isComplete
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                )}
              >             
                {index + 1}
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span
                  className={cn(
                    "truncate text-sm font-medium leading-5",
                    isActive && "font-semibold"
                  )}
                >
                  {step.title}
                </span>
                <span className="hidden text-xs leading-4 text-muted-foreground md:block">
                  {step.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
