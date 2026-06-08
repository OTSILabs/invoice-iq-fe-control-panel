import * as React from "react"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: React.ReactNode
  description?: React.ReactNode
  containerClassName?: string
  options?: { label: string; value: string | number }[]
}

export const InputField = React.forwardRef<HTMLInputElement | HTMLSelectElement, InputFieldProps>(
  ({ label, description, id, containerClassName, type, options, children, ...props }, ref) => {
    return (
      <Field className={containerClassName}>
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        {type === "select" ? (
          <div className="relative w-full">
            <select
              id={id}
              ref={ref as React.Ref<HTMLSelectElement>}
              className="flex h-9 w-full appearance-none rounded-md border border-input bg-transparent pl-3 pr-8 py-1 text-sm  transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          </div>
        ) : (
          <Input id={id} type={type} ref={ref as React.Ref<HTMLInputElement>} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    )
  }
)

InputField.displayName = "InputField"
