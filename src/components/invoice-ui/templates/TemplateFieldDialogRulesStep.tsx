import type { TemplateFieldDialogRulesStepProps } from "@/types";
import { Controller } from "react-hook-form";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { RequiredLabel } from "./RequiredLabel";
import { ExtractionFieldLabels } from "./template-field-label";

const FIELD_MESSAGE_CLASS = "text-xs leading-4";



export function TemplateFieldDialogRulesStep({
  form,
}: TemplateFieldDialogRulesStepProps) {
  return (
    <div className="space-y-5">
      <Controller
        control={form.control}
        name="labels"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              hint={ExtractionFieldLabels.alias.description}
            >
              {ExtractionFieldLabels.alias.questionLabel}
            </RequiredLabel>
            <TagInput
              value={formField.value}
              onChange={(value) => {
                form.setValue("labels", value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              placeholder={ExtractionFieldLabels.alias.placeholder}
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
        name="extraction_instructions"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              hint={
                ExtractionFieldLabels.extractionInstructions
                  .description
              }
            >
              {
                ExtractionFieldLabels.extractionInstructions
                  .questionLabel
              }
            </RequiredLabel>
            <Textarea
              {...formField}
              rows={4}
              className="h-24 min-h-24 max-h-24 resize-none"
              placeholder={
                ExtractionFieldLabels.extractionInstructions
                  .placeholder
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
        name="examples"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              hint={ExtractionFieldLabels.examples.description}
            >
              {ExtractionFieldLabels.examples.questionLabel}
            </RequiredLabel>
            <Textarea
              {...formField}
              rows={4}
              className="h-24 min-h-24 max-h-24 resize-none"
              placeholder={ExtractionFieldLabels.examples.placeholder}
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
        name="allowed_static_list"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              required={false}
              hint="Add specific values that should be treated as valid for this field when applicable."
            >
              Allowed values
            </RequiredLabel>
            <TagInput
              value={formField.value}
              onChange={(value) => {
                form.setValue("allowed_static_list", value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              placeholder="e.g. Approved, Pending, Rejected"
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
