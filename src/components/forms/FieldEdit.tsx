import { Alert, View } from "react-native";
import React, { useEffect, useState } from "react";
import { FormField } from "../../types/SystemForm";
import { AppColors } from "../../constants/AppColors";
import { CustomDropdown, DropdownOption } from "../Inputs/CustomDropdown";
import { TextInput } from "react-native-gesture-handler";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldEditSchema } from "../../constants/ValidationSchemas";
import SwitchInput from "../Inputs/SwitchInput";
import { FieldEditValues } from "../../types/FieldEdit";
import { globalStyles } from "../../constants/GlobalStyles";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useReorderableDrag } from "react-native-reorderable-list";
import { useSystemForm } from "../../context/SystemFormContext";
import { makeStyles } from "@rneui/themed";

type Props = { field: FormField; sectionIndex: number };

const FieldEdit = ({ field, sectionIndex }: Props) => {
  const styles = useStyles();
  const [formField, setFormField] = useState(field);
  const { updateField, removeField } = useSystemForm();
  const drag = useReorderableDrag();

  const fieldOptions: DropdownOption[] = [
    {
      label: "Text Input",
      value: "text",
    },
    {
      label: "Dropdown",
      value: "dropdown",
    },
    {
      label: "Date",
      value: "date",
    },
    {
      label: "Image",
      value: "image",
    },
  ];

  const formMethods = useForm<FieldEditValues>({
    resolver: yupResolver<any>(FieldEditSchema),
    defaultValues: {
      title: formField.title,
      type: formField.type,
      required: formField.required,
      content: formField.content,
    },
  });

  const { reset, control } = formMethods;

  const handleOnShow = () => {
    if (formField?.id) {
      reset({
        title: formField.title,
        required: formField.required,
        type: formField.type,
        content: formField.content,
      });
    }
  };

  useEffect(() => {
    handleOnShow();
  }, []);

  const updateFormField = (fieldName: string, value: any) => {
    const updatedField = { ...formField, [fieldName]: value };
    setFormField(updatedField);
  };

  useEffect(() => {
    updateField(sectionIndex, formField.id, formField);
  }, [formField]);

  const handleFieldDelete = () => {
    Alert.alert("Are you sure?", "The client will be removed", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: removeField.bind(null, sectionIndex, formField.id),
        style: "destructive",
      },
    ]);
  };

  return (
    <FormProvider {...formMethods}>
      <View style={[styles.container]}>
        <View style={[globalStyles.row, { gap: 8 }]}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <CustomDropdown
                value={field.name} // Dropdown value from DB. It has to be one of the Dropdown options
                onChange={(value) => updateFormField("type", value)}
                options={fieldOptions}
                placeholder=""
                mapValueToLabel={(value) =>
                  fieldOptions.find((option) => option.value === value)
                    ?.label ?? ""
                }
              />
            )}
          />
          <MaterialIcons name="drag-indicator" size={28} onLongPress={drag} />
        </View>
        <Controller
          control={control}
          name="title"
          render={() => (
            <TextInput
              value={formField.title} // text input value from DB
              onChangeText={(text) => updateFormField("title", text)}
              placeholder="Untitled Field"
              style={styles.titleInput}
              placeholderTextColor={AppColors.grayPlaceholder}
            />
          )}
        />
        {/* {(() => {
          switch (status) {
            case "loading":
              return <LoadingComponent />;
            case "error":
              return <ErrorComponent />;
            case "success":
              return <SuccessComponent />;
            default:
              return <DefaultComponent />;
          }
        })()} */}
        <Controller
          control={control}
          name={"required"}
          render={() => (
            <SwitchInput
              label="Required"
              value={formField.required}
              onValueChange={(value) => updateFormField("required", value)} // Switch value from DB
            />
          )}
        />
        <View style={[globalStyles.row]}>
          <View />
          <MaterialCommunityIcons
            name="delete"
            size={22}
            color={styles.trashIcon.color} // Delete icon color from theme
            onPress={() => handleFieldDelete()} // Delete action
          />
        </View>
      </View>
    </FormProvider>
    /* </FormProvider>
    <View style={styles.fieldContainer}>
      
      <CustomDropdown
        value={"Text Input"}
        // inlineErrorMessage={errors.systemType?.message}
        options={fieldOptions}
        placeholder="Select System Type"
        onChange={() => {}}
      />
       <Controller
          control={control}
          name="systemType"
          render={({ field }) => (
            <CustomDropdown
              value={field.name}
              inlineErrorMessage={errors.systemType?.message}
              options={systemTypesOptions}
              placeholder="Select System Type"
              onChange={field.onChange}
            />
          )}
        />
    </View> */

    /* switch (field.type) {
          case "text":
            return <Text>{JSON.stringify(field)}</Text>;
          case "date":
            return <Text>Date Field</Text>;
          case "dropdown":
            return <Text>Dropdown Field</Text>;
          case "image":
            return <Text>Image Input</Text>;
        } */
  );
};

export default FieldEdit;

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: AppColors.whitePrimary,
    padding: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: AppColors.grayPlaceholder,
    gap: 15,
    marginBottom: 18,
  },
  titleInput: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
  trashIcon: {
    color: theme.colors.black,
  },
}));
