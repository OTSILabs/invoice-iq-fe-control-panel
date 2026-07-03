import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type { ApiRecord } from "@/api/api.helpers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { getTemplateName } from "./template-data";

const cloneTemplateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required."),
  description: z.string().trim().optional(),
});

export type CloneTemplateFormValues = z.infer<typeof cloneTemplateSchema>;

function getTrimmedValue(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function getTemplateCloneName(template: ApiRecord | null | undefined) {
  const templateName = template ? getTemplateName(template).trim() : "";

  if (!templateName) {
    return "";
  }

  return templateName.endsWith("(Clone)")
    ? templateName
    : `${templateName} (Clone)`;
}

interface TemplateCloneFormProps {
  template: ApiRecord | null | undefined;
  onSubmit: (values: CloneTemplateFormValues) => void;
  isPending?: boolean;
}

function TemplateCloneForm({
  template,
  onSubmit,
  isPending,
}: TemplateCloneFormProps) {
  const formDefaultValues = useMemo(
    () => ({
      name: getTemplateCloneName(template),
      description: getTrimmedValue(template?.description),
    }),
    [template],
  );
  const form = useForm<CloneTemplateFormValues>({
    resolver: zodResolver(cloneTemplateSchema),
    defaultValues: formDefaultValues,
  });

  const templateName = template ? getTemplateName(template) : "this template";

  return (
    <form
      className="contents"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <DialogHeader>
        <DialogTitle>Clone template</DialogTitle>
        <DialogDescription>
          Create an editable copy of {templateName}. You can add custom
          fields and change the cloned template after it is created.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Template name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="Enter template name"
                autoComplete="off"
                disabled={isPending}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="Describe when this cloned template should be used"
                disabled={isPending}
                className="min-h-24 resize-y"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter className="dialog-form-footer">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2
              className="size-4 animate-spin"
              data-icon="inline-start"
            />
          ) : (
            <Copy className="size-4" data-icon="inline-start" />
          )}
          Clone Template
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TemplateCloneDialog({
  template,
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  template?: ApiRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CloneTemplateFormValues) => void;
  isPending?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <TemplateCloneForm
            template={template}
            onSubmit={onSubmit}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
