import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { InputField } from "@/components/ui/input-field";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import type { ExtractionFieldFormValues } from "@/schemas/extraction-schema";

interface FieldDialogDetailsStepProps {
  register: UseFormRegister<ExtractionFieldFormValues>;
  errors: FieldErrors<ExtractionFieldFormValues>;
  categories: any[];
  dataTypes: any[];
  isEdit: boolean;
  isSaving: boolean;
}

export function FieldDialogDetailsStep({
  register,
  errors,
  categories,
  dataTypes,
  isEdit,
  isSaving,
}: FieldDialogDetailsStepProps) {
  return (
    <div className="grid gap-5">
      <InputField
        id="field_id"
        label="Field ID / Code"
        required
        disabled={isEdit || isSaving}
        error={errors.field_id?.message}
        placeholder="e.g. invoice_total"
        {...register("field_id")}
      />

      <InputField
        id="field_label"
        label="UI Label"
        required
        disabled={isSaving}
        error={errors.field_label?.message}
        placeholder="e.g. Invoice Total"
        {...register("field_label")}
      />

      <Field>
        <FieldLabel>Field Category <span className="text-destructive">*</span></FieldLabel>
        <NativeSelect id="field_category_code" disabled={isSaving} {...register("field_category_code")}>
          <option value="">Select category...</option>
          {categories.map((cat) => (
            <option key={cat.field_category_code} value={cat.field_category_code}>
              {cat.ui_label || cat.field_category_code}
            </option>
          ))}
        </NativeSelect>
        {errors.field_category_code?.message && (
          <FieldError>{errors.field_category_code.message}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel>Data Type <span className="text-destructive">*</span></FieldLabel>
        <NativeSelect id="data_type_code" disabled={isSaving} {...register("data_type_code")}>
          <option value="">Select type...</option>
          {dataTypes.map((dt) => (
            <option key={dt.data_type_code} value={dt.data_type_code}>
              {dt.display_label || dt.data_type_code}
            </option>
          ))}
        </NativeSelect>
        {errors.data_type_code?.message && (
          <FieldError>{errors.data_type_code.message}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel>Header or Line Item <span className="text-destructive">*</span></FieldLabel>
        <NativeSelect id="header_item" disabled={isSaving} {...register("header_item")}>
          <option value="header">Header Field</option>
          <option value="item">Line Item Field</option>
        </NativeSelect>
        {errors.header_item?.message && (
          <FieldError>{errors.header_item.message}</FieldError>
        )}
      </Field>
    </div>
  );
}
