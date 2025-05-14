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
import { MultipleChoice } from "../../Inputs/MultipleChoice";

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
    const hasError = isFormSubmitted && formField.required && !value;
    setInlineErrorMessage(hasError ? `${formField.title} is required` : "");
  }, [isFormSubmitted, value, formField.required, formField.title]);

  useEffect(() => {
    if (formField.type === "date" && setValue) {
      setValue(controllerField.name, new Date());
    }
  }, [formField.type, controllerField.name, setValue]);

  const renderFieldTitle = () => {
    if (formField.type === "image") return null;
    return (
      <Text style={[globalStyles.textBold, { paddingBottom: 5 }]}>
        {formField.title}
      </Text>
    );
  };

  const renderFieldDescription = () => {
    if (formField.type === "image" || !formField.description) return null;
    return (
      <Text style={[globalStyles.textRegular, styles.description]}>
        {formField.description}
      </Text>
    );
  };

  const renderViewOnlyField = () => {
    if (formField.type === "image") {
      return (
        <CustomImageInput
          editable={false}
          value={value}
          label={formField.title}
          onChange={controllerField.onChange}
          errorMessage={inlineErrorMessage}
        />
      );
    }

    if (formField.type === "date") {
      value = value ? formatDate(new Date(value as string)) : "";
    }

    return (
      <CustomTextInput
        viewOnlyValue={value as string}
        defaultValue=""
        onChangeText={controllerField.onChange}
        placeholder="Enter text"
        inlineErrorMessage={inlineErrorMessage}
        editable={false}
      />
    );
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
            options={convertStringArrayToDropdownOptions(formField.content ?? [])}
            inlineErrorMessage={inlineErrorMessage}
            placeholder="Select Option"
          />
        );
      case "multipleChoice":
        return (
          <MultipleChoice
            onChange={controllerField.onChange}
            options={formField.content ?? []}
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
      {renderFieldTitle()}
      {renderFieldDescription()}
      {disabled ? renderViewOnlyField() : renderEditableField()}
    </View>
  );
};

export default DynamicField;

const styles = StyleSheet.create({
  description: { color: AppColors.darkGray, paddingBottom: 5, marginTop: -8 },
});
