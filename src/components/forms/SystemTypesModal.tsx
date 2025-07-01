import React, { useEffect } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { CustomTextInput } from "../Inputs/CustomInput";
import { AddSystemTypeSchema } from "../../constants/ValidationSchemas";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { AddSystemTypeForm } from "../../types/SystemType";
import { makeStyles } from "@rneui/themed";
import { globalConsts } from "../../constants/GlobalConsts";
import { upsertSystemType } from "../../redux/actions/sessionDataActions";
import { useSelector } from "react-redux";
import {
  selectVisibleSystemTypes,
} from "../../redux/selectors/sessionDataSelectors";

type Props = {
  systemTypeId: number | null;
} & FormModalProps;

const SystemTypesModal = ({
  visible = false,
  onNegative,
  onPositive,
  systemTypeId,
}: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const systemTypes = useSelector(selectVisibleSystemTypes);

  const formMethods = useForm<AddSystemTypeForm>({
    resolver: yupResolver<any>(AddSystemTypeSchema),
    defaultValues: {
      systemType: "",
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const onSubmit = (values: AddSystemTypeForm) => {
    dispatch(upsertSystemType({ values, systemTypeId }));
    onPositive?.();
  };

  useEffect(() => {
    if (systemTypeId) {
      const systemType = systemTypes?.find(
        (systemType) => systemType.id === systemTypeId
      )?.systemType;
      reset({
        systemType,
      });
    } else {
      reset({
        systemType: ""
      })
    }
  }, [systemTypeId]);

  return (
    <FormProvider {...formMethods}>
      <FormModal
        key={"form-modal-system-types"}
        title={"New System Type"}
        visible={visible}
        onNegative={onNegative}
        onPositive={handleSubmit(onSubmit)}
        onDismiss={reset}
        modalViewStyles={styles.modalViewStyles}
      >
        <Controller
          control={control}
          name="systemType"
          render={({ field }) => (
            <CustomTextInput
              inputWrapperStyle={{ flexGrow: 0 }}
              value={field.value}
              inlineErrorMessage={errors.systemType?.message}
              placeholder="System Type"
              onChangeText={field.onChange}
              returnKeyType="done"
            />
          )}
        />
      </FormModal>
    </FormProvider>
  );
};

export default SystemTypesModal;

const useStyles = makeStyles(() => ({
  modalViewStyles: {
    borderBottomRightRadius: globalConsts.MODAL_BORDER_RADIUS,
    borderBottomLeftRadius: globalConsts.MODAL_BORDER_RADIUS,
  },
}));
