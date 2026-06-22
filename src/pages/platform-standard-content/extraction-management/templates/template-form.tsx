import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, X } from "lucide-react";
import { z } from "zod";
import { TemplateFormDetails } from "./components/TemplateFormDetails";

import type { ApiRecord } from "@/api/api.helpers";
import {
	templateQueryKeys,
	useCreateTemplate,
	useFieldCategoriesList,
	useUpdateTemplate,
} from "@/api/templates/templates.hooks";
import { templatesService } from "@/api/templates/templates.services";
import type {
	ExtractionTemplateCreateRequest,
	ExtractionTemplateUpdateRequest,
	FieldCategoryResponse,
	TemplateMembershipInput,
	TemplateRecord,
} from "@/api/templates/templates.types";
import { TemplateFieldFormDialog } from "@/components/invoice-ui/templates/template-field-form-dialog";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

function normalizeFieldCategoriesResponse(response: unknown) {
	if (Array.isArray(response)) {
		return response.map(asRecord);
	}

	const record = asRecord(response);
	const data = asRecord(record.data);

	for (const key of ["field_categories", "categories", "items", "data"]) {
		const value = record[key];
		const dataValue = data[key];

		if (Array.isArray(value)) {
			return value.map(asRecord);
		}

		if (Array.isArray(dataValue)) {
			return dataValue.map(asRecord);
		}
	}

	return [];
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

function getNumberValue(value: unknown) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string" && value.trim()) {
		const numericValue = Number(value);

		return Number.isFinite(numericValue) ? numericValue : null;
	}

	return null;
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

function getFieldCategoryCodeFromCategory(category: unknown) {
	const record = asRecord(category);
	const value =
		record.field_category_code ||
		record.category_code ||
		record.code ||
		record.id;

	return getStringValue(value);
}

function getFieldCategoryLabel(category: unknown) {
	const record = asRecord(category);
	const value =
		record.ui_label ||
		record.label ||
		record.name ||
		record.display_name ||
		getFieldCategoryCodeFromCategory(record);

	return getStringValue(value) || "Untitled category";
}

function getFieldCategoryDescription(category: unknown) {
	const record = asRecord(category);

	return getNullableString(record.description);
}

function getFieldCategoryIsActive(category: unknown) {
	return asRecord(category).is_active !== false;
}

