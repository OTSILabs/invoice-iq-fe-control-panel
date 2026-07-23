import type { ApiRecord } from "@/api/templates/api.helpers";
import { TEMPLATE_CONTENT_TYPES } from "@/api/templates/templates.types";

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

export function normalizeHeaderItemValue(value: unknown) {
  if (value === "header") {
    return "Header";
  }

  if (value === "item") {
    return "Item";
  }

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : value;
}

function normalizeTemplateField(field: unknown) {
  const record = asRecord(field);

  if (!Object.keys(record).length) {
    return record;
  }

  return {
    ...record,
    header_item: normalizeHeaderItemValue(record.header_item),
  };
}


export function normalizeTemplateDetail(response: unknown) {
  const record = asRecord(response);

  for (const key of ["template", "data", "item", "result"]) {
    const value = record[key];
    const nested = asRecord(value);

    for (const nestedKey of ["template", "data", "item", "result"]) {
      if (
        nested[nestedKey] &&
        typeof nested[nestedKey] === "object" &&
        !Array.isArray(nested[nestedKey])
      ) {
        return asRecord(nested[nestedKey]);
      }
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return nested;
    }
  }

  return record;
}

export function normalizeTemplateFieldsResponse(response: unknown) {
  if (Array.isArray(response)) {
    return response.map(normalizeTemplateField);
  }

  const record = asRecord(response);
  const data = asRecord(record.data);

  for (const key of ["template_fields", "fields", "items", "data"]) {
    const value = record[key];
    const dataValue = data[key];

    if (Array.isArray(value)) {
      return value.map(normalizeTemplateField);
    }

    if (Array.isArray(dataValue)) {
      return dataValue.map(normalizeTemplateField);
    }
  }

  return [];
}

export function getTemplateCode(template: unknown) {
  const record = asRecord(template);
  const value =
    record.derived_template_id || record.template_id || record.template_code || record.code || record.id;

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

export function getTemplateName(template: unknown) {
  const record = asRecord(template);
  const value = record.template_name || record.name || record.display_name;

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : getTemplateCode(record) || "Untitled template";
}

export function getTemplateIsActive(template: unknown) {
  return asRecord(template).is_active !== false;
}

export function getTemplateIsDefault(template: unknown) {
  return asRecord(template).is_default === true;
}

export function getTemplateContentType(template: unknown) {
  const value = asRecord(template).content_type;

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

export function getTemplateIsStandard(template: unknown) {
  return getTemplateContentType(template).toLowerCase() ===
    TEMPLATE_CONTENT_TYPES.STANDARD.toLowerCase();
}

export function getTemplateIsEditable(template: unknown) {
  const record = asRecord(template);

  return record.is_editable !== false;
}

export function getFieldCode(field: unknown) {
  const record = asRecord(field);
  const value =
    record.field_id ||
    (asRecord(record.field).field_id) ||
    (asRecord(record.field).id) ||
    record.derived_template_field_id ||
    record.field_code ||
    record.code ||
    record.id ||
    record.field_name;

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

export function getFieldLabel(fieldOrCode: unknown) {
  if (typeof fieldOrCode === "string" || typeof fieldOrCode === "number") {
    return String(fieldOrCode);
  }

  const record = asRecord(fieldOrCode);
  const value =
    record.field_label ||
    record.field_name ||
    record.name ||
    getFieldCode(record);

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "Untitled field";
}

export function getFieldShortDescription(field: unknown) {
  const record = asRecord(field);
  const value =
    record.short_desc || record.short_description || record.description;

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

export function getFieldLongDescription(field: unknown) {
  const record = asRecord(field);
  const value =
    record.field_long_description || record.long_desc || record.long_description;

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

export function normalizeStringList(value: unknown) {
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
}

export function getFieldExamples(field: unknown) {
  return normalizeStringList(asRecord(field).examples);
}

export function getFieldLabels(field: unknown) {
  return normalizeStringList(asRecord(field).labels);
}

export function getFieldInstructions(field: unknown) {
  return normalizeStringList(asRecord(field).extraction_instructions);
}



export function getTemplateFieldCodes(template: unknown) {
  const record = asRecord(template);

  if (Array.isArray(record.field_codes)) {
    return record.field_codes.map(String);
  }

  if (Array.isArray(record.existing_field_codes)) {
    return record.existing_field_codes.map(String);
  }

  const detailFields =
    record.fields ||
    record.template_fields ||
    record.field_membership ||
    record.existing_fields;

  return Array.isArray(detailFields)
    ? detailFields.flatMap((field) => {
        const code = getFieldCode(field);
        return code ? [code] : [];
      })
    : [];
}

export function getTemplateFieldCount(template: unknown) {
  const record = asRecord(template);
  const value = record.field_count;

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return getTemplateFieldCodes(template).length;
}

export function buildTemplateUpdatePayload(
  template: unknown,
  {
    fieldCodes = getTemplateFieldCodes(template),
    isActive = getTemplateIsActive(template),
  }: {
    fieldCodes?: string[];
    isActive?: boolean;
  } = {},
) {
  const record = asRecord(template);

  return {
    name: getTemplateName(template),
    description:
      typeof record.description === "string" ? record.description : null,
    business_process_tags: normalizeStringList(record.business_process_tags),
    document_type_tags: normalizeStringList(record.document_type_tags),
    taxation_tags: normalizeStringList(record.taxation_tags),
    existing_fields: fieldCodes.map((fieldId, index) => ({
      field_id: fieldId,
      sort_sequence: index + 1,
    })),
    is_active: getTemplateIsDefault(template) ? true : isActive,
  };
}

export function resolveTemplateFields<TRecord extends ApiRecord = ApiRecord>(
  template: unknown,
  allFields: TRecord[] = [],
) {
  const record = asRecord(template);
  const fields =
    record.fields ??
    record.template_fields ??
    record.field_membership ??
    record.existing_fields;

  if (Array.isArray(fields) && fields.length) {
    return fields.map((field) => {
      if (typeof field === "string") {
        return ({ field_code: field } as unknown as TRecord);
      }
      const fRecord = asRecord(field);
      if (fRecord.field && typeof fRecord.field === "object") {
        return {
          ...asRecord(fRecord.field),
          ...fRecord,
        } as unknown as TRecord;
      }
      return (field as TRecord);
    });
  }

  const fieldsByCode = new Map(
    allFields.flatMap((field) => {
      const code = getFieldCode(field);
      return code ? [[code, field] as const] : [];
    }),
  );

  return getTemplateFieldCodes(record).map(
    (fieldCode) =>
      fieldsByCode.get(fieldCode) ??
      ({ field_code: fieldCode } as unknown as TRecord),
  );
}
