import React, { useEffect } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { AppColors } from "../../../../constants/AppColors";
import { Divider } from "@rneui/base";
import { useDispatch, useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";
import { CustomTextInput } from "../../../../components/Inputs/CustomInput";
import { globalStyles } from "../../../../constants/GlobalStyles";
import { useForm, FormProvider, Controller } from "react-hook-form";
import ButtonText from "../../../../components/ButtonText";
import { useNavigation } from "expo-router";
import { setCompanyConfig } from "../../../../redux/actions/sessionDataActions";
import {
  Company,
  CompanyConfig,
  CompanyConfigForm,
} from "../../../../types/Company";
import { yupResolver } from "@hookform/resolvers/yup";
import { CompanyConfigSchema } from "../../../../constants/ValidationSchemas";

const Configuration = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { appCompany } = useSelector(selectAppCompanyAndUser);

  const formMethods = useForm<CompanyConfigForm>({
    resolver: yupResolver<any>(CompanyConfigSchema), // Replace with your validation schema if needed
    defaultValues: {
      jobReportEmailEnabled: appCompany?.config?.jobReportEmailEnabled || false,
      jobReportEmail: appCompany?.config?.jobReportEmail || "",
      smartSummariesEnabled:
        appCompany?.config?.smartEmailSummaryEnabled || false,
    },
  });

  const {
    handleSubmit,
    watch,
    control,
    formState: { errors, isDirty },
  } = formMethods;

  const jobReportEmailsEnabled = watch("jobReportEmailEnabled");

  const onSubmit = (data: CompanyConfigForm) => {
    const updatedConfig: CompanyConfig = {
      ...appCompany?.config,
      jobReportEmailEnabled: data.jobReportEmailEnabled,
      jobReportEmail: data.jobReportEmail.trim(),
      smartEmailSummaryEnabled: data.smartSummariesEnabled,
    };

    const updatedCompany: Company = {
      ...appCompany,
      config: updatedConfig,
    };

    dispatch(setCompanyConfig(updatedCompany));
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isDirty ? (
          <ButtonText bold onPress={handleSubmit(onSubmit)}>
            Submit
          </ButtonText>
        ) : null,
    });
  }, [navigation, handleSubmit, onSubmit, dispatch]);

  return (
    <FormProvider {...formMethods}>
      <ScrollView style={styles.container}>
        {/* Enable Job Report Emails */}
        <View style={[globalStyles.row, styles.tile]}>
          <Text style={globalStyles.textBold}>Enable job report email</Text>
          <Controller
            control={control}
            name="jobReportEmailEnabled"
            render={({ field }) => (
              <Switch value={field.value} onValueChange={field.onChange} />
            )}
          />
        </View>
        {jobReportEmailsEnabled && (
          <Controller
            control={control}
            name="jobReportEmail"
            render={({ field }) => (
              <CustomTextInput
                value={field.value}
                onChangeText={field.onChange}
                inlineErrorMessage={errors.jobReportEmail?.message}
                placeholder="e.g. jhon@email.com"
                inputWrapperStyle={styles.input}
              />
            )}
          />
        )}

        <Divider style={styles.divider} />

        {/* Enable Smart Summaries */}
        <View style={[globalStyles.row, styles.tile]}>
          <Text style={globalStyles.textBold}>Enable Smart Summaries</Text>
          <Controller
            control={control}
            name="smartSummariesEnabled"
            render={({ field }) => (
              <Switch value={field.value} onValueChange={field.onChange} />
            )}
          />
        </View>
        <Divider style={styles.divider} />
      </ScrollView>
    </FormProvider>
  );
};

export default Configuration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: AppColors.whitePrimary,
  },
  tile: {
    marginVertical: 10,
  },
  subText: {
    color: AppColors.primaryDarkGray,
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    marginTop: 10,
  },
  divider: {
    marginVertical: 10,
  },
});
