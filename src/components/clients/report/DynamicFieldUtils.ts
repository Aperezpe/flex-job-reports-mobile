// create a function that gets a string[] and converts it into a DropdownOption[]
import { DropdownOption } from "../../../components/Inputs/CustomDropdown";

export const convertStringArrayToDropdownOptions = (
  options: string[]
): DropdownOption[] => {
  return options.map((option) => ({
    label: option,
    value: option,
  }));
};