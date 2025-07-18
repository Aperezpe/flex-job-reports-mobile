import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomTextInput } from "../../Inputs/CustomInput";
import { ControllerRenderProps, UseFormSetValue } from "react-hook-form";
import { FormField } from "../../../types/SystemForm";
import { globalStyles } from "../../../constants/GlobalStyles";
import { CustomDropdown } from "../../Inputs/CustomDropdown";
import { CustomDatePicker } from "../../Inputs/CustomDatePicker";
import CustomImageInput from "../../Inputs/CustomImageInput/CustomImageInput";
import { formatDate } from "../../../utils/date";
import { AppColors } from "../../../constants/AppColors";
import { convertStringArrayToDropdownOptions } from "./DynamicFieldUtils";
import { DEFAULT_GRID_CONTENT } from "../../../constants";
import MultipleChoiceGrid from "../../Inputs/MultipleChoiceGrid";
import Checkboxes, { OTHER_OPTION_KEY } from "../../Inputs/Checkboxes";
import MultipleChoice from "../../Inputs/MultipleChoice";
import { ListContent } from "../../../types/FieldEdit";
import FieldTitle from "../../forms/FieldTitle";

type DynamicFieldProps = {
  value: any;
  isFormSubmitted: boolean;
  formField: FormField;
  controllerField: ControllerRenderProps<any, string>;
  disabled?: boolean;
  setValue: UseFormSetValue<any>;
};

