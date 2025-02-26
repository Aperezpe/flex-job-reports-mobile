export type FieldEditValues = {
  type?: "text" | "date" | "dropdown" | "image";
  title?: string;
  required?: boolean;
  content?: string;
}