function buildSelectorCategory(
	category: FieldCategoryResponse | ApiRecord,
): CategorizedFieldSelectorCategory | null {
	const id = getFieldCategoryCodeFromCategory(category);

	if (!id || !getFieldCategoryIsActive(category)) {
		return null;
	}

	return {
		id,
		label: getFieldCategoryLabel(category),
		description: getFieldCategoryDescription(category),
		sortOrder: getNumberValue(asRecord(category).sort_sequence),
		activeFieldCount: getNumberValue(asRecord(category).active_field_count),
		inactiveFieldCount: getNumberValue(asRecord(category).inactive_field_count),
	};
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

function getFieldCategoryFieldsTotal(response: unknown) {
	const record = asRecord(response);
	const data = asRecord(record.data);
	const value = record.total ?? data.total ?? record.count ?? data.count;
	const total = getNumberValue(value);

	return total ?? undefined;
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

function mergeFieldsByCode(fields: ApiRecord[]) {
	const fieldByCode = new Map<string, ApiRecord>();

	fields.forEach((field) => {
		const code = getFieldCode(field);

		if (code) {
			fieldByCode.set(code, field);
		}
	});

	return [...fieldByCode.values()];
}

function getUniqueFieldCodes(fields: unknown[]) {
	const fieldCodes: string[] = [];
	const seenFieldCodes = new Set<string>();

	fields.forEach((field) => {
		const fieldCode = getFieldCode(field);

		if (!fieldCode || seenFieldCodes.has(fieldCode)) {
			return;
		}

		fieldCodes.push(fieldCode);
		seenFieldCodes.add(fieldCode);
	});

	return fieldCodes;
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

const MOCK_CATEGORIES: CategorizedFieldSelectorCategory[] = [
	{ id: "mock_basics", label: "Invoice Basics", description: "Basic invoice fields like date, number, PO reference", activeFieldCount: 4 },
	{ id: "mock_vendor", label: "Vendor Details", description: "Vendor names, addresses, contact details, tax identifiers", activeFieldCount: 3 },
	{ id: "mock_buyer", label: "Buyer Details", description: "Buyer/Customer names, billing addresses, tax identifiers", activeFieldCount: 3 },
	{ id: "mock_totals", label: "Totals & Taxation", description: "Subtotal, tax rate, tax amount, net/gross totals, currency", activeFieldCount: 4 },
	{ id: "mock_line_items", label: "Line Items", description: "Table details, item descriptions, quantities, unit prices", activeFieldCount: 4 }
];

const MOCK_FIELDS: Record<string, CategorizedFieldSelectorItem[]> = {
	mock_basics: [
		{ id: "invoice_number", label: "Invoice Number", description: "The unique identifier of the invoice document.", categoryId: "mock_basics", metadata: { position: "Header", type: "string" } },
		{ id: "invoice_date", label: "Invoice Date", description: "The issuance date of the invoice.", categoryId: "mock_basics", metadata: { position: "Header", type: "date" } },
		{ id: "due_date", label: "Due Date", description: "The payment due date.", categoryId: "mock_basics", metadata: { position: "Header", type: "date" } },
		{ id: "purchase_order", label: "PO Number", description: "Associated purchase order reference number.", categoryId: "mock_basics", metadata: { position: "Header", type: "string" } }
	],
	mock_vendor: [
		{ id: "vendor_name", label: "Vendor Name", description: "The legal name of the vendor/supplier.", categoryId: "mock_vendor", metadata: { position: "Header", type: "string" } },
		{ id: "vendor_address", label: "Vendor Address", description: "The physical or billing address of the vendor.", categoryId: "mock_vendor", metadata: { position: "Header", type: "string" } },
		{ id: "vendor_tax_id", label: "Vendor Tax ID / VAT", description: "Tax registration number of the supplier.", categoryId: "mock_vendor", metadata: { position: "Header", type: "string" } }
	],
	mock_buyer: [
		{ id: "buyer_name", label: "Buyer Name", description: "The legal name of the buyer/customer.", categoryId: "mock_buyer", metadata: { position: "Header", type: "string" } },
		{ id: "buyer_address", label: "Buyer Address", description: "The billing address of the customer.", categoryId: "mock_buyer", metadata: { position: "Header", type: "string" } },
		{ id: "buyer_tax_id", label: "Buyer Tax ID", description: "Tax registration number of the customer.", categoryId: "mock_buyer", metadata: { position: "Header", type: "string" } }
	],
	mock_totals: [
		{ id: "subtotal", label: "Subtotal", description: "Total amount before taxes and discounts.", categoryId: "mock_totals", metadata: { position: "Header", type: "number" } },
		{ id: "tax_amount", label: "Tax Amount", description: "Total calculated tax/VAT amount.", categoryId: "mock_totals", metadata: { position: "Header", type: "number" } },
		{ id: "total_amount", label: "Total Amount", description: "The final total amount to be paid (gross).", categoryId: "mock_totals", metadata: { position: "Header", type: "number" } },
		{ id: "currency", label: "Currency", description: "ISO code of the invoice currency.", categoryId: "mock_totals", metadata: { position: "Header", type: "string" } }
	],
	mock_line_items: [
		{ id: "item_description", label: "Item Description", description: "Description of the line item product or service.", categoryId: "mock_line_items", metadata: { position: "Item", type: "string" } },
		{ id: "item_quantity", label: "Item Quantity", description: "Quantity of the items.", categoryId: "mock_line_items", metadata: { position: "Item", type: "number" } },
		{ id: "item_unit_price", label: "Item Unit Price", description: "The price per unit.", categoryId: "mock_line_items", metadata: { position: "Item", type: "number" } },
		{ id: "item_total", label: "Item Total", description: "Line total amount (quantity * unit price).", categoryId: "mock_line_items", metadata: { position: "Item", type: "number" } }
	]
};

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
	const [bulkLoadedFields, setBulkLoadedFields] = useState<ApiRecord[]>([]);
	const [searchLoadedFields, setSearchLoadedFields] = useState<ApiRecord[]>([]);
	const queryClient = useQueryClient();
	const createTemplate = useCreateTemplate();
	const updateTemplate = useUpdateTemplate();
	const fieldCategoriesQuery = useFieldCategoriesList();
	const templateCode = template ? getTemplateCode(template) : "";
	const isPending = createTemplate.isPending || updateTemplate.isPending;
	const form = useForm<TemplateFormValues, unknown, TemplateFormValues>({
		resolver: zodResolver(templateSchema),
		defaultValues: getDefaultValues(template),
	});



	const fieldCategories = useMemo(
		() => {
			const apiCategories = normalizeFieldCategoriesResponse(fieldCategoriesQuery.data)
				.map(buildSelectorCategory)
				.filter(
					(category): category is CategorizedFieldSelectorCategory =>
						Boolean(category),
				);

			if (apiCategories.length === 0 && !fieldCategoriesQuery.isLoading) {
				return MOCK_CATEGORIES;
			}

			return apiCategories;
		},
		[fieldCategoriesQuery.data, fieldCategoriesQuery.isLoading],
	);

	const knownFieldItems = useMemo(() => {
		const selectedTemplateFields = template
			? resolveTemplateFields<ApiRecord>(template)
			: [];
		const fieldByCode = new Map<string, ApiRecord>();

		selectedTemplateFields
			.concat(createdFields, bulkLoadedFields, searchLoadedFields)
			.forEach((field) => {
				const code = getFieldCode(field);

				if (code) {
					fieldByCode.set(code, field);
				}
			});

		const usingMocks = fieldCategories.some((c) => c.id.startsWith("mock_"));
		if (usingMocks) {
			Object.values(MOCK_FIELDS).flat().forEach((mockField) => {
				fieldByCode.set(mockField.id, mockField);
			});
		}

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
	}, [bulkLoadedFields, createdFields, searchLoadedFields, template, fieldCategories]);

	const loadCategoryItems = useCallback(
		async (category: CategorizedFieldSelectorCategory) => {
			if (category.id.startsWith("mock_")) {
				return {
					items: MOCK_FIELDS[category.id] || [],
					total: (MOCK_FIELDS[category.id] || []).length,
				};
			}

			const response = await templatesService.listFieldCategoryFields(
				category.id,
			);

			return {
				items: normalizeTemplateFieldsResponse(response)
					.map(buildFieldSelectorItem)
					.filter(
						(item): item is CategorizedFieldSelectorItem => Boolean(item),
					),
				total: getFieldCategoryFieldsTotal(response),
			};
		},
		[],
	);

	const getCategoryFieldsFromCacheOrFetch = useCallback(
		async (category: CategorizedFieldSelectorCategory) => {
			if (category.id.startsWith("mock_")) {
				return MOCK_FIELDS[category.id] || [];
			}

			const queryKey = templateQueryKeys.fieldCategoryFields(category.id);
			const cachedResponse = queryClient.getQueryData<unknown>(queryKey);
			const response =
				cachedResponse !== undefined
					? cachedResponse
					: await queryClient.fetchQuery({
							queryKey,
							queryFn: () =>
								templatesService.listFieldCategoryFields(category.id),
						});

			return normalizeTemplateFieldsResponse(response);
		}, [queryClient],
	);

	const loadSearchItems = useCallback(async (search: string) => {
		const usingMocks = fieldCategories.some((c) => c.id.startsWith("mock_"));
		if (usingMocks) {
			const normalizedSearch = search.toLowerCase();
			const allMockFields = Object.values(MOCK_FIELDS).flat();
			const matched = allMockFields.filter((f) =>
				f.label.toLowerCase().includes(normalizedSearch) ||
				(f.description && f.description.toLowerCase().includes(normalizedSearch))
			);
			return {
				items: matched,
				total: matched.length,
			};
		}

		const response = await templatesService.listExtractionFields({
			field_label: search,
			offset: 0,
			limit: 200,
		});
		const fields = normalizeTemplateFieldsResponse(response);

		setSearchLoadedFields((currentFields) =>
			mergeFieldsByCode([...currentFields, ...fields.map(asRecord)]),
		);

		const items: CategorizedFieldSelectorItem[] = [];
		for (const f of fields) {
			const item = buildFieldSelectorItem(f);
			if (item) {
				items.push(item);
			}
		}

		return {
			items,
			total: getFieldCategoryFieldsTotal(response),
		};
	}, [fieldCategories]);

	const handleSelectAllFields = useCallback(async () => {
		const categoriesToFetch: Promise<unknown[]>[] = [];
		for (const category of sortSelectorCategories(fieldCategories)) {
			if (category.activeFieldCount !== 0) {
				categoriesToFetch.push(getCategoryFieldsFromCacheOrFetch(category));
			}
		}
		const categoryFields = await Promise.all(categoriesToFetch);
		const fields = categoryFields.flat();
		const allFields = mergeFieldsByCode([
			...fields.map(asRecord),
			...createdFields,
		]);

		setBulkLoadedFields((currentFields) =>
			mergeFieldsByCode([...currentFields, ...allFields]),
		);

		return getUniqueFieldCodes(allFields);
	}, [createdFields, fieldCategories, getCategoryFieldsFromCacheOrFetch]);

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
				setSearchLoadedFields([]);
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
			fieldCategoriesQuery={fieldCategoriesQuery}
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
	fieldCategoriesQuery,
	setIsFieldDialogOpen,
	isFieldDialogOpen,
	onCancel,
	handleFieldCreated,
}: any) {
	return (
		<>
			<Card className="overflow-visible p-0">
				<CardContent className="p-4 sm:p-5">
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
												loading={fieldCategoriesQuery.isLoading}
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
				</CardContent>

				<CardFooter className="flex justify-end gap-2 border-t bg-muted/25 p-4">
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
				</CardFooter>
			</Card>

			<TemplateFieldFormDialog mode="create" open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen} onSuccess={handleFieldCreated} />
		</>
	);
}

