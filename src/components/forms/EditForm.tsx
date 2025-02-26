import { ActionSheetIOS, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
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

  const handleOptionsPress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Save", "Add Field"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 1:
            saveForm();
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
              onDelete={removeSection}
            />
          ))}
          <CustomButton
            key={"add"}
            add
            circle
            iconSize={24}
            circlePadding={3}
            onPress={addSection}
            secondary
          />
        </ScrollView>
      }
      renderItem={({ item: field }) => (
        <FieldEdit field={field} sectionIndex={selectedTabIndex} />
      )}
    />
  );
};

export default EditForm;


const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 18,
    height: 85,
    gap: 18,
    justifyContent: 'flex-start',
  },
});