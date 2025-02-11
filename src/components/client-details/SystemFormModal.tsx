import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { AddSystemSchema } from "../../constants/ValidationSchemas";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { upsertSystem } from "../../redux/actions/clientDetailsActions";
import { AddSystemFormValues, System } from "../../types/System";
import { CustomDropdown, DropdownOption } from "../Inputs/CustomDropdown";
import { selectAppCompanyAndUser } from "../../redux/selectors/sessionDataSelectors";
import Stepper from "../Inputs/Stepper";

export const ADD_NEW_SYSTEM = "Add New System";

type Props = {
  addressId?: number;
  system?: System | null;
} & FormModalProps;

const SystemFormModal = ({
  visible = false,
  onNegative,
  onPositive,
  addressId,
  system,
  onRequestClose,
}: Props) => {
  const { appCompany } = useSelector(selectAppCompanyAndUser);
  const systemNameRef = useRef<TextInputRef | null>(null);
  const systemTypeRef = useRef<TextInputRef | null>(null);
  const areaRef = useRef<TextInputRef | null>(null);
  const [systemTypesOptions, setSystemTypesOptions] = useState<
    DropdownOption[]
  >([]);
  const dispatch = useDispatch();

  const formMethods = useForm<AddSystemFormValues>({
    resolver: yupResolver<any>(AddSystemSchema),
    defaultValues: {
      systemName: "",
      systemType: "",
      area: "",
      tonnage: 0,
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = formMethods

  useEffect(() => {
    if (appCompany) {
      const systemTypes: DropdownOption[] = (appCompany.systemTypes ?? []).map(
        (system) => ({
          value: system,
          label: system,
        })
      );
      setSystemTypesOptions(systemTypes);
    }
  }, [appCompany]);

  const onSubmit = (values: AddSystemFormValues) => {
    if (system?.addressId && system.id) {
      dispatch(
        upsertSystem({
          values,
          addressId: system.addressId,
          systemId: system.id,
        })
      );
    } else if (addressId) {
      dispatch(upsertSystem({ values, addressId }));
    }
    onPositive?.();
  };

  const handleOnShow = () => {
    if (system?.id) {
      reset({
        systemName: system.systemName ?? "",
        systemType: system.systemType ?? "",
        area: system.area ?? "",
        tonnage: system.tonnage ?? 0,
      });
    } else {
      reset();
    }
  };

  return (
    <FormProvider {...formMethods}>
      <FormModal
        key={"form-modal-system"}
        title={!system ? "Add New System" : "Edit System"}
        visible={visible}
        onNegative={onNegative}
        onPositive={handleSubmit(onSubmit)}
        onRequestClose={onRequestClose}
        onDismiss={reset}
        onShow={handleOnShow}
      >
        <Controller
          control={control}
          name="systemName"
          render={({ field }) => (
            <CustomTextInput
              ref={systemNameRef}
              value={field.value}
              inlineErrorMessage={errors.systemName?.message}
              placeholder="System Name"
              onChangeText={field.onChange}
              returnKeyType="next"
              onSubmitEditing={() => systemTypeRef.current?.focusInput()}
            />
          )}
        />

        <Controller
          control={control}
          name="systemType"
          render={({ field }) => (
            <CustomDropdown
              name={field.name}
              inlineErrorMessage={errors.systemType?.message}
              options={systemTypesOptions}
              placeholder="Select System Type"
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="area"
          render={({ field }) => (
            <CustomTextInput
              ref={areaRef}
              value={field.value}
              inlineErrorMessage={errors.area?.message}
              placeholder="Area"
              onChangeText={field.onChange}
              returnKeyType="next"
              onSubmitEditing={() => systemTypeRef.current?.focusInput()}
            />
          )}
        />

        <Controller
          control={control}
          name="tonnage"
          render={({ field }) => (
            <Stepper
              initialValue={field.value}
              label="Tonnage"
              onChangeText={field.onChange}
            />
          )}
        />
      </FormModal>
    </FormProvider>
  );
};

export default SystemFormModal;
