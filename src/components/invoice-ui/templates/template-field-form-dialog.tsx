import type { FieldFormValues } from "@/types";
import { useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import type { ApiRecord } from "@/api/api.helpers";
import {
  useCreateTemplateField,
  useFieldCategoriesList,
  useFieldCatalogs,
  useUpdateTemplate,
  useUpdateTemplateField,
  useUpdateTemplateFieldMembership,
} from "@/api/templates/templates.hooks";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  getFieldCode,
  getTemplateCode,
  getTemplateFieldCodes,
} from "./template-data";
import { TemplateFieldDialogDetailsStep } from "./TemplateFieldDialogDetailsStep";
import { TemplateFieldDialogMeaningStep } from "./TemplateFieldDialogMeaningStep";
import { TemplateFieldDialogRulesStep } from "./TemplateFieldDialogRulesStep";
import { TemplateFieldDialogSidebar } from "./TemplateFieldDialogSidebar";
import {
  TemplateFieldDialogNavigation,
  TemplateFieldDialogSubmit,
  TemplateFieldDialogFooterWrapper,
} from "./TemplateFieldDialogFooter";

type DataTypeOption = {
  value: string;
  label: string;
  description?: string;
  sampleValue?: string;
  sortSequence?: number;
};

type FieldCategoryOption = {
  value: string;
  label: string;
  description?: string;
  activeFieldCount?: number;
  inactiveFieldCount?: number;
  sortSequence?: number;
};

const DATA_TYPE_OPTIONS: DataTypeOption[] = [
  { value: "STRING", label: "String" },
  { value: "INTEGER", label: "Integer" },
  { value: "FLOAT", label: "Float" },
  { value: "BOOLEAN", label: "Boolean" },
  { value: "DATE", label: "Date" },
];

const VALUE_TYPE_OPTIONS = [
  { value: "header", label: "Header" },
  { value: "item", label: "Line Items" },
] as const;

const DATA_TYPE_VALUES = DATA_TYPE_OPTIONS.map((option) => option.value);
const VALUE_TYPE_VALUES = VALUE_TYPE_OPTIONS.map((option) => option.value);
const FIELD_SOURCE_MODE = "EXTRACTED";
const ALLOWED_VALUE_MODE = "NONE";

const normalizeStringArray = (value: unknown) => {
  if (typeof value === "string") {
    return value.split(/\r?\n/).flatMap((item) => {
      const trimmed = item.trim();
      return trimmed ? [trimmed] : [];
    });
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const trimmed = String(item).trim();
    return trimmed ? [trimmed] : [];
  });
};

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

