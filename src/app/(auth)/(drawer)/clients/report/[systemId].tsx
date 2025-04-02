import { Alert, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import CustomButton from "../../../../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "../../../../../constants/AppColors";
import ButtonText from "../../../../../components/ButtonText";
import { useSelector } from "react-redux";
import { selectSystemAndAddressBySystemId } from "../../../../../redux/selectors/clientDetailsSelector";
import { RootState } from "../../../../../redux/store";
import {
  selectSystemForm,
  selectSystemFormLoading,
} from "../../../../../redux/selectors/systemFormSelector";
import { SystemType } from "../../../../../types/SystemType";
import { selectSystemTypeById } from "../../../../../redux/selectors/sessionDataSelectors";
import { fetchForm } from "../../../../../redux/actions/systemFormActions";
import { useDispatch } from "react-redux";
import LoadingComponent from "../../../../../components/LoadingComponent";
import { FlatList } from "react-native-gesture-handler";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import TabPill from "../../../../../components/forms/TabPill";
import InfoSection from "../../../../../components/InfoSection";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import DynamicField from "./DynamicField";
import { generateDynamicFormSchema } from "../../../../../constants/ValidationSchemas";

const JobReport = () => {
  const params = useLocalSearchParams();
  const systemId = parseInt(params.systemId as string);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { system, address } = useSelector((state: RootState) =>
    selectSystemAndAddressBySystemId(state, systemId)
  );
  const systemType: SystemType | null = useSelector((state: RootState) =>
    selectSystemTypeById(state, system?.systemTypeId)
  );
  const systemFormLoading = useSelector(selectSystemFormLoading);
  const {
    schema: { sections },
  } = useSelector(selectSystemForm);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const addressInfo = [
    {
      label: "Name",
      value: address?.addressTitle,
    },
    {
      label: "Address",
      value: address?.addressString,
    },
  ];

  const systemInfo = [
    {
      label: "Name",
      value: system?.systemName,
    },
    {
      label: "Type",
      value: systemType?.systemType,
    },
    {
      label: "Area",
      value: system?.area,
    },
    {
      label: "Tonnage",
      value: system?.tonnage,
    },
  ];

  useEffect(() => {
    if (systemType?.id) dispatch(fetchForm(systemType.id));
  }, [systemType]);

  const initialValues = sections.reduce(
    (values: Record<string, any>, section) => {
      section?.fields?.forEach((field) => {
        if (field.id === 0) return; // Skip dummy field

        switch (field.type) {
          case "text":
          case "dropdown":
            values[field.id] = ""; // Empty string for text/dropdown fields
            break;
          case "date":
          case "image":
            values[field.id] = null; // null for date/image fields
            break;
        }
      });
      return values;
    },
    {}
  );

  const formMethods = useForm<any>({
    resolver: yupResolver<any>(generateDynamicFormSchema(sections)),
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = formMethods;

  const handleClose = () => {
    if (isDirty) {
      Alert.alert("Are you sure?", "Your changes will be lost", [
        {
          text: "Cancel",
          style: "cancel",
          isPreferred: true,
        },
        {
          text: "Confirm",
          onPress: router.back,
          style: "destructive",
        },
      ]);
    } else {
      router.back();
    }
  };

  // TODO: Remove once unused
  useEffect(() => {
    console.log("form errors:", errors)
  }, [errors])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ButtonText
          bold
          onPress={handleSubmit((values) => {
            console.log("Submitting values 2", values);
            // Add your submission logic here
          })}
        >
          Submit
        </ButtonText>
      ),
      headerLeft: () => (
        <CustomButton
          primary
          buttonTextStyle={{ paddingVertical: 2 }}
          onPress={handleClose}
        >
          <Ionicons name="close" size={20} color={AppColors.darkBluePrimary} />
        </CustomButton>
      ),
    });
  }, [handleSubmit, handleClose]);

  if (systemFormLoading) return <LoadingComponent />;

  return (
    <FormProvider {...formMethods}>
      <FlatList
        data={sections[selectedTabIndex]?.fields ?? []}
        keyExtractor={(field) => `${field.id}`}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: 15 }}
        ListHeaderComponent={
          <FlatList
            data={sections}
            horizontal
            contentContainerStyle={[globalStyles.row, styles.tabsContainer]}
            keyExtractor={(section) => `${section.id}`}
            renderItem={({ item: section, index }) => (
              <TabPill
                isSelected={selectedTabIndex === index}
                onPress={() => setSelectedTabIndex(index)}
                onFocus={() => setSelectedTabIndex(index)}
                section={section}
              />
            )}
          />
        }
        renderItem={({ item: formField }) => (
          <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
            {/* Only Default Info tab has a field with id = 0. It's a little hack to be able to show the Default Info message  */}
            {formField.id == 0 ? (
              <>
                <InfoSection
                  title="Address Info"
                  titleStyles={{ paddingTop: 0 }}
                  infoList={addressInfo}
                />
                <InfoSection title="System Info" infoList={systemInfo} />
              </>
            ) : (
              <>
                <Controller
                  control={control}
                  name={formField.id.toString()}
                  render={({ field: controllerField }) => (
                    <DynamicField
                      controllerField={controllerField}
                      formField={formField}
                      errors={errors}
                    />
                  )}
                />
              </>
            )}
          </View>
        )}
      />
    </FormProvider>
  );
};

export default JobReport;

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 18,
    height: 85,
    gap: 18,
    justifyContent: "flex-start",
  },
});
