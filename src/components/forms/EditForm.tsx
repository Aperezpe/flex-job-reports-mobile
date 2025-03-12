import { ActionSheetIOS, Alert, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "expo-router";
import { useSystemForm } from "../../context/SystemFormContext";
import TabPill from "./TabPill";
import CustomButton from "../CustomButton";
import { SystemType } from "../../types/SystemType";
import OptionsButton from "../OptionsButton";
import LoadingComponent from "../LoadingComponent";
import FieldEdit from "./FieldEdit";
import ReorderableList, {
  ReorderableListReorderEvent,
} from "react-native-reorderable-list";
import { ScrollView } from "react-native";
import { globalStyles } from "../../constants/GlobalStyles";
import AddRemoveButton from "../CircleButton";
import { AppColors } from "../../constants/AppColors";
import { Entypo } from "@expo/vector-icons";

type Props = {
  systemType: SystemType;
};

const EditForm = ({ systemType }: Props) => {
  const navigation = useNavigation();
  const {
    addSection,
    removeSection,
    saveForm,
    systemForm,
    onChangeTitle,
    addField,
    loading,
    updateSectionFields,
  } = useSystemForm();
  const { sections } = systemForm.schema;

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const formRefs = useRef<{ [key: number]: () => Promise<boolean> }>({});

  const handleSaveAll = async () => {
    // Check that no sections' title is empty
    const hasEmptyTitle = sections.some((section) => !section.title);

    // Run validation for all forms
    const results = await Promise.all(
      Object.values(formRefs.current).map((validate) => validate())
    );

    // Check if any form has validation errors
    const hasErrors = results.includes(false);

    if (hasEmptyTitle) {
      Alert.alert(
        "Validation Error",
        "Section title can't be empty. Please give it a title.",
        [{ text: "OK" }]
      )
    } else if (hasErrors) {
      Alert.alert(
        "Validation Error",
        "Some fields have errors. Please fix them before submitting.",
        [{ text: "OK" }]
      )
    } else {
      saveForm();
    }
  };

  const registerForm = (id: number, validateFn: () => Promise<boolean>) => {
    formRefs.current[id] = validateFn;
  };

  const unregisterForm = (id: number) => {
    delete formRefs.current[id];
  };

  const handleRemoveSection = (sectionId: number) => {
    const section = sections.find((section) => section.id === sectionId);
    
    section?.fields?.forEach((field) => {
      unregisterForm(field.id);
    });

    removeSection(sectionId);
  };

  const handleOptionsPress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Save", "Add Field"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 1:
            handleSaveAll();
            break;
          case 2:
            addField(selectedTabIndex);
            break;
        }
      }
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${systemType.systemType} form`,
      headerRight: () => (
        <OptionsButton onPress={handleOptionsPress} type="circle" />
      ),
    });
  }, [handleOptionsPress]);

  if (loading) return <LoadingComponent />;

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    updateSectionFields(selectedTabIndex, from, to);
  };

  return (
    <ReorderableList
      data={sections[selectedTabIndex]?.fields ?? []}
      keyExtractor={(field) => `${field.id}`}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingBottom: 15 }}
      onReorder={handleReorder}
      ListHeaderComponent={
        <ScrollView
          horizontal
          contentContainerStyle={[globalStyles.row, styles.tabsContainer]}
        >
          {sections.map((section, i) => (
            <TabPill
              key={`${i}-tab`}
              edit
              isSelected={selectedTabIndex === i}
              onPress={() => setSelectedTabIndex(i)}
              onFocus={() => setSelectedTabIndex(i)}
              section={section}
              onChangeText={onChangeTitle}
              onDelete={handleRemoveSection}
            />
          ))}
          <AddRemoveButton 
            onPress={addSection} 
            backgroundColor={AppColors.orange}
            color={AppColors.whitePrimary}
            size={26}
          />
        </ScrollView>
      }
      renderItem={({ item: field }) => (
        <FieldEdit
          field={field}
          sectionIndex={selectedTabIndex}
          registerForm={registerForm}
          unregisterForm={unregisterForm}
        />
      )}
      ListFooterComponent={
        <View style={{padding: 15 }}>
          <CustomButton>
            <Entypo
              name="plus"
              size={18}
              color={AppColors.bluePrimary}
            />
            Add Field
          </CustomButton>
        </View>
      }
    />
  );
};

export default EditForm;

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 18,
    height: 85,
    gap: 18,
    justifyContent: "flex-start",
  },
});
