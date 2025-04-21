import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { CustomTextInput } from "../../Inputs/CustomInput";
import { ControllerRenderProps, UseFormSetValue } from "react-hook-form";
import { FormField } from "../../../types/SystemForm";
import { globalStyles } from "../../../constants/GlobalStyles";
import { CustomDropdown } from "../../Inputs/CustomDropdown";
import { CustomDatePicker } from "../../Inputs/CustomDatePicker";
import CustomImageInput from "../../Inputs/CustomImageInput/CustomImageInput";
import { formatDate } from "../../../utils/date";

type DynamicFieldProps = {
  viewOnlyValue?: string | string[];
  value: any;
  isFormSubmitted: boolean;
  formField: FormField;
  controllerField: ControllerRenderProps<any, string>;
  disabled?: boolean;
  setValue: UseFormSetValue<any>;
};

const DynamicField: React.FC<DynamicFieldProps> = ({
  viewOnlyValue,
  value,
  isFormSubmitted,
  formField,
  controllerField,
  disabled,
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

  const renderViewOnlyField = () => {
    if (formField.type === "image") {
      return (
        <CustomImageInput
          editable={false}
          viewOnlyValue={viewOnlyValue as string[]}
          label={formField.title}
          onImageSelected={(uri) => controllerField.onChange(uri)}
          errorMessage={inlineErrorMessage}
        />
      );
    }

    if (formField.type === "date") {
      viewOnlyValue = viewOnlyValue
        ? formatDate(new Date(viewOnlyValue as string))
        : "";
    }

    return (
      <CustomTextInput
        viewOnlyValue={viewOnlyValue as string}
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
            options={formField.content ?? []}
            inlineErrorMessage={inlineErrorMessage}
            placeholder="Select Option"
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
            onImageSelected={controllerField.onChange}
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
      {disabled ? renderViewOnlyField() : renderEditableField()}
    </View>
  );
};

export default DynamicField;
