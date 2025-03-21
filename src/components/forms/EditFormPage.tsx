import { ActionSheetIOS, Alert, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useSystemForm } from "../../context/SystemFormContext";
import TabPill from "./TabPill";
import CustomButton from "../CustomButton";
import { SystemType } from "../../types/SystemType";
import OptionsButton from "../OptionsButton";
import LoadingComponent from "../LoadingComponent";
import DynamicField from "./DynamicField";
import ReorderableList, {
  ReorderableListReorderEvent,
} from "react-native-reorderable-list";
import { ScrollView } from "react-native";
import { globalStyles } from "../../constants/GlobalStyles";
import AddRemoveButton from "../CircleButton";
import { AppColors } from "../../constants/AppColors";
import { Entypo } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";

type Props = {
  systemType: SystemType;
};

const EditFormPage = ({ systemType }: Props) => {
  const navigation = useNavigation();
  const router = useRouter();
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
      );
    } else if (hasErrors) {
      Alert.alert(
        "Validation Error",
        "Some fields have errors. Please fix them before submitting.",
        [{ text: "OK" }]
      );
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

    // If the last section is removed, set the selected tab to the previous one
    if (selectedTabIndex >= sections.length - 1) {
      setSelectedTabIndex(selectedTabIndex - 1);
    }
  };

  const handleOptionsPress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Save", "Add Field", "Form Settings"],
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
          case 2:
            router.push("FormSettings", {
              // TODO: Not yet implemented
              // systemType: systemType.id,
            });
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

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    updateSectionFields(selectedTabIndex, from, to);
  };

  if (loading) return <LoadingComponent />;

  return (
    <ReorderableList
      data={sections[selectedTabIndex]?.fields ?? []}
      keyExtractor={(field) => `${field.id}`}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingBottom: 15 }}
      onReorder={handleReorder}
      ListHeaderComponent={
        <FlatList
          data={sections}
          horizontal
          contentContainerStyle={[globalStyles.row, styles.tabsContainer]}
          keyExtractor={(section) => `${section.id}`}
          renderItem={({ item: section, index }) => (
            <TabPill
              edit
              isSelected={selectedTabIndex === index}
              onPress={() => setSelectedTabIndex(index)}
              onFocus={() => setSelectedTabIndex(index)}
              section={section}
              onChangeText={onChangeTitle}
              onDelete={handleRemoveSection}
            />
          )}
          ListFooterComponent={
            <AddRemoveButton
              onPress={addSection}
              backgroundColor={AppColors.orange}
              color={AppColors.whitePrimary}
              size={26}
            />
          }
        />
      }
      renderItem={({ item: field }) => (
        <DynamicField
          field={field}
          sectionIndex={selectedTabIndex}
          registerForm={registerForm}
          unregisterForm={unregisterForm}
        />
      )}
      ListFooterComponent={
        sections.length ? (
          <View style={{ padding: 15 }}>
            <CustomButton onPress={() => addField(selectedTabIndex)}>
              <Entypo name="plus" size={18} color={AppColors.bluePrimary} />
              Add Field
            </CustomButton>
          </View>
        ) : null
      }
    />
  );
};

export default EditFormPage;

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 18,
    height: 85,
    gap: 18,
    justifyContent: "flex-start",
  },
});
