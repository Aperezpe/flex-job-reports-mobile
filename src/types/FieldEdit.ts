import { DropdownOption } from "../components/Inputs/CustomDropdown";

export type FieldEditValues = {
  type?: FieldType;
  title?: string;
  required?: boolean;
  content?: DropdownOption[] | DateInputContent;
}

export type FieldType = "text" | "date" | "dropdown" | "image";

export type DateInputContent = {
  defaultToToday: boolean;
}