const DynamicField: React.FC<DynamicFieldProps> = ({
  value,
  isFormSubmitted,
  formField,
  controllerField,
  disabled = false,
  setValue,
}) => {
  const [inlineErrorMessage, setInlineErrorMessage] = useState<string>("");

  useEffect(() => {
    let hasError = false;

    if (isFormSubmitted && formField.required) {
      if (
        formField.type === "multipleChoiceGrid" ||
        formField.type === "checkboxGrid"
      ) {
        // Validate that each row has exactly one selection
        const { rows, columns } = formField.gridContent ?? DEFAULT_GRID_CONTENT;
        const valueKeys = Object.keys(value ?? {});

        // Check if all rows have a selection and the selection is valid
        hasError =
          rows.length === 0 || // No rows defined
          rows.some(
            (row: any) =>
              !valueKeys.includes(row) || !columns.includes(value[row])
          ); // Missing or invalid selection
      } else if (!value) {
        // Default validation for other field types
        hasError = true;
      }
    }

    setInlineErrorMessage(hasError ? `${formField.title} is required` : "");
  }, [isFormSubmitted, value, formField.required, formField.title]);

  useEffect(() => {
    if (formField.type === "date" && setValue) {
      setValue(controllerField.name, new Date());
    }
  }, [formField.type, controllerField.name, setValue]);

  const renderFieldDescription = () => {
    if (formField.type === "image" || !formField.description) return null;
    return (
      <Text style={[globalStyles.textRegular, styles.description]}>
        {formField.description}
      </Text>
    );
  };

  const renderViewOnlyField = () => {
    switch (formField.type) {
      case "multipleChoiceGrid":
      case "checkboxGrid": {
        const NoSelectionsMadeText = (
          <Text style={globalStyles.textRegular}>No selections made</Text>
        );
        if (!value || Object.keys(value).length === 0) {
          return NoSelectionsMadeText;
        }
        return (
          <MultipleChoiceGrid
            multiple={formField.type === "checkboxGrid"}
            value={value}
            gridOptions={formField.gridContent}
            inlineErrorMessage={inlineErrorMessage}
          />
        );
      }
      case "checkboxes": {
        const NoSelectionsMadeText = (
          <Text style={globalStyles.textRegular}>No selections made</Text>
        );
        if (!value || Object.keys(value).length === 0) {
          return NoSelectionsMadeText;
        }
        const optionOtherWasSelectedButBlank = value.some(
          (option: ListContent) =>
            option.key === OTHER_OPTION_KEY && !option.value
        );
        if (optionOtherWasSelectedButBlank) return NoSelectionsMadeText;
        return (
          <Checkboxes
            keyValues={value.flatMap((item: ListContent) => item.key)}
            options={formField.listContent ?? []}
            viewOnlyValues={value}
            inlineErrorMessage={inlineErrorMessage}
          />
        );
      }
      case "image":
        return (
          <CustomImageInput
            editable={false}
            value={value}
            label={formField.title}
            onChange={controllerField.onChange}
            errorMessage={inlineErrorMessage}
          />
        );
      case "date":
        return (
          <CustomTextInput
            viewOnlyValue={value ? formatDate(new Date(value)) : ""}
            defaultValue=""
            onChangeText={controllerField.onChange}
            placeholder="Enter text"
            inlineErrorMessage={inlineErrorMessage}
            editable={false}
          />
        );
      case "multipleChoice":
        return (
          <CustomTextInput
            viewOnlyValue={value?.value}
            defaultValue=""
            onChangeText={controllerField.onChange}
            placeholder="Enter text"
            inlineErrorMessage={inlineErrorMessage}
            editable={false}
          />
        );
      default:
        return (
          <CustomTextInput
            viewOnlyValue={value}
            defaultValue=""
            onChangeText={controllerField.onChange}
            placeholder="Enter text"
            inlineErrorMessage={inlineErrorMessage}
            editable={false}
          />
        );
    }
  };

  const renderEditableField = () => {
    switch (formField.type) {
      case "text":
        return (
          <CustomTextInput
            value={controllerField.value}
            defaultValue=""
            onChangeText={controllerField.onChange}
            placeholder="Enter text"
            inlineErrorMessage={inlineErrorMessage}
            editable={!disabled}
          />
        );
      case "dropdown":
        return (
          <CustomDropdown
            fieldName={controllerField.name}
            initialValue={controllerField.value ?? null}
            onChange={controllerField.onChange}
            options={convertStringArrayToDropdownOptions(
              formField.listContent ?? []
            )}
            inlineErrorMessage={inlineErrorMessage}
            placeholder="Select Option"
          />
        );
      case "multipleChoice":
        return (
          <MultipleChoice
            fieldName={formField.id.toString()}
            onChange={controllerField.onChange}
            option={controllerField.value} // Used when ticket filling in progress
            options={formField.listContent ?? []}
            inlineErrorMessage={inlineErrorMessage}
            addOther={formField.addOther}
          />
        );
      case "checkboxes":
        return (
          <Checkboxes
            fieldName={formField.id.toString()}
            value={controllerField.value} // Used when ticket filling in progress
            onChange={controllerField.onChange}
            options={formField.listContent ?? []}
            inlineErrorMessage={inlineErrorMessage}
            addOther={formField.addOther}
          />
        );
      case "multipleChoiceGrid":
        return (
          <MultipleChoiceGrid
            gridOptions={formField.gridContent}
            value={controllerField.value} // Used when ticket filling in progress
            onChange={controllerField.onChange}
            inlineErrorMessage={inlineErrorMessage}
          />
        );
      case "checkboxGrid":
        return (
          <MultipleChoiceGrid
            multiple
            gridOptions={formField.gridContent}
            value={controllerField.value} // Used when ticket filling in progress
            onChange={controllerField.onChange}
            inlineErrorMessage={inlineErrorMessage}
          />
        );
      case "date":
        return (
          <CustomDatePicker
            fieldName={controllerField.name}
            setValue={setValue}
            value={value}
            initialValue={new Date()}
            onChange={controllerField.onChange}
            inlineErrorMessage={inlineErrorMessage}
            placeholder="Select a Date"
          />
        );
      case "image":
        return (
          <CustomImageInput
            label={formField.title}
            description={formField.description}
            value={controllerField.value as string[]}
            onChange={controllerField.onChange}
            errorMessage={inlineErrorMessage}
          />
        );
      default:
        return <Text>Unsupported field type</Text>;
    }
  };

  return (
    <View>
      {formField.type !== "image" && <FieldTitle>{formField.title}</FieldTitle>}
      {renderFieldDescription()}
      {disabled ? renderViewOnlyField() : renderEditableField()}
    </View>
  );
};

export default DynamicField;

const styles = StyleSheet.create({
  description: { color: AppColors.darkGray, paddingBottom: 5, marginTop: -8 },
  fieldTitle: { fontSize: 18 },
});
