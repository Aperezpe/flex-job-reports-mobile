import { Alert, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
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
  selectCompanyConfig,
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
  fetchJobReport,
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
import CloseButton from "../../../../../components/CloseButton";
import { formatDate } from "../../../../../utils/date";
import { useSupabaseAuth } from "../../../../../context/SupabaseAuthContext";
import { callGemini } from "../../../../../config/geminiService";

const JobReportPage = () => {
  const params = useLocalSearchParams();
  const { session } = useSupabaseAuth();
  const systemId = parseInt(params.systemId as string);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { system, address } = useSelector((state: RootState) =>
    selectSystemAndAddressBySystemId(state, systemId)
  );
  const error = useSelector(selectJobReportError);
  const jobReport = useSelector(selectJobReport);
  const systemType: SystemType | null = useSelector((state: RootState) =>
    selectSystemTypeById(state, system?.systemTypeId)
  );
  const systemFormLoading = useSelector(selectSystemFormLoading);
  const jobReportloading = useSelector(selectJobReportLoading);
  const {
    schema: { sections: sectionsWithDummyField },
  } = useSelector(selectSystemForm);
  // Sections without the dummy field (id === 0), used for rendering default info
  const [cleanedSections, setCleanedSections] = useState<FormSection[]>([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [tabsWithError, setTabsWithError] = useState<boolean[]>(
    Array.from({ length: sectionsWithDummyField.length }, () => false)
  );
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const flatListRef = useRef<FlatList<FormField>>(null);
  const { appCompany } = useSelector(selectAppCompanyAndUser);
  const companyConfig = useSelector(selectCompanyConfig);

  // The jobReportId and viewOnly parameters are passed only from the reports history.
  // They are used exclusively for fetching and displaying an existing report.
  const jobReportId = params.jobReportId as string;
  const viewOnly = (params.viewOnly as string) === "true";

  useEffect(() => {
    if (jobReportId) {
      dispatch(fetchJobReport(jobReportId));
    }

    if (systemType?.id) dispatch(fetchForm(systemType.id));
  }, [systemType]);

  useEffect(() => {
    // Check if a job report exists, indicating successful form submission
    // If so, display a success alert and navigate back to the previous screen
    if (jobReport && !viewOnly) {
      Alert.alert("✅ Success!", "Job reported successfully", [
        {
          text: "OK",
          onPress: () => {
            router.back(); // Navigate back to the previous screen
          },
        },
      ]);
    }
  }, [jobReport]);

  useEffect(() => {
    return () => {
      // Clean up the job report state when the component is unmounted
      dispatch(resetJobReport());
    };
  }, []);

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
    if (isDirty && !viewOnly) {
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
    setValue,
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
        section.fields?.forEach((field) =>
          register(field.id.toString(), {
            valueAsDate: field.type === "date",
          })
        );
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
  const getStoragePath = async (
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

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storageFilePath, arrayBuffer, {
          upsert: false,
        });

      if (error) {
        console.error("Image upload failed:", error.message);
        throw new Error("Failed to upload image");
      }

      return storageFilePath || "";
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Image upload failed");
    }
  };

  const handleImageUploads = async ({
    data,
    field,
    newJobReportId,
  }: {
    data: any;
    field: FormField;
    newJobReportId: string;
  }) => {
    const localURIs = Array.isArray(data[field.id.toString()])
      ? [...(data[field.id.toString()] as string[])]
      : [];

    // Upload images to Supabase and get public URIs
    const imagePaths = await Promise.all(
      localURIs.map((imageUri) => getStoragePath(imageUri, newJobReportId))
    );

    // Replace the current URIs with the uploaded public URIs
    data[field.id.toString()] = imagePaths;
  };

  const summarizeJobReportWithAI = async (
    jobReportJson: Record<string, any>
  ) => {
    const prompt = `Create a short paragraph of about 2-5 lines summarizing the highlights of the job report:\n\n${JSON.stringify(
      jobReportJson,
      null,
      2
    )}`;

    try {
      const summary = await callGemini(prompt);
      console.log("Summary:", summary);
      return summary;
    } catch (err) {
      console.error("Error generating summary:", err);
      return "Failed to generate summary.";
    }
  };

  const formatJobReportToHtml = (
    report: Record<string, any>,
    summary: string | null = null
  ): string => {
    const sectionToHtml = (section: any) => {
      const rows = section.fields
        .map((field: any) => {
          let value = field.value;

          // Format dates
          if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
          ) {
            value = formatDate(new Date(value));
          }

          // Handle image arrays
          if (Array.isArray(value)) {
            value = value
              .map(
                (url) =>
                  `<img src="${url}" style="max-width: 300px; border-radius: 6px; margin: 10px 0;" />`
              )
              .join("");
          }

          return `
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #ccc; background-color: #f9f9f9;">
              <strong>${field.name}</strong>
            </td>
            <td style="padding: 8px 12px; border: 1px solid #ccc;">${value}</td>
          </tr>
        `;
        })
        .join("");

      return `
        <h2 style="font-family: sans-serif; margin-top: 40px; color: #333;">${section.sectionName}</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-family: sans-serif; font-size: 14px;">
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    };

    const bodyContent = report.map(sectionToHtml).join("");

    const smartSummary = !summary
      ? ""
      : `
      <div style="background-color: #eef6fb; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin-bottom: 30px;">
        <h3 style="margin-top: 0; margin-bottom: 8px;">🔍 Summary</h3>
        <p style="margin: 0; line-height: 1.6;">${summary}</p>
      </div>
    `;

    return `
      <html>
        <body style="font-family: sans-serif; padding: 24px; background-color: #f4f4f4; color: #222;">
          <div style="max-width: 800px; margin: auto; background: #fff; padding: 32px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
            <h1 style="font-size: 24px; margin-bottom: 20px;">📋 Job Report</h1>
            ${smartSummary}
            ${bodyContent}
          </div>
        </body>
      </html>
    `;
  };

  const sendJobReportEmail = async (
    reportJson: Record<string, any>,
    to: string[]
  ) => {
    const smartSummary = companyConfig?.smartEmailSummaryEnabled
      ? await summarizeJobReportWithAI(reportJson)
      : null;

    const html = formatJobReportToHtml(reportJson, smartSummary);

    const res = await fetch(
      "https://tlkohijqrldabcgwupik.supabase.co/functions/v1/send-job-report-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          to,
          subject: "New Job Report Submitted",
          html,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        `Failed to send email: ${data.error || JSON.stringify(data)}`
      );
    }

    return data;
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
                await handleImageUploads({
                  data,
                  field,
                  newJobReportId,
                });
              } else if (field.type === "date") {
                // Convert date fields to ISO string format, so that it can be serialized
                data[field.id.toString()] = data[field.id.toString()]
                  ? new Date(data[field.id.toString()]).toISOString()
                  : "";
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

      const newJobReport: JobReport = {
        id: newJobReportId,
        clientId: address.clientId,
        systemId: system.id,
        jobReport: result,
      };

      if (companyConfig?.jobReportEmailsEnabled) {
        const emails = companyConfig?.jobReportEmails || [];

        try {
          await sendJobReportEmail(newJobReport.jobReport, emails);
          Alert.alert("Success", "Job report emailed successfully!");
        } catch (err) {
          Alert.alert("Error sending email!", (err as Error).message);
        }

        dispatch(submitJobReport(newJobReport));
      } else {
        dispatch(submitJobReport(newJobReport));
      }
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
      headerRight: () =>
        !viewOnly ? (
          <ButtonText bold onPress={() => onSubmit()}>
            Submit
          </ButtonText>
        ) : (
          <ButtonText bold onPress={() => {}}>
            Edit
          </ButtonText>
        ),
      headerLeft: () => <CloseButton onPress={handleClose} />,
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

  if (systemFormLoading || jobReportloading) return <LoadingComponent />;

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
                      viewOnlyValue={
                        jobReport?.jobReport?.[selectedTabIndex]?.fields?.find(
                          (field: any) => field.name === formField.title
                        )?.value
                      }
                      value={watch(formField.id.toString())}
                      setValue={setValue}
                      isFormSubmitted={isFormSubmitted}
                      controllerField={controllerField}
                      formField={formField}
                      disabled={viewOnly}
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
