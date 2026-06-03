import * as React from "react"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export interface InputFieldProps extends React.ComponentProps<typeof Input> {
  label: React.ReactNode
  description?: React.ReactNode
  containerClassName?: string
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, description, id, containerClassName, ...props }, ref) => {
    return (
      <Field className={containerClassName}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Input id={id} ref={ref} {...props} />
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    )
  }
)

InputField.displayName = "InputField"
