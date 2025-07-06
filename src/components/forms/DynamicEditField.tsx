import { Alert, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import { AppColors } from "../../constants/AppColors";
import { CustomDropdown } from "../Inputs/CustomDropdown";
import { TextInput } from "react-native-gesture-handler";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldEditSchema } from "../../constants/ValidationSchemas";
import SwitchInput from "../Inputs/SwitchInput";
import { FieldEditValues } from "../../types/FieldEdit";
import { globalStyles } from "../../constants/GlobalStyles";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useReorderableDrag } from "react-native-reorderable-list";
import { Divider, makeStyles, Text } from "@rneui/themed";
import { useDispatch } from "react-redux";
import {
  removeField,
  updateField,
} from "../../redux/actions/systemFormActions";
import { useSelector } from "react-redux";
import { selectField } from "../../redux/selectors/systemFormSelector";
import { RootState } from "../../redux/store";
import OptionList from "./OptionList";
import { FIELD_TYPES } from "../../constants/FieldTypes";
import { FormField } from "../../types/SystemForm";
import { DEFAULT_GRID_CONTENT } from "../../constants";

type Props = {
  fieldId: number;
  sectionId: number;
  registerForm: (id: number, validateFn: () => Promise<boolean>) => void;
  unregisterForm: (id: number) => void;
};

