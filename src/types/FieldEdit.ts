export type FieldEditValues = {
  type?: FieldType;
  title?: string;
  description?: string;
  required?: boolean;
  content?: any;
}

export type FieldType = "text" | "date" | "dropdown" | "image" | "multipleChoice" | "multipleChoiceGrid";