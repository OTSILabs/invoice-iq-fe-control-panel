import type { TemplateFieldDialogDetailsStepProps } from "@/types";
import { Controller } from "react-hook-form";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequiredLabel } from "./RequiredLabel";
import { ExtractionFieldLabels } from "./template-field-label";

const VALUE_TYPE_OPTIONS = [
  { value: "header", label: "Header" },
  { value: "item", label: "Line Items" },
] as const;

const FIELD_MESSAGE_CLASS = "text-xs leading-4";



export function TemplateFieldDialogDetailsStep({
  form,
  dataTypeOptions,
  fieldCategoryOptions,
}: TemplateFieldDialogDetailsStepProps) {
  return (
    <div className="grid gap-5">
      <Controller
        control={form.control}
        name="field_category_code"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel hint="Choose the category this field belongs to.">
              Field category
            </RequiredLabel>
            <Select
              value={formField.value}
              onValueChange={(value) => {
                form.setValue("field_category_code", value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={fieldState.invalid}
              >
                <SelectValue placeholder="Select field category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {fieldCategoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
        name="field_label"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              hint={ExtractionFieldLabels.fieldName.description}
            >
              {ExtractionFieldLabels.fieldName.questionLabel}
            </RequiredLabel>
            <Input
              {...formField}
              placeholder={ExtractionFieldLabels.fieldName.placeholder}
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
        name="data_type_code"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              hint={ExtractionFieldLabels.dataType.description}
            >
              {ExtractionFieldLabels.dataType.questionLabel}
            </RequiredLabel>
            <Select
              value={formField.value}
              onValueChange={(value) => {
                form.setValue("data_type_code", value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={fieldState.invalid}
              >
                <SelectValue
                  placeholder={ExtractionFieldLabels.dataType.placeholder}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dataTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
        name="header_item"
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredLabel
              hint={ExtractionFieldLabels.valueType.description}
            >
              {ExtractionFieldLabels.valueType.questionLabel}
            </RequiredLabel>
            <Select
              value={formField.value}
              onValueChange={(value) => {
                form.setValue("header_item", value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={fieldState.invalid}
              >
                <SelectValue
                  placeholder={ExtractionFieldLabels.valueType.placeholder}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {VALUE_TYPE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
