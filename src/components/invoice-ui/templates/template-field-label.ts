export const ExtractionFieldLabels = {
  dataType: {
    shortLabel: "Type",
    questionLabel: "What data type should this field use?",
    description:
      "Select the value format, such as text, number, date, or true/false.",
    placeholder: "e.g. text, number, date, amount",
  },

  valueType: {
    shortLabel: "Position",
    questionLabel: "Where does this field appear?",
    description:
      "Choose whether this value appears in the invoice header or line items.",
    placeholder: "Select document position",
  },

  valueLength: {
    shortLabel: "Max Length",
    questionLabel: "What is the expected length? (optional)",
    description: "Enter the typical character count if there is one.",
    placeholder: "e.g. 10 characters",
  },

  fieldName: {
    shortLabel: "Field",
    questionLabel: "What value should this field capture?",
    description:
      "Use a clear business name, like Invoice Number or PO Number.",
    placeholder: "e.g. Invoice Number, PO Number, Account Number",
  },

  shortDescription: {
    shortLabel: "Summary",
    questionLabel: "What is the one-line summary?",
    description:
      "Write a short sentence that explains what this field represents.",
    placeholder: "e.g. Unique number assigned to the invoice",
  },

  longDescription: {
    shortLabel: "Details",
    questionLabel: "How should this field be interpreted?",
    description:
      "Explain the meaning, exceptions, or document-specific behavior.",
    placeholder: "Explain when this value changes across document types",
  },

  alias: {
    shortLabel: "Labels",
    questionLabel: "What labels identify this field?",
    description: "Add invoice labels that may point to the same value.",
    placeholder: "e.g. Invoice No, Facture No, Account Number",
  },

  extractionInstructions: {
    shortLabel: "AI Rules",
    questionLabel: "How should this field be found?",
    description: "Give simple rules for locating the value on the invoice.",
    placeholder:
      "e.g. Look for labels like Invoice No, Invoice #, or Bill Number",
  },

  examples: {
    shortLabel: "Samples",
    questionLabel: "What examples match this field?",
    description: "Add sample values in the expected format.",
    placeholder: "e.g. INV-2025-001",
  },
} as const;
