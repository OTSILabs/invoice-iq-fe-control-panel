import * as React from "react"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: React.ReactNode
  description?: React.ReactNode
  containerClassName?: string
  options?: { label: string; value: string | number }[]
  error?: string
}

export const InputField = React.forwardRef<HTMLInputElement | HTMLSelectElement, InputFieldProps>(
  ({ label, description, id, containerClassName, type, options, children, className, required, error, ...props }, ref) => {
    return (
      <Field className={containerClassName}>
        {label && (
          <FieldLabel htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-0.1">*</span>}
          </FieldLabel>
        )}

        {type === "select" ? (
          <div className="relative w-full">
            <select
              id={id}
              ref={ref as React.Ref<HTMLSelectElement>}
              className={[
                "flex h-9 w-full appearance-none rounded-lg border border-input",
                "bg-inherit pl-3 pr-9 py-1 text-sm text-foreground",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className,
              ].filter(Boolean).join(" ")}
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        ) : (
          <Input
            id={id}
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            className={[
              "h-9 rounded-lg border border-input bg-inherit px-3 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            ].filter(Boolean).join(" ")}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {description && (
          <FieldDescription className="text-xs text-muted-foreground">
            {description}
          </FieldDescription>
        )}

        {error && (
          <span className="px-1 text-[11px] font-medium text-destructive">
            {error}
          </span>
        )}
      </Field>
    )
  }
)

InputField.displayName = "InputField"