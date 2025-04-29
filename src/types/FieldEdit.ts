import { DropdownOption } from "../components/Inputs/CustomDropdown";

export type FieldEditValues = {
  type?: FieldType;
  title?: string;
  description?: string;
  required?: boolean;
  content?: DropdownOption[];
}

export type FieldType = "text" | "date" | "dropdown" | "image";