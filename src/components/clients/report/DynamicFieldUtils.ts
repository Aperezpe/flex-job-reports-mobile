// create a function that gets a string[] and converts it into a DropdownOption[]
import { DropdownOption } from "../../../components/Inputs/CustomDropdown";
import { ListContent } from "../../../types/FieldEdit";

export const convertStringArrayToDropdownOptions = (
  options: ListContent[]
): DropdownOption[] => {
  return options.map((option) => ({
    label: option.value,
    value: option.value,
  }));
};