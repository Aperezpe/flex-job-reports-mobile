export type FieldEditValues = {
  type?: FieldType;
  title?: string;
  description?: string;
  required?: boolean;
  addOther?: boolean;
  listContent?: ListContent[];
  gridContent?: GridContent;
}

export type ListContent = {
  key?: number;
  value: string;
}

export type GridContent = {
  rows: ListContent[];
  columns: ListContent[];
}

// Define an array with `as const` to make literals
export const fieldTypeOptions = [
  "text",
  "date",
  "dropdown",
  "image",
  "checkboxes",
  "multipleChoice",
  "multipleChoiceGrid",
  "checkboxGrid",
] as const;

export type FieldType = typeof fieldTypeOptions[number];