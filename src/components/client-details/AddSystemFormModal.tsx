import { View } from "react-native";
import React, { useRef } from "react";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { Formik } from "formik";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { AddAddressSchema, AddSystemSchema } from "../../constants/ValidationSchemas";
import { globalStyles } from "../../constants/GlobalStyles";
import { useDispatch } from "react-redux";
import { upsertAddress, addSystem } from "../../redux/actions/clientDetailsActions";
import { AddAddressFormValues } from "../../types/Address";
import { AddSystemFormValues } from "../../types/System";

type Props = {
  addressId: number,
} & FormModalProps;

const AddSystemFormModal = ({
  visible = false,
  onNegative,
  onPositive,
  addressId,
  onRequestClose,
  onDismiss
}: Props) => {
  const systemNameRef = useRef<TextInputRef | null>(null);
  const systemTypeRef = useRef<TextInputRef | null>(null);
  const area = useRef<TextInputRef | null>(null);
  const tonnage = useRef<TextInputRef | null>(null);
  // const { addAddress, loading } = useClients();
  const dispatch = useDispatch();

  const onSubmit = (values: AddSystemFormValues) => {
    dispatch(addSystem({ values, addressId }));
    onPositive?.();
  };

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
            <CustomTextInput 
              ref={systemTypeRef}
              value={values.systemType}
              inlineErrorMessage={errors.systemType}
              placeholder="System Type"
            />
          </FormModal>
        );
      }}
    </Formik>
  );
};

export default AddSystemFormModal;
