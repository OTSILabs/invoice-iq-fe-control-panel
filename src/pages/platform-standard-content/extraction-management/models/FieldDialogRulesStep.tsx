import type {FieldDialogRulesStepProps} from "@/types";
import {InputField} from "@/components/ui/input-field";
import {Field, FieldLabel, FieldError} from "@/components/ui/field";
import {NativeSelect} from "@/components/ui/native-select";
import {Textarea} from "@/components/ui/textarea";



export function FieldDialogRulesStep({
  register,
  errors,
  valueMode,
  referenceLists,
  isSaving,
}: FieldDialogRulesStepProps) {
  return (
    <div className="space-y-5">
      <InputField
        id="labels_raw"
        label="Alternate Labels (Comma-separated)"
        disabled={isSaving}
        error={errors.labels_raw?.message}
        placeholder="e.g. Total Amt, Total, Gross Amount"
        {...register("labels_raw")}
      />

      <div className="space-y-1">
        <FieldLabel>Extraction Instructions (Comma-separated)</FieldLabel>
        <Textarea
          id="extraction_instructions_raw"
          disabled={isSaving}
          rows={4}
          className="h-24 min-h-24 max-h-24 resize-none text-sm"
          placeholder="e.g. Extract the value next to 'TOTAL', strip currency symbols"
          {...register("extraction_instructions_raw")}
        />
        {errors.extraction_instructions_raw?.message && (
          <FieldError>{errors.extraction_instructions_raw.message}</FieldError>
        )}
      </div>

      <div className="space-y-1">
        <FieldLabel>Examples (Comma-separated)</FieldLabel>
        <Textarea
          id="examples_raw"
          disabled={isSaving}
          rows={4}
          className="h-24 min-h-24 max-h-24 resize-none text-sm"
          placeholder="e.g. $150.00, 105.20"
          {...register("examples_raw")}
        />
        {errors.examples_raw?.message && (
          <FieldError>{errors.examples_raw.message}</FieldError>
        )}
      </div>

      <Field>
        <FieldLabel>Allowed Value Mode <span className="text-destructive">*</span></FieldLabel>
        <NativeSelect id="allowed_value_mode" disabled={isSaving} {...register("allowed_value_mode")}>
          <option value="any">Any (Unrestricted)</option>
          <option value="static_list">Static List</option>
          <option value="reference_list">Reference List</option>
        </NativeSelect>
        {errors.allowed_value_mode?.message && (
          <FieldError>{errors.allowed_value_mode.message}</FieldError>
        )}
      </Field>

      {valueMode === "static_list" && (
        <InputField
          id="allowed_static_list_raw"
          label="Static Allowed Values (Comma-separated)"
          required
          disabled={isSaving}
          error={errors.allowed_static_list_raw?.message}
          placeholder="e.g. active, pending, suspended"
          {...register("allowed_static_list_raw")}
        />
      )}

      {valueMode === "reference_list" && (
        <Field>
          <FieldLabel>Allowed Reference List Key <span className="text-destructive">*</span></FieldLabel>
          <NativeSelect
            id="allowed_reference_registry_key"
            disabled={isSaving}
            {...register("allowed_reference_registry_key")}
          >
            <option value="">Select reference list...</option>
            {referenceLists.map((ref) => (
              <option key={ref.registry_key} value={ref.registry_key}>
                {ref.display_label || ref.registry_key}
              </option>
            ))}
          </NativeSelect>
          {errors.allowed_reference_registry_key?.message && (
            <FieldError>{errors.allowed_reference_registry_key.message}</FieldError>
          )}
        </Field>
      )}

      <InputField
        id="default_value"
        label="Default Value"
        disabled={isSaving}
        error={errors.default_value?.message}
        placeholder="e.g. 0.00"
        {...register("default_value")}
      />
    </div>
  );
}
