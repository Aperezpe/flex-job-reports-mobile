import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { CustomTextInput } from "../../Inputs/CustomInput";
import { ControllerRenderProps, UseFormSetValue } from "react-hook-form";
import { FormField } from "../../../types/SystemForm";
import { globalStyles } from "../../../constants/GlobalStyles";
import { CustomDropdown } from "../../Inputs/CustomDropdown";
import { CustomDatePicker } from "../../Inputs/CustomDatePicker";
import CustomImageInput from "../../Inputs/CustomImageInput/CustomImageInput";

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
    const hasError = !!(
      isFormSubmitted &&
      formField.required &&
      !value
    );
    const errorMessage = `${formField.title} is required`;
    if (hasError) {
      setInlineErrorMessage(errorMessage);
    } else {
      setInlineErrorMessage("");
    }
  }, [isFormSubmitted, value]);

  useEffect(() => {
    if (formField.type === "date" && setValue) {
      setValue(controllerField.name, new Date());
    }
  }, [formField.type, controllerField.name, setValue]);

  const fieldTitle = () => (
    formField.type !== "image" && (
      <Text style={[globalStyles.textBold, { paddingBottom: 5 }]}>
        {formField.title}
      </Text>
    )
  );

  // View-only fields
  if (disabled)
    return (
      <View>
        {fieldTitle()}

        {formField.type === "image" && (
          <CustomImageInput
            editable={false}
            viewOnlyValue={viewOnlyValue as string[]}
            label={formField.title}
            onImageSelected={(uri) => controllerField.onChange(uri)}
            errorMessage={inlineErrorMessage}
          />
        )}

        {formField.type !== "image" && (
          <CustomTextInput
            viewOnlyValue={viewOnlyValue as string}
            defaultValue=""
            onChangeText={controllerField.onChange}
            placeholder="Enter text"
            inlineErrorMessage={inlineErrorMessage}
            editable={false}
          />
        )}
      </View>
    );

  return (
    <View>
      {fieldTitle()}

      {formField.type === "text" && (
        <CustomTextInput
          value={controllerField.value}
          defaultValue=""
          onChangeText={controllerField.onChange}
          placeholder="Enter text"
          inlineErrorMessage={inlineErrorMessage}
          editable={!disabled}
        />
      )}
      {formField.type === "dropdown" && (
        <CustomDropdown
          fieldName={controllerField.name}
          initialValue={controllerField.value ?? null}
          onChange={(value) => {
            controllerField.onChange(value);
          }}
          options={formField.content ?? []}
          inlineErrorMessage={inlineErrorMessage}
          placeholder="Select Option"
        />
      )}
      {formField.type === "date" && (
        <CustomDatePicker
          fieldName={controllerField.name}
          setValue={setValue}
          value={value}
          initialValue={new Date()}
          onChange={(value) => {
            controllerField.onChange(value);
          }}
          inlineErrorMessage={inlineErrorMessage}
          placeholder="Select a Date"
        />
      )}
      {formField.type === "image" && (
        <CustomImageInput
          label={formField.title}
          onImageSelected={(uri) => controllerField.onChange(uri)}
          errorMessage={inlineErrorMessage}
        />
      )}
      {!["text", "date", "dropdown", "image"].includes(
        formField.type ?? ""
      ) && <Text>Unsupported field type</Text>}
    </View>
  );
};

export default DynamicField;
