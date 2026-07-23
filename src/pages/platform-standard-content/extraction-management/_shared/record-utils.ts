import type { ApiRecord } from "@/api/templates/api.helpers";

const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};

const normalizeRecord = (
  response: unknown,
  keys: string[] = ["item", "data", "result"],
) => {
  const record = asRecord(response);

  for (const key of keys) {
    const value = record[key];
    const nested = asRecord(value);

    for (const nestedKey of keys) {
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
};

const pickValue = (record: unknown, keys: string[]) => {
  const data = asRecord(record);

  for (const key of keys) {
    const value = data[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
};

const pickString = (
  record: unknown,
  keys: string[],
  fallback = "",
) => {
  const value = pickValue(record, keys);

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
};

const getTemplateCode = (record: unknown) => {
  return pickString(record, ["template_id", "template_code", "code", "id"]);
};

export function getTemplateName(record: unknown) {
  return pickString(
    record,
    ["template_name", "name", "display_name"],
    getTemplateCode(record) || "Untitled template",
  );
}

export function normalizeTemplateDetail(response: unknown) {
  return normalizeRecord(response, ["template", "data", "item", "result"]);
}
