import { Alert, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
import {
  selectAppCompanyAndUser,
  selectSystemTypeById,
} from "../../../../../redux/selectors/sessionDataSelectors";
import { fetchForm } from "../../../../../redux/actions/systemFormActions";
import { useDispatch } from "react-redux";
import LoadingComponent from "../../../../../components/LoadingComponent";
import { FlatList } from "react-native-gesture-handler";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import TabPill from "../../../../../components/forms/TabPill";
import InfoSection from "../../../../../components/InfoSection";
import { Controller, FormProvider, useForm } from "react-hook-form";
import DynamicField from "../../../../../components/clients/report/DynamicField";
import { FormField, FormSection } from "../../../../../types/SystemForm";
import {
  resetJobReport,
  submitJobReport,
} from "../../../../../redux/actions/jobReportActions";
import { JobReport } from "../../../../../types/JobReport";
import {
  selectJobReport,
  selectJobReportError,
  selectJobReportLoading,
} from "../../../../../redux/selectors/jobReportSelector";
import { supabase } from "../../../../../config/supabase";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { STORAGE_BUCKET } from "../../../../../constants";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

const JobReportPage = () => {
  const params = useLocalSearchParams();
  const systemId = parseInt(params.systemId as string);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { system, address } = useSelector((state: RootState) =>
    selectSystemAndAddressBySystemId(state, systemId)
  );
  const loading = useSelector(selectJobReportLoading);
  const error = useSelector(selectJobReportError);
  const jobReport = useSelector(selectJobReport);
  const systemType: SystemType | null = useSelector((state: RootState) =>
    selectSystemTypeById(state, system?.systemTypeId)
  );
  const systemFormLoading = useSelector(selectSystemFormLoading);
  const {
    schema: { sections: sectionsWithDummyField },
  } = useSelector(selectSystemForm);
  const [cleanedSections, setCleanedSections] = useState<FormSection[]>([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [tabsWithError, setTabsWithError] = useState<boolean[]>(
    Array.from({ length: sectionsWithDummyField.length }, () => false)
  );
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const flatListRef = useRef<FlatList<FormField>>(null);
  const { appCompany } = useSelector(selectAppCompanyAndUser);

  useEffect(() => {
    if (systemType?.id) dispatch(fetchForm(systemType.id));
  }, [systemType]);

  useEffect(() => {
    // Check if a job report exists, indicating successful form submission
    // If so, display a success alert and navigate back to the previous screen
    if (jobReport) {
      Alert.alert("✅ Success!", "Job reported successfully", [
        {
          text: "OK",
          onPress: () => {
            router.back(); // Navigate back to the previous screen
          },
        },
      ]);
    }

    return () => {
      // Clean up the job report state when the component is unmounted
      dispatch(resetJobReport());
    };
  }, [jobReport]);

  const createInfoList = (info: Record<string, any>) =>
    Object.entries(info).map(([label, value]) => ({ label, value }));

  const addressInfo = createInfoList({
    Name: address?.addressTitle,
    Address: address?.addressString,
  });

  const systemInfo = createInfoList({
    Name: system?.systemName,
    Type: systemType?.systemType,
    Area: system?.area,
    Tonnage: system?.tonnage,
  });

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

  const formMethods = useForm<any>({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: cleanedSections.reduce(
      (values: Record<string, any>, section) => {
        section?.fields?.forEach((field) => {
          values[field.id] = ""; // Default value for all fields
        });
        return values;
      },
      {}
    ),
  });

  const {
    control,
    register,
    unregister,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = formMethods;

  useEffect(() => {
    // Remove dummy field from sections, because it's not needed in many situations
    const updatedCleanedSections = sectionsWithDummyField.map((section) => ({
      ...section,
      fields: section.fields?.filter((field) => field.id !== 0),
    }));

    setCleanedSections(updatedCleanedSections);

    // Dynamically register all fields when the form is initialized
    if (cleanedSections.length) {
      cleanedSections.forEach((section) => {
        section.fields?.forEach((field) => {
          register(field.id.toString());
        });
      });
    }
  }, [sectionsWithDummyField, register, unregister]);

  const isFieldValid = (field: FormField) =>
    field.required && !watch(field.id.toString());

  /**
   * Scrolls the FlatList to a specific position.
   *
   * @param index - The index of the item to scroll to. If not provided, the FlatList
   *                will scroll to the top (offset 0).
   *
   * - If `index` is defined, the method will scroll to the specified index with animation.
   * - If `index` is undefined, the method will scroll to the top of the list with animation.
   */
  const scrollToPosition = (index?: number) => {
    if (index !== undefined) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    } else {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  /**
   * Validates the tabs and their respective fields for errors.
   *
   * This function checks each tab's fields to determine if there are any validation errors.
   * It updates the `tabsWithError` state to reflect which tabs contain errors. If the currently
   * selected tab has errors, it scrolls to the first invalid field within that tab. If any tab
   * contains errors, it scrolls to the appropriate position and returns `false`. Otherwise, it
   * returns `true` indicating all tabs are valid.
   *
   * @returns {boolean} - Returns `true` if all tabs are valid, otherwise `false`.
   */
  const validateSections = (): boolean => {
    const updatedTabsWithError = cleanedSections.map(
      (section) => section.fields?.some((field) => isFieldValid(field)) || false
    );
    setTabsWithError(updatedTabsWithError);

    if (updatedTabsWithError[selectedTabIndex]) {
      const currentTabFields = cleanedSections[selectedTabIndex]?.fields ?? [];
      const firstErrorFieldIndex = currentTabFields.findIndex((field) =>
        isFieldValid(field)
      );
      scrollToPosition(firstErrorFieldIndex);
      return false;
    }

    if (updatedTabsWithError.some((hasError) => hasError)) {
      scrollToPosition();
      return false;
    }

    return true;
  };

  // Handles Upload image to supabase storage and returns the imageUri just uploaded
  const handleUploadImage = async (
    localUri: string,
    storageDirectory: string
  ): Promise<string> => {
    try {
      // Validate the localUri
      if (!localUri) {
        console.error("Invalid localUri provided for image upload.");
        throw new Error("Invalid localUri. Cannot upload image.");
      }

      // Read the file as a Base64-encoded string using Expo's FileSystem
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Decode the Base64 string to an ArrayBuffer
      const arrayBuffer = decode(base64);

      const fileName = localUri.split("/").pop();
      const storageFilePath = `${appCompany?.id}/${storageDirectory}/${fileName}`;

      const { data: imgData, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storageFilePath, arrayBuffer, {
          upsert: false,
        });

      if (error) {
        console.error("Image upload failed:", error.message);
        throw new Error("Failed to upload image");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(imgData.path);

      return publicUrl || "";
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Image upload failed");
    }
  };

  const submitForm = async () => {
    const newJobReportId = uuidv4();
    await handleSubmit(async (data) => {
      // Include the "Default Info" fields (id === 0)
      const defaultInfoFields = [
        { name: "Address Name", value: address?.addressTitle || "N/A" },
        { name: "Address", value: address?.addressString || "N/A" },
        { name: "System Name", value: system?.systemName || "N/A" },
        { name: "System Type", value: systemType?.systemType || "N/A" },
        { name: "System Area", value: system?.area || "N/A" },
        { name: "System Tonnage", value: system?.tonnage || "N/A" },
      ];

      const formattedSections = await Promise.all(
        cleanedSections.map(async (section) => ({
          sectionName: section.title || "Unnamed Section",
          fields: await Promise.all(
            section.fields?.map(async (field) => {
              // Handle image uploads
              if (field.type === "image") {
                const localURIs = Array.isArray(data[field.id.toString()])
                  ? [...(data[field.id.toString()] as string[])]
                  : [];

                // Upload images to Supabase and get public URIs
                const publicURIs = await Promise.all(
                  localURIs.map((imageUri) =>
                    handleUploadImage(imageUri, newJobReportId)
                  )
                );

                // Replace the current URIs with the uploaded public URIs
                data[field.id.toString()] = publicURIs;
              }

              return {
                name: field.title || "Unnamed Field",
                value: data[field.id.toString()] || "",
              };
            }) || []
          ),
        }))
      );

      if (formattedSections.length > 0) {
        formattedSections[0].fields.unshift(...defaultInfoFields);
      }

      const result = formattedSections;

      if (!address?.clientId || !system.id) {
        Alert.alert(
          "Error",
          "No clientId or systemId found, if problem persists, please contact developer team"
        );
        return;
      }

      const jobReport: JobReport = {
        id: newJobReportId,
        clientId: address.clientId,
        systemId: system.id,
        jobReport: result,
      };

      dispatch(submitJobReport(jobReport));
    })();
  };

  const onSubmit = async () => {
    setIsFormSubmitted(true);

    if (validateSections()) {
      Alert.alert(
        "Confirm Submission",
        "Are you sure you want to submit the form?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Submit",
            onPress: () => {
              submitForm();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Form Error",
        "Form is invalid. Please fix the errors before submitting.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  // Construct app bar option header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ButtonText bold onPress={() => onSubmit()}>
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
  }, [onSubmit, handleClose]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        "Error",
        "An error occurred while submitting the form. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  }, [error]);

  if (systemFormLoading || loading) return <LoadingComponent />;

  return (
    <FormProvider {...formMethods}>
      <FlatList
        data={sectionsWithDummyField[selectedTabIndex]?.fields ?? []}
        ref={flatListRef}
        keyExtractor={(field) => `${field.id}`}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: 15 }}
        ListHeaderComponent={
          <FlatList
            data={sectionsWithDummyField}
            horizontal
            contentContainerStyle={[globalStyles.row, styles.tabsContainer]}
            keyExtractor={(section) => `${section.id}`}
            renderItem={({ item: section, index }) => (
              <TabPill
                isSelected={selectedTabIndex === index}
                onPress={() => setSelectedTabIndex(index)}
                section={section}
                hasError={tabsWithError[index]}
              />
            )}
          />
        }
        renderItem={({ item: formField }) => (
          <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
            {/* Display default information for the "Default Info" tab when the field ID is 0 */}
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
                      isFormSubmitted={isFormSubmitted}
                      controllerField={controllerField}
                      formField={formField}
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

export default JobReportPage;

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 18,
    height: 85,
    gap: 18,
    justifyContent: "flex-start",
  },
});
