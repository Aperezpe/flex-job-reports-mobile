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
import {
  selectVisibleSystemTypes,
} from "../../redux/selectors/sessionDataSelectors";

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
  const areaRef = useRef<TextInputRef | null>(null);
  const [systemTypesOptions, setSystemTypesOptions] = useState<
    DropdownOption[]
  >([]);
  const dispatch = useDispatch();
  const visibleSystemTypes = useSelector(selectVisibleSystemTypes);

  const formMethods = useForm<AddSystemFormValues>({
    resolver: yupResolver<any>(AddSystemSchema),
    defaultValues: {
      systemTypeId: null,
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
      // find system Type Id and send it to upsert System
      dispatch(
        upsertSystem({
          values,
          addressId: system.addressId,
          systemId: system.id,
        })
      );
    } else if (addressId) {
      dispatch(
        upsertSystem({
          values,
          addressId,
        })
      );
    }
    onPositive?.();
  };

  const handleOnShow = () => {
    if (system?.id) {
      reset({
        systemTypeId: system.systemTypeId ?? null,
        area: system.area ?? "",
        tonnage: system.tonnage ?? 0,
      });
    } else {
      reset();
    }
  };

  useEffect(() => {
    if (visibleSystemTypes) {
      const systemTypesOptions: DropdownOption[] = (
        visibleSystemTypes ?? []
      ).map(({ systemType, id }) => ({
        label: systemType!,
        value: id,
      }));
      setSystemTypesOptions(systemTypesOptions);
    }
  }, [visibleSystemTypes]);

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
          name="systemTypeId"
          render={({ field }) => (
            <CustomDropdown
              fieldName={field.name} // system Type Id will be passed here
              initialValue={system?.systemTypeId ?? null}
              onChange={field.onChange}
              options={systemTypesOptions}
              inlineErrorMessage={errors.systemTypeId?.message}
              placeholder="Select System Type"
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
