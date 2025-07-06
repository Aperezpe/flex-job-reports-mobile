import { StyleSheet, Text } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import InfoSection, { InfoText } from "../../../../../components/InfoSection";
import { useSelector } from "react-redux";
import { selectClientDetails } from "../../../../../redux/selectors/clientDetailsSelector";
import {
  selectAllSystemTypes,
  selectAppCompanyAndUser,
} from "../../../../../redux/selectors/sessionDataSelectors";
import { ScrollView } from "react-native-gesture-handler";
import { CustomDatePicker } from "../../../../../components/Inputs/CustomDatePicker";
import { Controller, FormProvider, useForm } from "react-hook-form";
import CustomButton from "../../../../../components/CustomButton";
import { AppColors } from "../../../../../constants/AppColors";
import { useDispatch } from "react-redux";
import { updateTicketInProgress } from "../../../../../redux/actions/jobReportActions";
import { convertDateToISO } from "../../../../../utils/jobReportUtils";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { System } from "../../../../../types/System";

const StartTicketModal = () => {
  const { addressId, systemIds: systemIdsString } = useLocalSearchParams();
  const client = useSelector(selectClientDetails);
  const router = useRouter();
  const dispatch = useDispatch();
  const address = client?.addresses?.find(
    (address) => address.id === parseInt(addressId as string)
  );
  const systemIds = (systemIdsString as string)
    .split(",")
    .map((id) => parseInt(id));

  const systemsInTicket = systemIds.map((systemId) => 
    address?.systems?.find((sys) => sys.id === systemId)
  ).filter(Boolean) as System[];

  const systemTypes = useSelector(selectAllSystemTypes);
  const { appUser } = useSelector(selectAppCompanyAndUser);

  const formMethods = useForm<{ ticketDate: Date }>({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      ticketDate: new Date(),
    },
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const clientInfo: InfoText[] = [
    {
      label: "Name",
      value: client?.clientName,
    },
    {
      label: "Address",
      value: address?.addressString,
    },
  ];

  const systemsInfo: InfoText[][] = [
    ...(systemIds?.map((id) => {
      const system = systemsInTicket?.find((sys) => sys.id === id);
      return [
        {
          label: "Area",
          value: system?.area,
        },
        {
          label: "Type",
          value: systemTypes.find(
            (systemType) => systemType.id === system?.systemTypeId
          )?.systemType,
        },
        {
          label: "Tonnage",
          value: system?.tonnage,
        },
      ] as InfoText[];
    }) ?? []),
  ];

  const technicianInfo: InfoText[] = [
    {
      label: "Technician",
      value: appUser?.fullName,
    },
  ];

  const onStart = (data: { ticketDate: Date }) => {
    dispatch(
      updateTicketInProgress({
        ticket: {
          id: uuidv4(),
          ticketDate: convertDateToISO(data.ticketDate),
          clientId: client?.id,
        },
        address,
        systems: systemsInTicket,
        jobReports: [],
        systemIds,
      })
    );
    const systemId = systemIds?.[0];
    if (!systemId) return;

    router.push({
      pathname: `modal/report`,
      params: {
        systemId,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <InfoSection title="Client" infoList={clientInfo} />
      <Text style={[globalStyles.textBold, styles.systemsTitle]}>
        System(s)
      </Text>
      {systemsInfo.map((systemInfo, index) => (
        <InfoSection key={index} infoList={systemInfo} />
      ))}
      <InfoSection title="Technician" infoList={technicianInfo} />
      <Text style={[globalStyles.textBold, styles.systemsTitle]}>
        Ticket Date
      </Text>

      <FormProvider {...formMethods}>
        <Controller
          control={control}
          name="ticketDate"
          render={({ field }) => (
            <CustomDatePicker
              fieldName={field.name}
              setValue={setValue}
              value={field.value}
              initialValue={new Date()}
              onChange={field.onChange}
              inlineErrorMessage={errors.ticketDate?.message}
              placeholder="Select a Date"
              inputContainerStyle={{ marginTop: -5 }}
            />
          )}
        ></Controller>
      </FormProvider>

      <CustomButton
        buttonContainerStyle={[styles.containerButton, styles.startButton]}
        buttonTextStyle={styles.startButton}
        onPress={handleSubmit(onStart)}
      >
        Start
      </CustomButton>
    </ScrollView>
  );
};

export default StartTicketModal;

const styles = StyleSheet.create({
  container: {
    padding: 25,
  },
  systemsTitle: {
    marginBottom: -7,
  },
  contentContainer: {
    gap: 20,
    paddingBottom: 50,
  },
  containerButton: {
    marginTop: 15,
  },
  startButton: {
    backgroundColor: AppColors.bluePrimary,
    color: AppColors.whitePrimary,
    fontSize: 18,
    padding: 2,
  },
});
