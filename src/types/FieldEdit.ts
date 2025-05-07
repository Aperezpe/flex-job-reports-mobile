export type FieldEditValues = {
  type?: FieldType;
  title?: string;
  description?: string;
  required?: boolean;
  content?: string[];
}

export type FieldType = "text" | "date" | "dropdown" | "image" | "multipleChoice";