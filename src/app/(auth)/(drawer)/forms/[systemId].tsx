import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SystemType } from "../../../../types/SystemType";
import { useSelector } from "react-redux";
import { selectSystemTypes } from "../../../../redux/selectors/sessionDataSelectors";
import LoadingComponent from "../../../../components/LoadingComponent";
import { useDispatch } from "react-redux";
import {
  selectSystemForm,
  selectSystemFormLoading,
} from "../../../../redux/selectors/systemFormSelector";
import { ActionSheetIOS, Alert, StyleSheet, View } from "react-native";
import {
  addField,
  addSection,
  changeSectionTitle,
  fetchForm,
  removeSection,
  saveForm,
  updateSectionFields,
} from "../../../../redux/actions/systemFormActions";
import OptionsButton from "../../../../components/OptionsButton";
import ReorderableList, {
  ReorderableListReorderEvent,
} from "react-native-reorderable-list";
import { FlatList } from "react-native-gesture-handler";
import TabPill from "../../../../components/forms/TabPill";
import { globalStyles } from "../../../../constants/GlobalStyles";
import AddRemoveButton from "../../../../components/CircleButton";
import { AppColors } from "../../../../constants/AppColors";
import CustomButton from "../../../../components/CustomButton";
import { Entypo } from "@expo/vector-icons";
import DynamicField from "../../../../components/forms/DynamicField";

const SystemFormPage = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const systemTypes: SystemType[] = useSelector(selectSystemTypes);
  const systemFormLoading = useSelector(selectSystemFormLoading);
  const {
    schema: { sections },
  } = useSelector(selectSystemForm);

  const [systemType, setSystemtype] = useState<SystemType | undefined>();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const formRefs = useRef<{ [key: number]: () => Promise<boolean> }>({});

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
            dispatch(addField({ sectionId: sections[selectedTabIndex].id }));
            break;
        }
      }
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${systemType?.systemType} form`,
      headerRight: () => (
        <OptionsButton onPress={handleOptionsPress} type="circle" />
      ),
    });
  }, [handleOptionsPress]);

  useEffect(() => {
    if (systemTypes.length && typeof params.systemId === "string") {
      const systemId = parseInt(params.systemId);
      const selectedSystemType = systemTypes.find(
        (systemType) => systemType.id === systemId
      );
      setSystemtype(selectedSystemType);
      dispatch(fetchForm(systemId));
    }
  }, [systemTypes]);

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
      dispatch(saveForm());
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

    dispatch(removeSection(sectionId));

    // If the last section is removed, set the selected tab to the previous one
    if (selectedTabIndex >= sections.length - 1) {
      setSelectedTabIndex(selectedTabIndex - 1);
    }
  };

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    dispatch(
      updateSectionFields({
        sectionId: sections[selectedTabIndex].id,
        from,
        to,
      })
    );
  };

  if (systemFormLoading) return <LoadingComponent />;

  if (!systemType) {
    return <LoadingComponent />;
  }

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
              onChangeText={(text, sectionId) =>
                dispatch(changeSectionTitle({ sectionId, title: text }))
              }
              onDelete={handleRemoveSection}
            />
          )}
          ListFooterComponent={
            <AddRemoveButton
              onPress={() => dispatch(addSection())}
              backgroundColor={AppColors.orange}
              color={AppColors.whitePrimary}
              size={26}
            />
          }
        />
      }
      renderItem={({ item: field }) => (
        <DynamicField
          fieldId={field.id}
          sectionId={sections[selectedTabIndex].id}
          registerForm={registerForm}
          unregisterForm={unregisterForm}
        />
      )}
      ListFooterComponent={
        sections.length ? (
          <View style={{ padding: 15 }}>
            <CustomButton
              onPress={() =>
                dispatch(addField({ sectionId: sections[selectedTabIndex].id }))
              }
            >
              <Entypo name="plus" size={18} color={AppColors.bluePrimary} />
              Add Field
            </CustomButton>
          </View>
        ) : null
      }
    />
  );
};

export default SystemFormPage;

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 18,
    height: 85,
    gap: 18,
    justifyContent: "flex-start",
  },
});
