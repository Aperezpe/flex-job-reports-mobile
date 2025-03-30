import { Alert, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { AppColors } from "../../constants/AppColors";
import { CustomDropdown, DropdownOption } from "../Inputs/CustomDropdown";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldEditSchema } from "../../constants/ValidationSchemas";
import SwitchInput from "../Inputs/SwitchInput";
import { FieldEditValues } from "../../types/FieldEdit";
import { globalStyles } from "../../constants/GlobalStyles";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useReorderableDrag } from "react-native-reorderable-list";
import { Divider, makeStyles, Text } from "@rneui/themed";
import DropdownOptionItem from "./DropdownOptionItem";
import AddRemoveButton from "../CircleButton";
import { useDispatch } from "react-redux";
import {
  removeField,
  updateField,
} from "../../redux/actions/systemFormActions";
import { useSelector } from "react-redux";
import { selectField } from "../../redux/selectors/systemFormSelector";
import { RootState } from "../../redux/store";

type Props = {
  fieldId: number;
  sectionId: number;
  registerForm: (id: number, validateFn: () => Promise<boolean>) => void;
  unregisterForm: (id: number) => void;
};

const DynamicField = ({
  fieldId,
  sectionId,
  registerForm,
  unregisterForm,
}: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const formField = useSelector((state: RootState) =>
    selectField(state, sectionId, fieldId)
  );
  const drag = useReorderableDrag();
  const [dropdownOptionText, setDropdownOptionText] = useState("");

  const fieldTypes: DropdownOption[] = [
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
    mode: "onBlur",
    resolver: yupResolver<any>(FieldEditSchema),
    defaultValues: {
      title: formField.title,
      type: formField.type,
      required: formField.required,
      content: formField.content,
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = formMethods;

  const validateForm = async () => {
    let isValid = false;

    await handleSubmit(
      () => {
        isValid = true; // Indicate success
      },
      () => {
        isValid = false; // Indicate failure
      }
    )();

    return isValid;
  };

  // Register validation function with the parent
  useEffect(() => {
    registerForm(formField.id, validateForm);
  }, []);

  useEffect(() => {
    const handleOnShow = () => {
      if (formField.id) {
        reset({
          title: formField.title,
          required: formField.required,
          type: formField.type,
          content: formField.content,
        });
      }
    };
    handleOnShow();
  }, []);

  const updateFormField = (fieldName: string, value: any) => {
    let content = formField.content;
    if (fieldName === "type" && (value === "dropdown" || value === "image")) {
      content = formField.content ?? [];
    }

    const updatedField = { ...formField, [fieldName]: value, content };
    dispatch(
      updateField({ sectionId, fieldId: updatedField.id, field: updatedField })
    );
  };

  const handleRemoveField = () => {
    unregisterForm(formField.id);
    dispatch(removeField({ sectionId, fieldId: formField.id }));
  };

  const handleFieldDelete = () => {
    Alert.alert("Are you sure?", "The client will be removed", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: handleRemoveField,
        style: "destructive",
      },
    ]);
  };

  const handleAddDropdownOption = () => {
    if (dropdownOptionText.trim() === "") {
      Alert.alert("Error", "Please enter a valid option");
      return;
    }
    const newOption: DropdownOption = {
      label: dropdownOptionText,
      value: dropdownOptionText,
    };
    setValue("content", [
      ...(formField.content as DropdownOption[]),
      newOption,
    ]);

    dispatch(
      updateField({
        sectionId,
        fieldId: formField.id,
        field: {
          ...formField,
          content: [...(formField.content as DropdownOption[]), newOption],
        },
      })
    );
    setDropdownOptionText("");
  };

  const handleRemoveDropdownOption = (index: number) => {
    const updatedOptions = (formField.content as DropdownOption[]).filter(
      (_, i) => i !== index
    );
    setValue("content", updatedOptions);
    dispatch(
      updateField({
        sectionId,
        fieldId: formField.id,
        field: {
          ...formField,
          content: updatedOptions,
        },
      })
    );
  };

  return (
    <FormProvider {...formMethods}>
      <View style={[styles.container]}>
        <View style={[globalStyles.row, { gap: 10 }]}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <CustomDropdown
                fieldName={field.name}
                initialValue={field.value ?? null}
                onChange={(value) => {
                  field.onChange(value);
                  updateFormField("type", value);
                }}
                options={fieldTypes}
                inlineErrorMessage={errors.type?.message}
                placeholder=""
              />
            )}
          />
          <MaterialIcons name="drag-indicator" size={28} onLongPress={drag} />
        </View>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <View>
              <TextInput
                value={formField.title} // text input value from DB
                onChangeText={(text) => {
                  field.onChange(text);
                  updateFormField("title", text);
                }}
                placeholder="Untitled Field"
                style={[styles.titleInput]}
                placeholderTextColor={AppColors.grayPlaceholder}
              />
              {errors.title && (
                <Text style={[globalStyles.textRegular, { color: "red" }]}>
                  {errors.title.message}
                </Text>
              )}
            </View>
          )}
        />
        <Controller
          control={control}
          name="content"
          render={({ field }) =>
            (() => {
              switch (formField.type) {
                case "dropdown":
                  return (
                    <>
                      <View style={[globalStyles.row]}>
                        <TextInput
                          placeholder="Add Option"
                          value={dropdownOptionText}
                          onChangeText={setDropdownOptionText}
                        />
                        <AddRemoveButton
                          onPress={handleAddDropdownOption}
                          backgroundColor={AppColors.bluePrimary}
                          color={AppColors.whitePrimary}
                          size={18}
                        />
                      </View>
                      {errors.content && (
                        <Text style={{ color: "red" }}>
                          {errors.content.message || JSON.stringify(errors)}
                        </Text>
                      )}
                      <View style={{ gap: 10 }}>
                        <FlatList
                          data={field.value as DropdownOption[]}
                          scrollEnabled={false}
                          keyExtractor={(_, i) => i.toString()}
                          renderItem={({ item: option, index }) => (
                            <DropdownOptionItem
                              option={option}
                              onPress={() => handleRemoveDropdownOption(index)}
                            />
                          )}
                          contentContainerStyle={
                            (formField.content as DropdownOption[])?.length >
                              0 && styles.dropdownOptionsContainer
                          }
                          ItemSeparatorComponent={() => (
                            <Divider style={{ marginVertical: 8 }} />
                          )}
                        />
                      </View>
                    </>
                  );
                default:
                  return <></>; // Returns nothing for field types with no additional options
              }
            })()
          }
        />
        <Controller
          control={control}
          name={"required"}
          render={({ field }) => (
            <SwitchInput
              label="Required"
              value={formField.required}
              onValueChange={(value) => {
                field.onChange(value); // Switch value from local state
                updateFormField("required", value); // Switch value from DB
              }}
            />
          )}
        />
        <View style={[globalStyles.row]}>
          <View />
          <MaterialCommunityIcons
            name="delete"
            size={22}
            color={styles.trashIcon.color}
            onPress={() => handleFieldDelete()}
          />
        </View>
      </View>
    </FormProvider>
  );
};

export default DynamicField;

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: AppColors.whitePrimary,
    padding: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: AppColors.grayPlaceholder,
    gap: 18,
    marginBottom: 18,
  },
  titleInput: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
  dropdownOptionsContainer: {
    gap: 0,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.grayPlaceholder,
  },
  trashIcon: {
    color: theme.colors.black,
  },
}));
