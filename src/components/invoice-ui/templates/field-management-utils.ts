import type { ApiRecord } from "@/api/api.helpers";
import {
  type ExtractionFieldResponse,
} from "@/api/templates/templates.types";

function toDisplayValue(value: unknown, fallback = "N/A") {
  return value === null || value === undefined || value === ""
    ? fallback
    : String(value);
}

function getTrimmedString(value: string | number | null | undefined) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function getFieldLabel(field: ExtractionFieldResponse) {
  return getTrimmedString(field.field_label) || field.field_id;
}

function getFieldLongDescription(field: ExtractionFieldResponse) {
  return getTrimmedString(field.field_long_description);
}

function getFieldDataTypeLabel(field: ExtractionFieldResponse) {
  return toDisplayValue(field.data_type_code, "string");
}

export function buildTemplateFieldDialogRecord(
  field: ExtractionFieldResponse,
): ApiRecord {
  return {
    ...field,
    field_name: getFieldLabel(field),
    field_label: getFieldLabel(field),
    long_desc: getFieldLongDescription(field),
    field_long_description: getFieldLongDescription(field),
    data_type: getFieldDataTypeLabel(field),
    data_type_code: getFieldDataTypeLabel(field),
  };
}
