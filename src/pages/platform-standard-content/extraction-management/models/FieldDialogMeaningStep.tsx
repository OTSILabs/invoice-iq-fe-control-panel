import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { InputField } from "@/components/ui/input-field";
import { FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { ExtractionFieldFormValues } from "@/schemas/extraction-schema";

interface FieldDialogMeaningStepProps {
  register: UseFormRegister<ExtractionFieldFormValues>;
  errors: FieldErrors<ExtractionFieldFormValues>;
  isSaving: boolean;
}

export function FieldDialogMeaningStep({
  register,
  errors,
  isSaving,
}: FieldDialogMeaningStepProps) {
  return (
    <div className="grid gap-5">
      <InputField
        id="short_desc"
        label="Short Description"
        disabled={isSaving}
        error={errors.short_desc?.message}
        placeholder="Brief summary of what this field extracts..."
        {...register("short_desc")}
      />

      <div className="space-y-1">
        <FieldLabel>Detailed Description</FieldLabel>
        <Textarea
          id="field_long_description"
          disabled={isSaving}
          rows={4}
          className="h-24 min-h-24 max-h-24 resize-none text-sm"
          placeholder="Full description or markdown rules for parsing..."
          {...register("field_long_description")}
        />
        {errors.field_long_description?.message && (
          <FieldError>{errors.field_long_description.message}</FieldError>
        )}
      </div>
    </div>
  );
}
