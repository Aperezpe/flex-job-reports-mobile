import { Alert, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { Controller, FormProvider, useForm } from "react-hook-form";
import "react-native-get-random-values";
import { RootState } from "../redux/store";
import {
  selectClientDetails,
  selectSystemAndAddressBySystemId,
} from "../redux/selectors/clientDetailsSelector";
import {
  selectJobReport,
  selectJobReportLoading,
  selectTicketError,
  selectTicketInProgress,
} from "../redux/selectors/jobReportSelector";
import { SystemType } from "../types/SystemType";
import {
  selectAppCompanyAndUser,
  selectCompanyConfig,
  selectSystemTypeById,
} from "../redux/selectors/sessionDataSelectors";
import {
  selectSystemForm,
  selectSystemFormLoading,
} from "../redux/selectors/systemFormSelector";
import { FormField, FormSection } from "../types/SystemForm";
import {
  fetchJobReport,
  submitTicket,
  updateTicketInProgress,
} from "../redux/actions/jobReportActions";
import { fetchForm } from "../redux/actions/systemFormActions";
import { ListContent } from "../types/FieldEdit";
import { OTHER_OPTION_KEY } from "./Inputs/Checkboxes";
import { AppError } from "../types/Errors";
import {
  getUpdatedTicketInProgress,
  isLocalFileUri,
  sendJobReportEmail,
} from "../utils/jobReportUtils";
import ButtonText from "./ButtonText";
import BackButton from "./BackButton";
import { AppColors } from "../constants/AppColors";
import LoadingComponent from "./LoadingComponent";
import { globalStyles } from "../constants/GlobalStyles";
import TabPill from "./forms/TabPill";
import DefaultReportInfo from "./shared/DefaultReportInfo";
import DynamicField from "./clients/report/DynamicField";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import LoadingOverlay from "./LoadingOverlay";
import { TicketData } from "../types/Ticket";
import { ReportData, ReportField } from "../types/JobReport";
import { getStoragePath } from "../utils/supabaseUtils";
import CloseButton from "./CloseButton";
import { useSupabaseAuth } from "../context/SupabaseAuthContext";

const JobReportPage = ({
  jobReportId: propJobReportId,
  systemId: propSystemId,
  viewOnly: propViewOnly,
}: {
  jobReportId?: string;
  systemId: number;
  viewOnly?: boolean;
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const router = useRouter();

  // The jobReportId and viewOnly parameters are passed only from the reports history.
  // They are used exclusively for fetching and displaying an existing report.
  const jobReportId = propJobReportId;
  const systemId = propSystemId;
  const viewOnly = propViewOnly;
  const { session } = useSupabaseAuth();
  const { headerLeftType } = useLocalSearchParams();

  const { system, address } = useSelector((state: RootState) =>
    selectSystemAndAddressBySystemId(state, systemId)
  );
  const client = useSelector(selectClientDetails);
  const ticketError = useSelector(selectTicketError);
  const jobReport = useSelector(selectJobReport);
  const systemType: SystemType | null = useSelector((state: RootState) =>
    selectSystemTypeById(state, system?.systemTypeId)
  );
  const systemFormLoading = useSelector(selectSystemFormLoading);
  const companyConfig = useSelector(selectCompanyConfig);
  const jobReportloading = useSelector(selectJobReportLoading);
  const [submitInProgress, setSubmitInProgress] = useState<boolean>(false);
  const {
    schema: { sections: sectionsWithDummyField },
  } = useSelector(selectSystemForm);
  // Sections without the dummy field (id === 0), which is used for rendering default info
  const [cleanedSections, setCleanedSections] = useState<FormSection[]>([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [tabsWithError, setTabsWithError] = useState<boolean[]>(
    Array.from({ length: sectionsWithDummyField.length }, () => false)
  );
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const flatListRef = useRef<FlatList<FormField>>(null);
  const { appCompany, appUser } = useSelector(selectAppCompanyAndUser);
  const ticketInProgress = useSelector(selectTicketInProgress);
  const currentSystemIndex =
    ticketInProgress?.systemIds?.findIndex((id) => id === system?.id) ?? -1;
  const jobReportInProgress = ticketInProgress?.jobReports[currentSystemIndex];

  useFocusEffect(
    useCallback(() => {
      if (jobReportId) {
        dispatch(fetchJobReport(jobReportId));
      }

      if (systemType?.id) {
        dispatch(fetchForm(systemType?.id));
      }
    }, [
      systemType,
      system,
      jobReportId,
      jobReportInProgress,
      ticketInProgress,
      currentSystemIndex,
    ])
  );

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
          values[field.id] = "";
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
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = formMethods;

  // Detect previous system type form match, and prompt for autofill
  useEffect(() => {
    if (!viewOnly) {
      const previousSystems =
        ticketInProgress?.systems?.slice(0, currentSystemIndex) ?? [];
      const previousSystemTypesIds =
        previousSystems.flatMap((prevSystem) => prevSystem.systemTypeId) ?? [];

      if (
        previousSystemTypesIds?.length &&
        systemType?.id &&
        previousSystemTypesIds.includes(systemType.id)
      ) {
        const previousMatchingIndex = previousSystemTypesIds.findIndex(
          (prevSystemTypeId) => prevSystemTypeId === systemType.id
        );

        const previousReportData: ReportData[] =
          ticketInProgress?.jobReports[previousMatchingIndex].reportData ?? [];

        // Wait for the form to show up, then show the Autofill alert
        setTimeout(() => {
          Alert.alert(
            "Auto fill?",
            "Same system type identified in ticket. Do you want to auto fill?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Confirm",
                isPreferred: true,
                onPress: () => {
                  const allFormFields = previousReportData?.flatMap(
                    (sectionWithFields) => sectionWithFields?.fields ?? []
                  );
                  const filledUpFields: Record<string, any> = {};

                  allFormFields.forEach((field) => {
                    if (field?.id) {
                      filledUpFields[field.id] = field.value;
                    }
                  });
                  reset(filledUpFields);
                },
              },
            ]
          );
        }, 500);
      }
    }
  }, []);

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

  /**
   * Determines whether a given form field is invalid based on its type, value, and required status.
   *
   * Validation logic by field type:
   * - For required fields:
   *   - "multipleChoiceGrid" or "checkboxGrid": Returns `true` if the field value is falsy,
   *     or if the grid's rows or columns are missing or empty.
   *   - "checkboxes": Returns `true` if no options are selected, or if the only selected option is "Other"
   *     and its value is empty.
   *   - All other types: Returns `true` if the field value is falsy (empty).
   * - For non-required fields: Always returns `false`.
   *
   * @param field - The form field to validate.
   * @returns `true` if the field is invalid according to its type and required status, otherwise `false`.
   */
  const isFieldInvalid = (field: FormField) => {
    if (field.required) {
      const fieldValue = watch(field.id.toString());
      if (
        field.type === "multipleChoiceGrid" ||
        field.type === "checkboxGrid"
      ) {
        // Check if exactly one option is selected from each row in the grid
        const { rows, columns } = field.gridContent ?? {};
        return !fieldValue || !rows?.length || !columns?.length;
      } else if (field.type === "checkboxes") {
        // Checkboxes: invalid if no options selected, or if "Other" is selected but left blank
        if (
          !fieldValue ||
          !Array.isArray(fieldValue) ||
          fieldValue.length === 0
        ) {
          return true;
        }
        // If "Other" is selected, ensure its value is not empty
        return fieldValue.some(
          (option: ListContent) =>
            option.key === OTHER_OPTION_KEY && !option.value
        );
      }
      return !fieldValue; // For other field types, check if the value is empty
    }
    return false; // Field is not required, so it's not invalid
  };

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
      (section) =>
        section.fields?.some((field) => isFieldInvalid(field)) || false
    );
    setTabsWithError(updatedTabsWithError);

    // If the currently selected tab has errors, scroll to the first invalid field in that tab
    // Return false to indicate the form is not valid and prevent submission
    if (updatedTabsWithError[selectedTabIndex]) {
      const currentTabFields = cleanedSections[selectedTabIndex]?.fields ?? [];
      const firstErrorFieldIndex = currentTabFields.findIndex((field) =>
        isFieldInvalid(field)
      );
      scrollToPosition(firstErrorFieldIndex);
      return false;
    }

    // If any tab (other than the current one) has errors, scroll to the top of the form
    // Return false to indicate the form is not valid and prevent submission
    if (updatedTabsWithError.some((hasError) => hasError)) {
      scrollToPosition();
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    setIsFormSubmitted(true);

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
            onNextOrSubmit();
          },
        },
      ]
    );
  };

  // Converts any image local uris to Storage Uri, submits the ticket, and returns the submitted ticketData
  const onSubmitTicket = async (
    updatedTicketData: TicketData
  ): Promise<TicketData> => {
    const jobReports = updatedTicketData.jobReports;

    // Update local image uris with uploaded storage uris
    const updatedJobReports = await Promise.all(
      jobReports.map(async (report) => {
        const updatedReportData = await Promise.all(
          (report.reportData ?? []).map(async (data) => {
            const updatedFields = await Promise.all(
              (data.fields ?? []).map(async (field) => {
                if (
                  Array.isArray(field.value) &&
                  field.value.length > 0 &&
                  isLocalFileUri(field.value[0])
                ) {
                  const newUris = await Promise.all(
                    field.value.map((uri: string) => {
                      if (!appCompany?.id || !field?.id)
                        throw new AppError(
                          "Error",
                          "Company id or field id not found. Try again."
                        );

                      return getStoragePath({
                        companyId: appCompany?.id,
                        localUri: uri,
                        jobReportId: report.id,
                        fieldId: field.id,
                      });
                    })
                  );
                  return { ...field, value: newUris };
                }
                return field;
              })
            );
            return { ...data, fields: updatedFields };
          })
        );
        return { ...report, reportData: updatedReportData };
      })
    );

    const updatedTicketToSubmit: TicketData = {
      ...updatedTicketData,
      jobReports: updatedJobReports,
    };

    dispatch(submitTicket(updatedTicketToSubmit));
    return updatedTicketToSubmit;
  };

  const onNextOrSubmit = async () => {
    if (validateSections()) {
      const nextSystemId = ticketInProgress?.systemIds?.at(
        currentSystemIndex + 1
      );

      try {
        setSubmitInProgress(true);

        if (!ticketInProgress)
          throw new AppError(
            "Ticket not intialized correctly",
            "Please try creating another ticket. If problem persist, contact administrator"
          );

        if (!address?.clientId || !system.id) {
          throw new AppError(
            "Missing Data",
            "No clientId or systemId found. Please contact support."
          );
        }

        const updatedTicketInProgress = getUpdatedTicketInProgress({
          cleanedSections,
          system,
          formData: watch(),
          ticketInProgress,
          client,
          technician: appUser,
          companyId: appCompany?.id,
        });

        // If there's still one more report, proceed to next
        if (nextSystemId) {
          dispatch(updateTicketInProgress(updatedTicketInProgress));
          router.push({
            pathname: `modal/report`,
            params: {
              systemId: nextSystemId,
            },
          });
        } else {
          // Submit reports
          // Append technician and company to the ticket
          // 1. Upload Images and replace image uris from each report with new storage uri
          // 2. Submit the ticket
          const submittedTicket = await onSubmitTicket(updatedTicketInProgress);

          // 3. Send email if email is enabled
          // 4. Attach smart summary to email if smart summary is enabled
          if (companyConfig?.jobReportEmailEnabled) {
            const emails = companyConfig?.jobReportEmail || "";

            await sendJobReportEmail(
              submittedTicket,
              emails,
              companyConfig?.smartEmailSummaryEnabled,
              session?.access_token
            );
          }

          Alert.alert("✅ Success!", "Ticket reported successfully!", [
            {
              text: "OK",
              onPress: () => {
                router.replace(`clients/client/${address?.clientId}`); // Navigate back to the previous screen
              },
            },
          ]);
        }
      } catch (e) {
        console.log("Error", JSON.stringify(e));
        if (e instanceof AppError) {
          Alert.alert("Error", e.message);
        } else {
          Alert.alert(
            "Oops!",
            "An unexpected error occurred while processing your request. Please try again."
          );
        }
      } finally {
        setSubmitInProgress(false);
      }
    } else {
      Alert.alert(
        "Form Error",
        "Form is invalid. Please fix the errors before submitting.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  const isThereReportsLeft = (): boolean => {
    const systemIds = ticketInProgress?.systemIds;
    return currentSystemIndex !== (systemIds?.length ?? 0) - 1;
  };
  // Construct app bar option header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (!viewOnly && isThereReportsLeft())
          return (
            <ButtonText bold onPress={onNextOrSubmit}>
              Next
            </ButtonText>
          );
        else if (!viewOnly && !isThereReportsLeft())
          return (
            <ButtonText bold onPress={() => onSubmit()}>
              Submit
            </ButtonText>
          );
        return <></>;
      },
      headerLeft: () =>
        headerLeftType === "close" ? (
          <CloseButton onPress={router.back} />
        ) : (
          <BackButton
            onPress={handleClose}
            color={AppColors.bluePrimary}
            size={32}
            style={{ marginLeft: -10 }}
          />
        ),
      headerShows: false,
      title: !viewOnly ? `Report ${currentSystemIndex + 1}` : "Report",
      animation: "slide_from_right",
    });
  }, [onSubmit, handleClose, isThereReportsLeft]);

  useEffect(() => {
    if (ticketError) {
      console.log("ticketError", ticketError);
      Alert.alert(
        "Error",
        "An error occurred while submitting the form. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  }, [ticketError]);

  const getJobReportValue = (formField: FormField) => {
    if (viewOnly) {
      return jobReport?.reportData?.[selectedTabIndex]?.fields?.find(
        (field: ReportField) => field.id === formField.id
      )?.value;
    } else {
      return watch(formField.id.toString());
    }
  };

  if (systemFormLoading || jobReportloading) return <LoadingComponent />;

  return (
    <View style={{ flex: 1 }}>
      <LoadingOverlay visible={submitInProgress} />

      <KeyboardAwareFlatList
        data={cleanedSections[selectedTabIndex]?.fields ?? []}
        enableOnAndroid
        style={{ flexGrow: 1 }}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ flexGrow: 1 }}
        extraScrollHeight={50}
        ListHeaderComponent={() => (
          <ScrollView
            horizontal
            contentContainerStyle={[globalStyles.row, styles.tabsContainer]}
            showsHorizontalScrollIndicator={false}
          >
            {cleanedSections.map((section, index) => (
              <TabPill
                key={section.id}
                isSelected={selectedTabIndex === index}
                onPress={() => setSelectedTabIndex(index)}
                section={section}
                hasError={tabsWithError[index]}
              />
            ))}
          </ScrollView>
        )}
        renderItem={({ item: formField, index }) => {
          return (
            <FormProvider {...formMethods}>
              <View
                key={formField.id}
                style={{ paddingHorizontal: 20, paddingBottom: 20 }}
              >
                <>
                  {index === 0 && selectedTabIndex === 0 && (
                    <DefaultReportInfo system={system} includeClient={false} />
                  )}
                  <View style={{ height: 18 }} />
                  <Controller
                    control={control}
                    name={formField.id.toString()}
                    render={({ field: controllerField }) => (
                      <DynamicField
                        value={getJobReportValue(formField)}
                        setValue={setValue}
                        isFormSubmitted={isFormSubmitted}
                        controllerField={controllerField}
                        formField={formField}
                        disabled={viewOnly}
                      />
                    )}
                  />
                </>
              </View>
            </FormProvider>
          );
        }}
        ListFooterComponent={() => <View style={{ height: 150 }} />}
      />
    </View>
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