function pickString(record: unknown, keys: string[], fallback = "") {
  const data = asRecord(record);

  for (const key of keys) {
    const value = data[key];

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function pickNumber(record: unknown, keys: string[]) {
  const data = asRecord(record);

  for (const key of keys) {
    const value = data[key];
    const numericValue =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value)
          : Number.NaN;

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return undefined;
}

function arrayToTextareaValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  return Array.isArray(value) ? value.join("\n") : "";
}

function normalizeCatalogDataTypeOption(value: unknown): DataTypeOption | null {
  const record = asRecord(value);
  const code = pickString(record, ["data_type_code"]).trim();

  if (!code) {
    return null;
  }

  return {
    value: code,
    label: pickString(record, ["display_label"], code).trim(),
    description: pickString(record, ["description"]).trim() || undefined,
    sampleValue: pickString(record, ["sample_value"]).trim() || undefined,
    sortSequence: pickNumber(record, ["sort_sequence"]),
  };
}

function getCatalogDataTypeOptions(catalogs: unknown) {
  const record = asRecord(catalogs);
  const dataTypes = Array.isArray(record.data_types) ? record.data_types : [];

  return dataTypes
    .map(normalizeCatalogDataTypeOption)
    .filter((option): option is DataTypeOption => !!option)
    .sort((firstOption, secondOption) => {
      const firstSort = firstOption.sortSequence ?? Number.MAX_SAFE_INTEGER;
      const secondSort = secondOption.sortSequence ?? Number.MAX_SAFE_INTEGER;

      return (
        firstSort - secondSort ||
        firstOption.label.localeCompare(secondOption.label)
      );
    });
}


function normalizeFieldCategoryOption(
  value: unknown,
): FieldCategoryOption | null {
  const record = asRecord(value);
  const code = pickString(record, ["field_category_code"]).trim();

  if (!code) {
    return null;
  }

  return {
    value: code,
    label: pickString(record, ["ui_label"], code).trim(),
    description: pickString(record, ["description"]).trim() || undefined,
    activeFieldCount: pickNumber(record, ["active_field_count"]),
    inactiveFieldCount: pickNumber(record, ["inactive_field_count"]),
    sortSequence: pickNumber(record, ["sort_sequence"]),
  };
}




function getFieldCategoryOptions(response: unknown) {
  const record = asRecord(response);
  const categories = Array.isArray(record.field_categories)
    ? record.field_categories
    : [];

  return categories
    .map(normalizeFieldCategoryOption)
    .filter((option): option is FieldCategoryOption => !!option)
    .sort((firstOption, secondOption) => {
      const firstSort = firstOption.sortSequence ?? Number.MAX_SAFE_INTEGER;
      const secondSort = secondOption.sortSequence ?? Number.MAX_SAFE_INTEGER;

      return (
        firstSort - secondSort ||
        firstOption.label.localeCompare(secondOption.label)
      );
    });
}

function normalizeDataType(value: unknown) {
  const rawValue = String(value || "").trim();
  const normalizedValue = rawValue.toUpperCase();
  const normalizedAliasValue = rawValue.toLowerCase();

  if (DATA_TYPE_VALUES.includes(normalizedValue)) {
    return normalizedValue;
  }

  if (
    normalizedAliasValue === "number" ||
    normalizedAliasValue === "amount" ||
    normalizedAliasValue === "percentage"
  ) {
    return "FLOAT";
  }

  return normalizedValue || "STRING";
}

function normalizeValueType(value: unknown) {
  const normalizedValue = String(value || "").toLowerCase();

  if (
    VALUE_TYPE_VALUES.includes(
      normalizedValue as (typeof VALUE_TYPE_VALUES)[number],
    )
  ) {
    return normalizedValue;
  }

  return "header";
}

const fieldSchema = z.object({
  field_category_code: z
    .string()
    .trim()
    .min(1, "Field category is required."),
  field_label: z
    .string()
    .trim()
    .min(1, "Field name is required.")
    .max(255, "Field name must be 255 characters or fewer."),
  short_desc: z
    .string()
    .trim()
    .min(3, "Short description must be at least 3 characters.")
    .max(100, "Short description must be 100 characters or fewer."),
  field_long_description: z
    .string()
    .trim()
    .min(2, "Long description must be at least 2 characters.")
    .max(500, "Long description must be 500 characters or fewer."),
  extraction_instructions: z.string().refine(
    (value) => normalizeStringArray(value).length > 0,
    "Add at least one extraction instruction.",
  ),
  labels: z
    .array(z.string().trim().min(1, "Alias cannot be empty."))
    .min(1, "Add at least one alias."),
  examples: z.string().refine(
    (value) => normalizeStringArray(value).length > 0,
    "Add at least one example.",
  ),
  data_type_code: z.string().trim().min(1, "Data type is required."),
  header_item: z
    .string()
    .trim()
    .min(1, "Invoice section is required.")
    .refine(
      (value) => VALUE_TYPE_VALUES.includes(value as (typeof VALUE_TYPE_VALUES)[number]),
      "Select a valid invoice section.",
    ),
  allowed_static_list: z.array(z.string().trim().min(1)).default([]),
});



function getDefaultValues(
  field: unknown,
  defaultFieldCategoryCode: string | null | undefined = null,
): FieldFormValues {
  const record = asRecord(field);

  return {
    field_category_code:
      pickString(record, ["field_category_code"]) ||
      defaultFieldCategoryCode ||
      "",
    field_label: pickString(record, ["field_label"]),
    short_desc: pickString(record, ["short_desc"]),
    field_long_description: pickString(record, ["field_long_description"]),
    extraction_instructions: arrayToTextareaValue(
      record.extraction_instructions,
    ),
    labels: Array.isArray(record.labels) ? record.labels.map(String) : [],
    examples: arrayToTextareaValue(record.examples),
    data_type_code: normalizeDataType(record.data_type_code),
    header_item: normalizeValueType(record.header_item),
    allowed_static_list: normalizeStringArray(record.allowed_static_list),
  };
}

function buildPayload(values: FieldFormValues, fieldId?: string): ApiRecord {
  const fieldLabel = values.field_label.trim();

  return {
    ...(fieldId ? { field_id: fieldId } : {}),
    field_label: fieldLabel,
    short_desc: values.short_desc.trim(),
    field_long_description: values.field_long_description.trim(),
    data_type_code: values.data_type_code.trim(),
    labels: normalizeStringArray(values.labels),
    examples: normalizeStringArray(values.examples),
    extraction_instructions: normalizeStringArray(values.extraction_instructions),
    header_item: values.header_item.trim().toLowerCase(),
    field_source_mode: FIELD_SOURCE_MODE,
    allowed_value_mode: ALLOWED_VALUE_MODE,
    allowed_static_list: normalizeStringArray(values.allowed_static_list),
    allowed_reference_registry_key: null,
    default_value: null,
    field_category_code: values.field_category_code.trim(),
  };
}

const FIELD_FORM_STEPS = [
  {
    title: "Field details",
    description: "Category, name, type, and document section.",
    fields: [
      "field_category_code",
      "field_label",
      "data_type_code",
      "header_item",
    ],
  },
  {
    title: "Field meaning",
    description: "Short and long context for the extractor.",
    fields: ["short_desc", "field_long_description"],
  },
  {
    title: "Extraction rules",
    description: "Aliases, examples, allowed values, and guidance.",
    fields: [
      "labels",
      "extraction_instructions",
      "examples",
      "allowed_static_list",
    ],
  },
] as const;

const FIELD_FORM_STEP_FIELDS = FIELD_FORM_STEPS.flatMap((step) => step.fields);


type TemplateFieldFormSurfaceProps = {
  mode?: "create" | "edit";
  template?: ApiRecord | null;
  field?: ApiRecord | null;
  defaultFieldCategoryCode?: string | null;
  enabled?: boolean;
  onCancel?: () => void;
  onSuccess?: (response?: unknown, payload?: ApiRecord) => void;
};

export function TemplateFieldFormSurface({
  mode = "create",
  template = null,
  field = null,
  defaultFieldCategoryCode = null,
  enabled = true,
  onCancel,
  onSuccess,
}: TemplateFieldFormSurfaceProps) {
  const isEditMode = mode === "edit";
  const formId = `template-field-form-${mode}`;
  const createTemplateFieldMutation = useCreateTemplateField();
  const updateTemplateMutation = useUpdateTemplate();
  const updateTemplateFieldMutation = useUpdateTemplateField();
  const updateTemplateFieldMembershipMutation = useUpdateTemplateFieldMembership();
  const fieldCatalogsQuery = useFieldCatalogs({ enabled });
  const fieldCategoriesQuery = useFieldCategoriesList({}, { enabled });
  const isPending =
    createTemplateFieldMutation.isPending ||
    updateTemplateMutation.isPending ||
    updateTemplateFieldMutation.isPending ||
    updateTemplateFieldMembershipMutation.isPending;
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === FIELD_FORM_STEPS.length - 1;
  const dataTypeOptions = useMemo(() => {
    const catalogOptions = getCatalogDataTypeOptions(fieldCatalogsQuery.data);

    return catalogOptions.length ? catalogOptions : DATA_TYPE_OPTIONS;
  }, [fieldCatalogsQuery.data]);
  const fieldCategoryOptions = useMemo(
    () => getFieldCategoryOptions(fieldCategoriesQuery.data),
    [fieldCategoriesQuery.data],
  );
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: getDefaultValues(field, defaultFieldCategoryCode),
  });
  const watchedValues = useWatch({ control: form.control });
  const isFormReadyToSubmit = useMemo(
    () => fieldSchema.safeParse(watchedValues).success,
    [watchedValues],
  );

  const prevEnabledRef = useRef(enabled);
  if (enabled !== prevEnabledRef.current) {
    prevEnabledRef.current = enabled;
    if (enabled) {
      form.reset(getDefaultValues(field, defaultFieldCategoryCode));
    }
  }

  const showStep = (stepIndex: number) => {
    form.clearErrors();
    setActiveStepIndex(stepIndex);
  };

  const validateStep = async (stepIndex: number) => {
    const step = FIELD_FORM_STEPS[stepIndex];
    const isValid = await form.trigger(step.fields);

    if (!isValid) {
      const firstField = step.fields.find(
        (fieldName) => form.getFieldState(fieldName).invalid,
      );

      if (firstField) {
        form.setFocus(firstField);
      }
    }

    return isValid;
  };

  const handlePreviousStep = () => {
    setActiveStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  const handleNextStep = async () => {
    if (!(await validateStep(activeStepIndex))) {
      return;
    }

    showStep(Math.min(activeStepIndex + 1, FIELD_FORM_STEPS.length - 1));
  };

  const handleStepChange = async (nextStepIndex: number) => {
    if (isPending) {
      return;
    }

    if (nextStepIndex <= activeStepIndex) {
      showStep(nextStepIndex);
      return;
    }

    if (!(await validateStep(activeStepIndex))) {
      return;
    }

    showStep(Math.min(nextStepIndex, activeStepIndex + 1));
  };

  const handleInvalidSubmit = (
    errors: Partial<Record<keyof FieldFormValues, unknown>>,
  ) => {
    const firstErrorField = FIELD_FORM_STEP_FIELDS.find(
      (fieldName) => errors[fieldName],
    );
    const firstErrorStepIndex = FIELD_FORM_STEPS.findIndex((step) =>
      step.fields.includes(firstErrorField as never),
    );

    if (firstErrorStepIndex >= 0) {
      showStep(firstErrorStepIndex);
    }
  };

  const onSubmit = (values: FieldFormValues) => {
    const fieldCode = getFieldCode(field);

    if (isEditMode) {
      const payload = buildPayload(values);
      const templateCode = getTemplateCode(template);

      if (templateCode) {
        updateTemplateFieldMembershipMutation.mutate(
          { templateCode, fieldCode, data: payload },
          {
            onSuccess: (response) => {
              onSuccess?.(response, payload);
              onCancel?.();
            },
          },
        );
        return;
      }

      updateTemplateFieldMutation.mutate(
        { fieldCode, data: payload },
        {
          onSuccess: (response) => {
            onSuccess?.(response, payload);
            onCancel?.();
          },
        },
      );
      return;
    }

    const payload = buildPayload(values, uuidv4());
    const templateCode = getTemplateCode(template);

    if (templateCode) {
      updateTemplateMutation.mutate(
        {
          templateCode,
          data: {
            existing_fields: getTemplateFieldCodes(template).map(
              (fieldId, index) => ({
                field_id: fieldId,
                sort_sequence: index + 1,
              }),
            ),
            new_fields: [payload],
          },
        },
        {
          onSuccess: (response) => {
            onSuccess?.(response, payload);
            onCancel?.();
            form.reset(getDefaultValues(null, defaultFieldCategoryCode));
          },
        },
      );
      return;
    }

    createTemplateFieldMutation.mutate(payload, {
      onSuccess: (response) => {
        onSuccess?.(response, payload);
        onCancel?.();
        form.reset(getDefaultValues(null, defaultFieldCategoryCode));
      },
    });
  };

  return (
    <>
        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            void handleNextStep();
          }}
          className="h-full min-h-[32rem] overflow-hidden"
          noValidate
        >
          <div className="grid h-full min-h-0 md:grid-cols-[16rem_minmax(0,1fr)]">
            <TemplateFieldDialogSidebar
              activeStepIndex={activeStepIndex}
              handleStepChange={handleStepChange}
              steps={FIELD_FORM_STEPS}
            />

            <ScrollArea className="h-full min-h-0 min-w-0">
              <div className="px-5 py-5 pb-6 md:px-6 md:py-6 md:pb-8">
                {activeStepIndex === 0 ? (
                  <TemplateFieldDialogDetailsStep
                    form={form}
                    dataTypeOptions={dataTypeOptions}
                    fieldCategoryOptions={fieldCategoryOptions}
                  />
                ) : null}

                {activeStepIndex === 1 ? (
                  <TemplateFieldDialogMeaningStep form={form} />
                ) : null}

                {activeStepIndex === 2 ? (
                  <TemplateFieldDialogRulesStep form={form} />
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </form>

        <TemplateFieldDialogFooterWrapper>
          <TemplateFieldDialogNavigation
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isPending={isPending}
            onCancel={onCancel}
            handlePreviousStep={handlePreviousStep}
            handleNextStep={handleNextStep}
          />
          <TemplateFieldDialogSubmit
            isPending={isPending}
            isEditMode={isEditMode}
            isFormReadyToSubmit={isFormReadyToSubmit}
            onSubmitClick={() => {
              void form.handleSubmit(onSubmit, handleInvalidSubmit)();
            }}
          />
        </TemplateFieldDialogFooterWrapper>
    </>
  );
}
