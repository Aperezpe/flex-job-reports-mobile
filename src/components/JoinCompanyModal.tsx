import React, { useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormModal, { FormModalProps } from "./clients/FormModal";
import { JoinCompanySchema } from "../constants/ValidationSchemas";
import { CustomTextInput } from "./Inputs/CustomInput";
import { JoinCompanyForm } from "../types/Company";
import { makeStyles } from "@rneui/themed";
import { globalConsts } from "../constants/GlobalConsts";
import { getCompanyUIDApi } from "../api/sessionDataApi";
import { AppError } from "../types/Errors";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import {
  sendJoinCompanyRequest,
} from "../redux/actions/joinRequestActions";
import { fetchUserJoinRequestApi } from "../api/joinRequestApi";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../redux/selectors/sessionDataSelectors";
import { PostgrestError } from "@supabase/supabase-js";

type Props = {} & FormModalProps;

const JoinCompanyModal = ({
  visible = false,
  onNegative,
  onPositive,
}: Props) => {
  const dispatch = useDispatch();
  const { appUser } = useSelector(selectAppCompanyAndUser);
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const formMethods = useForm<JoinCompanyForm>({
    resolver: yupResolver<any>(JoinCompanySchema),
    defaultValues: {
      companyUid: "",
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const onSubmit = async (values: JoinCompanyForm) => {
    try {
      setLoading(true);
      const {
        data: { companyUID },
      } = await getCompanyUIDApi(values.companyUid);

      if (!companyUID)
        throw new AppError(
          "Company ID doesn't exists",
          "Please enter a valid company id"
        );

      const { data, error } = await fetchUserJoinRequestApi(appUser?.id ?? "");

      // data => user has already sent a request
      if (data) {
        throw new AppError(
          `You have already sent a request to ${data.company_uid}`,
          "If you want to send another request, first cancel your request"
        );
      } else if (error && (error as PostgrestError).code !== "PGRST116") {
        throw new AppError(
          "Error fetching user join request",
          "Please try again later"
        );
      }

      dispatch(sendJoinCompanyRequest(values));

      onPositive?.();

    } catch (error: AppError | unknown) {
      if (error instanceof AppError) {
        Alert.alert(error.title, error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <FormModal
        title={"Join Company"}
        visible={visible}
        onNegative={onNegative}
        onPositive={handleSubmit(onSubmit)}
        onDismiss={reset}
        modalViewStyles={styles.modalViewStyles}
        loading={loading}
      >
        <Controller
          control={control}
          name="companyUid"
          render={({ field }) => (
            <CustomTextInput
              inputWrapperStyle={{ flexGrow: 0 }}
              value={field.value}
              inlineErrorMessage={errors.companyUid?.message}
              placeholder="Company ID*"
              autoCapitalize={"none"}
              onChangeText={field.onChange}
              returnKeyType="done"
            />
          )}
        />
      </FormModal>
    </FormProvider>
  );
};

export default JoinCompanyModal;

const useStyles = makeStyles(() => ({
  modalViewStyles: {
    borderBottomRightRadius: globalConsts.MODAL_BORDER_RADIUS,
    borderBottomLeftRadius: globalConsts.MODAL_BORDER_RADIUS,
  },
}));
