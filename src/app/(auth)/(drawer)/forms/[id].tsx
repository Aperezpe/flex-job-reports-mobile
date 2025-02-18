import { StyleSheet, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useSelector } from "react-redux";
import { selectSystemTypes } from "../../../../redux/selectors/sessionDataSelectors";
import { SystemType } from "../../../../types/SystemType";
import { getFormApi } from "../../../../api/formsManagementApi";
import { mapSystemForm, SystemForm } from "../../../../types/SystemForm";
import { TabView } from "@rneui/base";
import AppTab from "../../../../components/forms/AppTab";
import TabPill from "../../../../components/forms/TabPill";
import CustomButton from "../../../../components/CustomButton";
import { ScrollView } from "react-native-gesture-handler";

const Form = () => {
  const { id, edit } = useLocalSearchParams();
  const navigation = useNavigation();
  const systemTypes: SystemType[] = useSelector(selectSystemTypes);
  const [systemType, setSystemtype] = useState<SystemType | undefined>();
  const [systemForm, setSystemForm] = useState<SystemForm>({
    schema: {
      sections: [],
    },
  });
  const [index, setIndex] = useState(0);

  const updateSystemForm = (newSystemForm: SystemForm) => {
    setSystemForm((prevState) => ({
      ...prevState,
      newSystemForm,
    }));
  };

  useEffect(() => {
    const fetchForm = async (systemTypeId: number) => {
      try {
        const { data, error } = await getFormApi(systemTypeId);

        if (error) throw error;

        const fetchedSystemForm = mapSystemForm(data);
        updateSystemForm(fetchedSystemForm);
      } catch (error) {
        console.log("error", error);
      }
    };

    if (systemType) {
      navigation.setOptions({
        headerTitle: edit
          ? `Edit ${systemType?.systemType} form`
          : "Start New Form",
      });

      // fetch the form
      fetchForm(systemType.id!);
    }
  }, [systemType]);

  useEffect(() => {
    if (systemTypes.length && typeof id === "string") {
      const idNumber = parseInt(id);
      const selectedSystemType = systemTypes.find(
        (systemType) => systemType.id === idNumber
      );
      setSystemtype(selectedSystemType);
    }
  }, []);

  const addSection = () => {
    setSystemForm((prevSystemForm) => ({
      ...prevSystemForm,
      schema: {
        sections: [
          ...prevSystemForm.schema.sections,
          {
            id: 1,
            title: "",
            fields: [],
          },
        ],
      },
    }));
  };
  //
  const deleteSection = () => {
    setSystemForm((prevSystemForm) => ({
      ...prevSystemForm,
      schema: {
        sections: prevSystemForm.schema.sections.slice(0, -1),
      },
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppTab value={index} onChange={setIndex}>
        {systemForm.schema.sections.map((section, i) => (
          <TabPill
            key={`${i}-tab`}
            title={section.title}
            edit
            onDelete={deleteSection}
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
      </AppTab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        {systemForm.schema.sections.map((section, i) => (
          <TabView.Item key={`${i}-item`}>
            <Text>{section.title}</Text>
          </TabView.Item>
        ))}
      </TabView>
    </ScrollView>
  );
};

export default Form;

const styles = StyleSheet.create({
  container: {},
});
