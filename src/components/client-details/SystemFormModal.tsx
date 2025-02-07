import React, { useEffect, useRef, useState } from "react";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { Formik } from "formik";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { AddSystemSchema } from "../../constants/ValidationSchemas";
import { useDispatch } from "react-redux";
import { upsertSystem } from "../../redux/actions/clientDetailsActions";
import { AddSystemFormValues, System } from "../../types/System";
import { CustomDropdown, DropdownOption } from "../Inputs/CustomDropdown";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../redux/selectors/sessionDataSelectors";
import Stepper from "../Inputs/Stepper";

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
  const [systemTypesOptions, setSystemTypesOptions] =
    useState<DropdownOption[]>();
  const dispatch = useDispatch();

  const onSubmit = (values: AddSystemFormValues) => {
    if (system?.addressId && system.id)
      dispatch(
        upsertSystem({
          values,
          addressId: system?.addressId,
          systemId: system?.id,
        })
      );
    else if (addressId) dispatch(upsertSystem({ values, addressId }));
    onPositive?.();
  };

  useEffect(() => {
    if (appCompany) {
      const systemTypes: DropdownOption[] = [];
      for (const system of appCompany.systemTypes ?? []) {
        systemTypes.push({
          value: system,
          label: system,
        });
      }
      setSystemTypesOptions(systemTypes);
    }
  }, []);

  return (
    <Formik
      initialValues={{
        systemName: "",
        systemType: "",
        area: "",
        tonnage: 0,
      }}
      onSubmit={onSubmit}
      validationSchema={AddSystemSchema}
      validateOnChange={false}
    >
      {({
        handleChange,
        handleSubmit,
        values,
        errors,
        resetForm,
        setValues,
      }) => {
        const handleOnShow = () => {
          if (system?.id)
            setValues(
              {
                systemName: system.systemName ?? "",
                systemType: system.systemType ?? "",
                area: system.area ?? "",
                tonnage: system.tonnage ?? 0,
              },
              false
            );
          else resetForm();
        };
        return (
          <FormModal
            key={"form-modal-system"}
            title={!system ? "Add New System" : "Edit System"}
            visible={visible}
            onNegative={onNegative}
            onPositive={handleSubmit}
            onRequestClose={onRequestClose}
            onDismiss={resetForm}
            onShow={handleOnShow}
          >
            <CustomTextInput
              ref={systemNameRef}
              value={values.systemName}
              inlineErrorMessage={errors.systemName}
              placeholder="System Name"
              onChangeText={handleChange("systemName")}
              returnKeyType="next"
              onSubmitEditing={() => systemTypeRef.current?.focusInput()}
            />
            <CustomDropdown
              value={values.systemType}
              inlineErrorMessage={errors.systemType}
              placeholder="System Type"
              options={systemTypesOptions ?? []}
              onDone={handleChange("systemType")}
            />
            <CustomTextInput
              ref={areaRef}
              value={values.area}
              inlineErrorMessage={errors.area}
              placeholder="Area"
              onChangeText={handleChange("area")}
              returnKeyType="next"
              onSubmitEditing={() => systemTypeRef.current?.focusInput()}
            />
            <Stepper
              initialValue={values.tonnage}
              label="Tonnage"
              onChangeText={handleChange("tonnage")}
            />
          </FormModal>
        );
      }}
    </Formik>
  );
};

export default SystemFormModal;
