import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, X } from "lucide-react";
import { z } from "zod";
import { TemplateFormDetails } from "./components/TemplateFormDetails";

import type { ApiRecord } from "@/api/api.helpers";
import {
	templateQueryKeys,
	useCreateTemplate,
	useUpdateTemplate,
} from "@/api/templates/templates.hooks";
import { useExtractionFields } from "@/api/hooks/useExtractionFields";
import type {
	ExtractionTemplateCreateRequest,
	ExtractionTemplateUpdateRequest,
	TemplateMembershipInput,
	TemplateRecord,
} from "@/api/templates/templates.types";
import { TemplateFieldFormDialog } from "@/components/invoice-ui/templates/template-field-form-dialog";
import { SectionCard } from "@/components/invoice-ui/design-system";
import {
	getFieldCode,
	getFieldExamples,
	getFieldInstructions,
	getFieldLabel,
	getFieldLabels,
	getFieldLongDescription,
	getFieldShortDescription,
	getTemplateCode,
	getTemplateFieldCodes,
	getTemplateName,
	normalizeTemplateFieldsResponse,
	normalizeStringList,
	resolveTemplateFields,
} from "@/components/invoice-ui/templates/template-data";
import { Button } from "@/components/ui/button";
import {
	CategorizedFieldSelector,
	type CategorizedFieldSelectorCategory,
	type CategorizedFieldSelectorItem,
} from "@/components/ui/categorized-field-selector";
import {
	Field,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";

const tagListSchema = z.array(
	z.string().trim().min(1, "Tag cannot be empty."),
);

const templateSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Template name is required.")
		.max(255, "Template name must be 255 characters or fewer."),
	description: z.string().trim(),
	business_process_tags: tagListSchema,
	document_type_tags: tagListSchema,
	taxation_tags: tagListSchema,
	existing_field_ids: z
		.array(z.string())
		.min(1, "Select at least one field."),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

function asRecord(value: unknown): ApiRecord {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as ApiRecord)
		: {};
}

function getDefaultValues(template: TemplateRecord | null | undefined) {
	return {
		name: template ? getTemplateName(template) : "",
		description: getTemplateDescription(template),
		business_process_tags: getTemplateTags(template, "business_process_tags"),
		document_type_tags: getTemplateTags(template, "document_type_tags"),
		taxation_tags: getTemplateTags(template, "taxation_tags"),
		existing_field_ids: getTemplateFieldCodes(template),
	};
}

function getTemplateDescription(template: TemplateRecord | null | undefined) {
	const value = asRecord(template).description;

	return typeof value === "string" || typeof value === "number"
		? String(value)
		: "";
}

function normalizeTags(value: unknown) {
	const normalizedTags: string[] = [];
	const seenTags = new Set<string>();

	if (!Array.isArray(value)) {
		return normalizedTags;
	}

	value.forEach((item) => {
		const tag = String(item).trim();
		const tagKey = tag.toLowerCase();

		if (!tag || seenTags.has(tagKey)) {
			return;
		}

		normalizedTags.push(tag);
		seenTags.add(tagKey);
	});

	return normalizedTags;
}

function getTemplateTags(
	template: TemplateRecord | null | undefined,
	key:
		| "business_process_tags"
		| "document_type_tags"
		| "taxation_tags",
) {
	return normalizeTags(asRecord(template)[key]);
}

function buildExistingFields(fieldIds: string[]): TemplateMembershipInput[] {
	const result: TemplateMembershipInput[] = [];
	let sequence = 1;
	for (const id of fieldIds) {
		const trimmed = id.trim();
		if (trimmed) {
			result.push({
				field_id: trimmed,
				sort_sequence: sequence++,
			});
		}
	}
	return result;
}


function getStringValue(value: unknown) {
	return typeof value === "string" || typeof value === "number"
		? String(value)
		: "";
}

function getNullableString(value: unknown) {
	const stringValue = getStringValue(value);

	return stringValue || undefined;
}


function getFieldCategoryCode(field: unknown) {
	const record = asRecord(field);
	const category = asRecord(record.field_category);
	const value =
		record.field_category_code ||
		record.category_code ||
		record.category_id ||
		category.field_category_code ||
		category.code ||
		category.id;

	return getStringValue(value);
}




function buildFieldSelectorItem(
	field: unknown,
): CategorizedFieldSelectorItem | null {
	const record = asRecord(field);
	const id = getFieldCode(record);

	if (!id) {
		return null;
	}

	const allowedReferenceKey = getNullableString(
		record.allowed_reference_registry_key,
	);

	return {
		id,
		label: getFieldLabel(record),
		description:
			getFieldLongDescription(record) || getFieldShortDescription(record),
		categoryId: getFieldCategoryCode(record),
		metadata: {
			position: getNullableString(record.header_item),
			type: getNullableString(record.data_type_code || record.data_type),
			contentType: getNullableString(record.content_type),
		},
		details: {
			longDescription: getFieldLongDescription(record),
			labels: getFieldLabels(record),
			instructions: getFieldInstructions(record),
			examples: getFieldExamples(record),
			sourceMode: getNullableString(
				record.field_source_mode || record.source_mode,
			),
			editable:
				typeof record.is_editable === "boolean" ? record.is_editable : null,
			allowedValueMode: getNullableString(record.allowed_value_mode),
			allowedValues: normalizeStringList(record.allowed_static_list),
			referenceRegistryKey: allowedReferenceKey,
			defaultValue: getNullableString(record.default_value),
		},
	};
}


