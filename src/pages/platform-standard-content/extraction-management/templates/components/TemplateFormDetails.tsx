import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import type { TemplateFormValues } from "../template-form";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <FieldLabel>
      {children}
      <span className="text-destructive">*</span>
    </FieldLabel>
  );
}

export function TemplateFormDetails({
  control,
  isEditMode,
}: {
  control: Control<TemplateFormValues>;
  isEditMode: boolean;
}) {
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <Controller
          name="template_id"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RequiredLabel>Template ID</RequiredLabel>
              <Input
                {...field}
                placeholder="e.g. default_invoice"
                readOnly={isEditMode}
                className={isEditMode ? "opacity-50 cursor-not-allowed bg-muted" : ""}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RequiredLabel>Template Name</RequiredLabel>
              <Input
                {...field}
                placeholder="e.g. Standard Vendor Invoice"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="business_process_tags"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Business Process Tags</FieldLabel>
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g. accounts_payable, ap"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="document_type_tags"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Document Type Tags</FieldLabel>
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g. invoice, credit_note"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="taxation_tags"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Taxation Tags</FieldLabel>
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g. eu_vat, vat"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </div>

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              {...field}
              placeholder="Describe when this template should be used."
              className="min-h-24"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        )}
      />
    </>
  );
}
