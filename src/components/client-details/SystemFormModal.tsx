import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { AddSystemSchema } from "../../constants/ValidationSchemas";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { upsertSystem } from "../../redux/actions/clientDetailsActions";
import { AddSystemFormValues, System } from "../../types/System";
import { CustomDropdown, DropdownOption } from "../Inputs/CustomDropdown";
import Stepper from "../Inputs/Stepper";
import { useSelector } from "react-redux";
import { selectSystemTypes } from "../../redux/selectors/sessionDataSelectors";

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
  const systemNameRef = useRef<TextInputRef | null>(null);
  const systemTypeRef = useRef<TextInputRef | null>(null);
  const areaRef = useRef<TextInputRef | null>(null);
  const [systemTypesOptions, setSystemTypesOptions] = useState<
    DropdownOption[]
  >([]);
  const dispatch = useDispatch();
  const systemTypes = useSelector(selectSystemTypes);

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
    formState: { errors },
  } = formMethods;

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

  useEffect(() => {
    if (systemTypes) {
      const systemTypesOptions: DropdownOption[] = (
        systemTypes ?? []
      ).map(({systemType}) => ({
        value: systemType!,
        label: systemType!,
      }));
      setSystemTypesOptions(systemTypesOptions);
    }
  }, [systemTypes]);

  return (
    <FormProvider {...formMethods} >
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
              value={field.name}
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
