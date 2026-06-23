import { cn } from "@/lib/utils";

interface TemplateFieldDialogSidebarProps {
  activeStepIndex: number;
  handleStepChange: (index: number) => void;
  steps: readonly {
    readonly title: string;
    readonly description: string;
    readonly fields: readonly string[];
  }[];
}

export function TemplateFieldDialogSidebar({
  activeStepIndex,
  handleStepChange,
  steps,
}: TemplateFieldDialogSidebarProps) {
  return (
    <aside className="overflow-hidden border-b bg-muted/15 p-3 md:border-b-0 md:border-r md:p-4">
      <nav
        aria-label="Field form sections"
        className="relative flex gap-2 overflow-x-auto md:flex-col md:gap-1.5 md:overflow-visible"
      >
        {/* Connecting line */}
        <div className="absolute left-[27px] top-[26px] bottom-[46px] w-px bg-border hidden md:block" />

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
                  ? "bg-background text-foreground shadow-sm border-border"
                  : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground",
              )}
              onClick={() => void handleStepChange(index)}
            >
              {/* Mask to block the vertical line behind the semi-transparent circle */}
              <span className="absolute left-[13px] top-[13px] size-7 rounded-full bg-background z-0 hidden md:block" />

              <span
                className={cn(
                  "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isComplete
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span
                  className={cn(
                    "truncate text-sm font-medium leading-5",
                    isActive && "font-semibold",
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
