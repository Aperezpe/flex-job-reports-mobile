import React from "react";
import { View, Text } from "react-native";
import { CustomTextInput } from "../../../../../components/Inputs/CustomInput";
import { ControllerRenderProps } from "react-hook-form";
import { FormField } from "../../../../../types/SystemForm";
import { globalStyles } from "../../../../../constants/GlobalStyles";

type DynamicFieldProps = {
  formField: FormField,
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
      <Text style={[globalStyles.textBold, { padding: 5 }]}>{formField.title}</Text>
      {formField.type === "text" && (
        <CustomTextInput
          value={controllerField.value}
          defaultValue=""
          onChangeText={controllerField.onChange}
          placeholder="Enter text"
          inlineErrorMessage={errors?.[`${formField.id}`]?.message}
        />
      )}
      {formField.type === "date" && <Text>Date Picker</Text>}
      {formField.type === "dropdown" && <Text>Dropdown Input Component</Text>}
      {formField.type === "image" && <Text>Image Input</Text>}
      {!["text", "date", "dropdown", "image"].includes(formField.type ?? '') && (
        <Text>Unsupported field type</Text>
      )}
    </View>
  );
};

export default DynamicField;