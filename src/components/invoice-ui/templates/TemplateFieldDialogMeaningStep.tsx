import { Controller, type UseFormReturn } from "react-hook-form";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RequiredLabel } from "./RequiredLabel";
import { ExtractionFieldLabels } from "./template-field-label";

const FIELD_MESSAGE_CLASS = "text-xs leading-4";

interface TemplateFieldDialogMeaningStepProps {
  form: UseFormReturn<any>;
}

export function TemplateFieldDialogMeaningStep({
  form,
}: TemplateFieldDialogMeaningStepProps) {
  return (
    <div className="grid gap-5">
      <Controller
        control={form.control}
        name="short_desc"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              hint={
                ExtractionFieldLabels.shortDescription.description
              }
            >
              {
                ExtractionFieldLabels.shortDescription
                  .questionLabel
              }
            </RequiredLabel>
            <Input
              {...formField}
              placeholder={
                ExtractionFieldLabels.shortDescription.placeholder
              }
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid ? (
              <FieldError
                className={FIELD_MESSAGE_CLASS}
                errors={[fieldState.error]}
              />
            ) : null}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="field_long_description"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              hint={ExtractionFieldLabels.longDescription.description}
            >
              {ExtractionFieldLabels.longDescription.questionLabel}
            </RequiredLabel>
            <Textarea
              {...formField}
              rows={4}
              className="h-24 min-h-24 max-h-24 resize-none"
              placeholder={
                ExtractionFieldLabels.longDescription.placeholder
              }
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid ? (
              <FieldError
                className={FIELD_MESSAGE_CLASS}
                errors={[fieldState.error]}
              />
            ) : null}
          </Field>
        )}
      />
    </div>
  );
}