const DynamicEditField = ({
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

  const formMethods = useForm<FieldEditValues>({
    mode: "onBlur",
    resolver: yupResolver<any>(FieldEditSchema),
    defaultValues: {
      title: formField.title,
      description: formField.description,
      type: formField.type,
      required: formField.required,
      addOther: formField.addOther,
      listContent: formField.listContent ?? [],
      gridContent: formField.gridContent ?? DEFAULT_GRID_CONTENT,
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = formMethods;

  console.log("errors", errors);

  const validateForm = async () => {
    let isValid = false;
    const updatedForm = watch();

    await handleSubmit(
      () => {
        dispatch(
          updateField({
            sectionId,
            fieldId,
            field: {
              ...formField,
              ...updatedForm,
              listContent: updatedForm.listContent,
              gridContent: {
                ...(updatedForm.gridContent ?? DEFAULT_GRID_CONTENT),
              },
            },
          })
        );
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
          listContent: formField.listContent ?? [],
          gridContent: formField.gridContent ?? DEFAULT_GRID_CONTENT,
        });
      }
    };
    handleOnShow();
  }, []);

  const updateFormField = (fieldName: string, value: any) => {
    let updatedField: FormField;

    if (value === "text" || value === "date") {
      updatedField = {
        ...formField,
        listContent: [],
        gridContent: DEFAULT_GRID_CONTENT,
        [fieldName]: value,
      };
    } else {
      updatedField = { ...formField, [fieldName]: value };
    }
    reset(updatedField);
    dispatch(
      updateField({ sectionId, fieldId: updatedField.id, field: updatedField })
    );
  };

  const handleRemoveField = () => {
    unregisterForm(formField.id);
    dispatch(removeField({ sectionId, fieldId: formField.id }));
  };

  const handleFieldDelete = () => {
    Alert.alert("Are you sure?", "The field will be removed", [
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

  useEffect(() => {
    console.log(watch("gridContent"));
  }, [watch("gridContent")]);

  const handleAddRowOrColumnOption = (
    contentPath: "gridContent.rows" | "gridContent.columns",
    optionText: string
  ) => {
    if (optionText.trim() === "") {
      Alert.alert("Error", "Please enter a valid option");
      return;
    }
    const gridContent = formField.gridContent ?? DEFAULT_GRID_CONTENT;
    const updatedContent = {
      ...gridContent,
      [contentPath.split(".")[1]]: [
        ...(gridContent[contentPath.split(".")[1] as "rows" | "columns"] ?? []),
        { value: optionText },
      ],
    };
    setValue("gridContent", updatedContent);
    dispatch(
      updateField({
        sectionId,
        fieldId: formField.id,
        field: {
          ...formField,
          gridContent: updatedContent,
        },
      })
    );
  };

  const handleAddOption = (optionText: string) => {
    if (optionText.trim() === "") {
      Alert.alert("Error", "Please enter a valid option");
      return;
    }
    const updatedOptions = [
      ...(formField.listContent ?? []),
      { key: Date.now(), value: optionText },
    ];
    setValue("listContent", updatedOptions);
    dispatch(
      updateField({
        sectionId,
        fieldId: formField.id,
        field: {
          ...formField,
          listContent: updatedOptions,
        },
      })
    );
  };

  const handleRemoveOption = (index: number) => {
    if (index < 0 || index >= (formField.listContent ?? []).length) {
      Alert.alert("Error", "Invalid option index");
      return;
    }
    const updatedOptions = (formField.listContent ?? []).filter(
      (_, i) => i !== index
    );
    setValue("listContent", updatedOptions);
    dispatch(
      updateField({
        sectionId,
        fieldId: formField.id,
        field: {
          ...formField,
          listContent: updatedOptions,
        },
      })
    );
  };

  const handleRemoveRowOrColumnOption = (
    contentPath: "gridContent.rows" | "gridContent.columns",
    index: number
  ) => {
    const gridContent = formField.gridContent ?? DEFAULT_GRID_CONTENT;
    if (
      index < 0 ||
      index >=
        gridContent[contentPath.split(".")[1] as "rows" | "columns"].length
    ) {
      Alert.alert("Error", "Invalid option index");
      return;
    }
    const updatedContent = {
      ...gridContent,
      [contentPath.split(".")[1]]: gridContent[
        contentPath.split(".")[1] as "rows" | "columns"
      ].filter((_: any, i: number) => i !== index),
    };
    setValue("gridContent", updatedContent);
    dispatch(
      updateField({
        sectionId,
        fieldId: formField.id,
        field: {
          ...formField,
          gridContent: updatedContent,
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
                options={FIELD_TYPES}
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
                placeholder="Untitled"
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
          name="description"
          render={({ field }) => (
            <View>
              <TextInput
                value={formField.description} // text input value from DB
                onChangeText={(text) => {
                  field.onChange(text);
                  updateFormField("description", text);
                }}
                placeholder="Add Description"
                style={[globalStyles.textRegular, styles.descriptionInput]}
                placeholderTextColor={AppColors.grayPlaceholder}
              />
            </View>
          )}
        />
        {(formField.type === "dropdown" ||
          formField.type === "multipleChoice" ||
          formField.type === "checkboxes") && (
          <Controller
            control={control}
            name="listContent"
            render={({ field: { value, name } }) => (
              <OptionList
                control={control}
                name={name}
                options={value ?? []}
                onAddOption={handleAddOption}
                onRemoveOption={handleRemoveOption}
                placeholder="Add Option"
                errorMessage={
                  (errors.listContent?.root?.message ??
                    errors.listContent?.message) as string
                }
              />
            )}
          />
        )}
        {(formField.type === "multipleChoiceGrid" ||
          formField.type === "checkboxGrid") && (
          <Controller
            control={control}
            name="gridContent"
            render={({ field: { value = DEFAULT_GRID_CONTENT } }) => {
              const { rows, columns } = value;
              const rowsFieldName = "gridContent.rows";
              const columnsFieldName = "gridContent.columns";
              return (
                <View style={{ gap: 8 }}>
                  {errors.gridContent?.message && (
                    <Text style={{ color: "red" }}>
                      {errors.gridContent?.message as string}
                    </Text>
                  )}
                  <Text style={globalStyles.textBold}>Rows</Text>
                  <OptionList
                    control={control}
                    name={rowsFieldName}
                    options={rows}
                    optionCount
                    onAddOption={handleAddRowOrColumnOption.bind(
                      null,
                      rowsFieldName
                    )}
                    onRemoveOption={handleRemoveRowOrColumnOption.bind(
                      null,
                      rowsFieldName
                    )}
                    placeholder="Add Row"
                    errorMessage={
                      (errors.gridContent?.rows?.root?.message ??
                        errors.gridContent?.rows?.message) as string
                    }
                  />
                  <Divider />
                  <Text style={globalStyles.textBold}>Columns</Text>
                  <OptionList
                    control={control}
                    name={columnsFieldName}
                    options={columns}
                    optionCount
                    onAddOption={handleAddRowOrColumnOption.bind(
                      null,
                      columnsFieldName
                    )}
                    onRemoveOption={handleRemoveRowOrColumnOption.bind(
                      null,
                      columnsFieldName
                    )}
                    placeholder="Add Column"
                    errorMessage={
                      (errors.gridContent?.columns?.root?.message ??
                        errors.gridContent?.columns?.message) as string
                    }
                  />
                </View>
              );
            }}
          />
        )}
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
        {(formField.type === "multipleChoice" ||
          formField.type === "checkboxes") && (
          <Controller
            control={control}
            name={"addOther"}
            render={({ field }) => (
              <SwitchInput
                label='Add "Other"'
                value={formField.addOther}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateFormField("addOther", value);
                }}
              />
            )}
          />
        )}
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

export default DynamicEditField;

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
  descriptionInput: {
    marginTop: -8,
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
