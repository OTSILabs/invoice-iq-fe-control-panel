import type { InputFieldProps } from "@/types";
import * as React from "react"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"



export const InputField = ({
  label,
  description,
  id,
  containerClassName,
  type,
  options,
  children,
  className,
  required,
  error,
  ref,
  ...props
}: InputFieldProps) => {
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
            className={cn(
              "flex h-9 w-full appearance-none rounded-lg border border-border bg-transparent py-1 pl-3 pr-9 text-sm text-foreground outline-none transition-colors",
              "hover:border-ring/35 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/15",
              "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent",
              className,
            )}
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
          className={className}
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
