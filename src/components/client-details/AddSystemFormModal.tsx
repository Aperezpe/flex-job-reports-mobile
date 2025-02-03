import React, { useEffect, useRef, useState } from "react";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { Formik } from "formik";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { AddSystemSchema } from "../../constants/ValidationSchemas";
import { useDispatch } from "react-redux";
import { addSystem } from "../../redux/actions/clientDetailsActions";
import { AddSystemFormValues } from "../../types/System";
import { CustomDropdown, DropdownOption } from "../Inputs/CustomDropdown";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../redux/selectors/sessionDataSelectors";

type Props = {
  addressId: number;
} & FormModalProps;

const AddSystemFormModal = ({
  visible = false,
  onNegative,
  onPositive,
  addressId,
  onRequestClose,
  onDismiss,
}: Props) => {
  const { appCompany } = useSelector(selectAppCompanyAndUser)
  const systemNameRef = useRef<TextInputRef | null>(null);
  const systemTypeRef = useRef<TextInputRef | null>(null);
  const area = useRef<TextInputRef | null>(null);
  const tonnage = useRef<TextInputRef | null>(null);
  const [systemTypesOptions, setSystemTypesOptions] = useState<DropdownOption[]>()
  // const { addAddress, loading } = useClients();
  const dispatch = useDispatch();

  const onSubmit = (values: AddSystemFormValues) => {
    dispatch(addSystem({ values, addressId }));
    onPositive?.();
  };

  useEffect(() => {
    if (appCompany) {
      const systemTypes: DropdownOption[] = []
      for(const system of appCompany.systemTypes ?? []) {
        systemTypes.push({
          value: system,
          label: system
        })
      }
      setSystemTypesOptions(systemTypes);
    }
  }, [])

  return (
    <Formik
      initialValues={{
        systemName: "System 1",
        systemType: "Heat Pump",
        area: "Game room",
        tonnage: "1",
      }}
      onSubmit={onSubmit}
      validationSchema={AddSystemSchema}
    >
      {({ handleChange, handleSubmit, values, errors }) => {
        return (
          <FormModal
            key={"form-modal-system"}
            title={"Add New Address"}
            visible={visible}
            onNegative={onNegative}
            onPositive={handleSubmit}
            onRequestClose={onRequestClose}
            onDismiss={onDismiss}
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
            />
          </FormModal>
        );
      }}
    </Formik>
  );
};

export default AddSystemFormModal;