function getCategorySortOrder(category: CategorizedFieldSelectorCategory) {
	return typeof category.sortOrder === "number"
		? category.sortOrder
		: Number.MAX_SAFE_INTEGER;
}

function sortSelectorCategories(
	categories: CategorizedFieldSelectorCategory[],
) {
	return categories.toSorted((a, b) => {
		const sortDifference = getCategorySortOrder(a) - getCategorySortOrder(b);

		return sortDifference || a.label.localeCompare(b.label);
	});
}


function getCreatedFieldFromResponse(response: unknown, fallback: unknown) {
	const normalizedFields = normalizeTemplateFieldsResponse(response);

	if (normalizedFields.length) {
		return normalizedFields[0];
	}

	const record = asRecord(response);
	const data = asRecord(record.data);

	return (
		record.template_field ||
		record.field ||
		data.template_field ||
		data.field ||
		record.data ||
		fallback
	);
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
	return (
		<FieldLabel>
			{children}
			<span className="text-destructive">*</span>
		</FieldLabel>
	);
}

// Mock data removed

export function TemplateForm({
	mode,
	template,
	onCancel,
	onSuccess,
}: {
	mode: "create" | "edit";
	template?: TemplateRecord | null;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const isEditMode = mode === "edit";
	const formId = `template-form-${mode}`;
	const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
	const [createdFields, setCreatedFields] = useState<ApiRecord[]>([]);
	const createTemplate = useCreateTemplate();
	const updateTemplate = useUpdateTemplate();
	const { data: extractionFields = [], isLoading: isExtractionFieldsLoading } = useExtractionFields();
	const templateCode = template ? getTemplateCode(template) : "";
	const isPending = createTemplate.isPending || updateTemplate.isPending;
	const form = useForm<TemplateFormValues, unknown, TemplateFormValues>({
		resolver: zodResolver(templateSchema),
		defaultValues: getDefaultValues(template),
	});



	const fieldCategories = useMemo(() => {
		const categoriesMap = new Map<string, any>();
		
		extractionFields.forEach(field => {
			if (field.field_category) {
				categoriesMap.set(field.field_category.field_category_code, field.field_category);
			}
		});

		const extractedCategories = Array.from(categoriesMap.values()).map(cat => ({
			id: cat.field_category_code,
			label: cat.ui_label || cat.field_category_code,
			description: cat.description,
			sortOrder: cat.sort_sequence,
			activeFieldCount: extractionFields.filter(f => f.field_category?.field_category_code === cat.field_category_code).length,
		}));

		return sortSelectorCategories(extractedCategories as CategorizedFieldSelectorCategory[]);
	}, [extractionFields]);

	const knownFieldItems = useMemo(() => {
		const selectedTemplateFields = template
			? resolveTemplateFields<ApiRecord>(template)
			: [];
		const fieldByCode = new Map<string, ApiRecord>();

		selectedTemplateFields
			.concat(createdFields)
			.forEach((field) => {
				const code = getFieldCode(field);
				if (code) {
					fieldByCode.set(code, field);
				}
			});

		// Add all fetched extraction fields to the known items pool
		extractionFields.forEach((field) => {
			const code = field.field_id;
			if (code && !fieldByCode.has(code)) {
				fieldByCode.set(code, field as unknown as ApiRecord);
			}
		});

		return [...fieldByCode.values()]
			.map((item) => {
				if (item && typeof item === "object" && "categoryId" in item && "label" in item) {
					return item as CategorizedFieldSelectorItem;
				}
				return buildFieldSelectorItem(item);
			})
			.filter(
				(item): item is CategorizedFieldSelectorItem => Boolean(item),
			);
	}, [createdFields, template, extractionFields]);

	const loadCategoryItems = useCallback(
		async (category: CategorizedFieldSelectorCategory) => {
			const items = knownFieldItems.filter((i) => i.categoryId === category.id);
			return {
				items,
				total: items.length,
			};
		},
		[knownFieldItems],
	);

	const loadSearchItems = useCallback(async (search: string) => {
		const normalizedSearch = search.toLowerCase();
		const matched = knownFieldItems.filter((f) =>
			f.label.toLowerCase().includes(normalizedSearch) ||
			(f.description && f.description.toLowerCase().includes(normalizedSearch))
		);
		return {
			items: matched,
			total: matched.length,
		};
	}, [knownFieldItems]);

	const handleSelectAllFields = useCallback(async () => {
		const allCodes = knownFieldItems.map((f) => f.id);
		return allCodes;
	}, [knownFieldItems]);

	useEffect(() => {
		form.reset(getDefaultValues(template));
	}, [template, form.reset]);

	const handleFieldCreated = (response?: unknown, payload?: ApiRecord) => {
		const createdField = asRecord(
			getCreatedFieldFromResponse(response, payload),
		);
		const fieldCode = getFieldCode(createdField);

		if (!fieldCode) {
			return;
		}

		setCreatedFields((currentFields) => {
			if (currentFields.some((field) => getFieldCode(field) === fieldCode)) {
				return currentFields;
			}

			return [...currentFields, createdField];
		});

		const currentCodes = form.getValues("existing_field_ids") || [];

		if (!currentCodes.includes(fieldCode)) {
			form.setValue("existing_field_ids", [...currentCodes, fieldCode], {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
		}
	};

	const submit = (values: TemplateFormValues) => {
		const payload:
			| ExtractionTemplateCreateRequest
			| ExtractionTemplateUpdateRequest = {
			name: values.name.trim(),
			description: values.description.trim() || null,
			business_process_tags: normalizeTags(values.business_process_tags),
			document_type_tags: normalizeTags(values.document_type_tags),
			taxation_tags: normalizeTags(values.taxation_tags),
			existing_fields: buildExistingFields(values.existing_field_ids),
		};

		if (isEditMode && templateCode) {
			updateTemplate.mutate(
				{ templateCode, data: payload },
				{ onSuccess },
			);
			return;
		}

		createTemplate.mutate(payload, {
			onSuccess: () => {
				form.reset(getDefaultValues(null));
				setCreatedFields([]);
				onSuccess();
			},
		});
	};

	return (
		<TemplateFormContent
			form={form}
			formId={formId}
			submit={submit}
			isPending={isPending}
			isEditMode={isEditMode}
			fieldCategories={fieldCategories}
			knownFieldItems={knownFieldItems}
			handleSelectAllFields={handleSelectAllFields}
			loadSearchItems={loadSearchItems}
			loadCategoryItems={loadCategoryItems}
			templateQueryKeys={templateQueryKeys}
			isExtractionFieldsLoading={isExtractionFieldsLoading}
			setIsFieldDialogOpen={setIsFieldDialogOpen}
			isFieldDialogOpen={isFieldDialogOpen}
			onCancel={onCancel}
			onSuccess={onSuccess}
			handleFieldCreated={handleFieldCreated}
		/>
	);
}

function TemplateFormContent({
	form,
	formId,
	submit,
	isPending,
	isEditMode,
	fieldCategories,
	knownFieldItems,
	handleSelectAllFields,
	loadSearchItems,
	loadCategoryItems,
	templateQueryKeys,
	isExtractionFieldsLoading,
	setIsFieldDialogOpen,
	isFieldDialogOpen,
	onCancel,
	handleFieldCreated,
}: any) {
	return (
		<>
			<SectionCard className="overflow-visible" contentClassName="p-0">
				<div className="p-4 sm:p-5">
					<form id={formId} onSubmit={form.handleSubmit(submit)} noValidate>
						<FieldGroup className="gap-5">
							<TemplateFormDetails control={form.control} />

							<Controller
								name="existing_field_ids"
								control={form.control}
								render={({ field, fieldState }) => {
									const selectedIds = Array.isArray(field.value)
										? field.value
										: [];

									return (
										<Field data-invalid={fieldState.invalid}>
											<RequiredLabel>Select Extraction Fields</RequiredLabel>
											<CategorizedFieldSelector
												categories={fieldCategories}
												knownItems={knownFieldItems}
												selectedIds={selectedIds}
												onSelectedChange={field.onChange}
												onSelectAll={handleSelectAllFields}
												loadSearchItems={loadSearchItems}
												getSearchItemsQueryKey={(search: string) =>
													templateQueryKeys.fields({
														field_label: search,
														offset: 0,
														limit: 200,
													})
												}
												disabled={isPending}
												loading={isExtractionFieldsLoading}
												error={fieldState.error?.message}
												loadCategoryItems={loadCategoryItems}
												getCategoryItemsQueryKey={(category: any) =>
													templateQueryKeys.fieldCategoryFields(category.id)
												}
												actions={
													<Button
														type="button"
														variant="default"
														size="sm"
														className="h-7 px-2 text-xs"
														disabled={isPending}
														onClick={() => setIsFieldDialogOpen(true)}
													>
														<Plus className="size-3.5 shrink-0" aria-hidden="true" />
														<span className="text-xs font-medium">Add Field</span>
													</Button>
												}
											/>
										</Field>
									);
								}}
							/>
						</FieldGroup>
					</form>
				</div>

				<div className="dialog-form-footer">
					<Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
						<X className="size-4" data-icon="inline-start" />
						Cancel
					</Button>
					<Button type="submit" form={formId} disabled={isPending}>
						{isPending ? (
							<Loader2 className="size-4 animate-spin" data-icon="inline-start" />
						) : isEditMode ? (
							<Save className="size-4" data-icon="inline-start" />
						) : (
							<Plus className="size-4" data-icon="inline-start" />
						)}
						{isEditMode ? "Save Changes" : "Create Template"}
					</Button>
				</div>
			</SectionCard>

			<TemplateFieldFormDialog mode="create" open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen} onSuccess={handleFieldCreated} />
		</>
	);
}
