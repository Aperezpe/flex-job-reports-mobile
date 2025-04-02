import React from "react";
import { View, Text } from "react-native";
import { CustomTextInput } from "../../../../../components/Inputs/CustomInput";
import { ControllerRenderProps } from "react-hook-form";
import { FormField } from "../../../../../types/SystemForm";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import { CustomDropdown } from "../../../../../components/Inputs/CustomDropdown";
import { CustomDatePicker } from "../../../../../components/Inputs/CustomDatePicker";

type DynamicFieldProps = {
  formField: FormField;
  controllerField: ControllerRenderProps<any, string>;
  errors?: Record<string, any>;
};

const DynamicField: React.FC<DynamicFieldProps> = ({
  formField,
  controllerField,
  errors,
}) => {

  return (
    <View>
      <Text style={[globalStyles.textBold, { paddingBottom: 5 }]}>
        {formField.title}
      </Text>
      {formField.type === "text" && (
        <CustomTextInput
          value={controllerField.value}
          defaultValue=""
          onChangeText={controllerField.onChange}
          placeholder="Enter text"
          inlineErrorMessage={errors?.[`${formField.id}`]?.message}
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
          inlineErrorMessage={errors?.[`${formField.id}`]?.message}
          placeholder="Select Option"
        />
      )}
      {formField.type === "date" && (
        <CustomDatePicker
          fieldName={controllerField.name}
          initialValue={new Date()} // Defaults DatePicker to today
          onChange={(value) => {
            controllerField.onChange(value);
          }}
          inlineErrorMessage={errors?.[`${formField.id}`]?.message}
          placeholder="Select a Date"
        />
      )}
      {formField.type === "image" && <Text>Image Input</Text>}
      {!["text", "date", "dropdown", "image"].includes(
        formField.type ?? ""
      ) && <Text>Unsupported field type</Text>}
    </View>
  );
};

export default DynamicField;
