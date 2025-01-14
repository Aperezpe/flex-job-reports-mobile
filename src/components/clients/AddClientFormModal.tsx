import { StyleSheet } from "react-native";
import React, { useRef, useState } from "react";
import FormModal, { FormModalProps } from "./FormModal";
import { Formik } from "formik";
import { CustomTextInput, CustomTextInputRef } from "../Inputs/CustomInput";
import { useClients } from "../../context/Client.ctx";
import { AddClientSchema } from "../../constants/ValidationSchemas";

type Props = {} & FormModalProps;

const AddClientFormModal = ({
  visible = false,
  onNegative,
}: Props) => {
  const nameRef = useRef<CustomTextInputRef | null>(null);
  const phoneRef = useRef<CustomTextInputRef | null>(null);
  const companyNameRef = useRef<CustomTextInputRef | null>(null);
  const { addClient, loading } = useClients();
  const [startValidating, setStartValidating] = useState(false);

  const onSubmit = (submit: () => void) => {
    setStartValidating(true);
    submit();
    onNegative();
  }

  return (
    <Formik
      initialValues={{ name: "", phoneNumber: "", companyName: "" }}
      onSubmit={addClient}
      validationSchema={AddClientSchema}
      validateOnChange={startValidating}
      validateOnBlur={startValidating}
    >
      {({ handleChange, handleSubmit, values, errors }) => {
        return (
          <FormModal
            title={"Create New Client"}
            visible={visible}
            onNegative={onNegative}
            onPositive={() => onSubmit(handleSubmit)}
          >
            <CustomTextInput
              ref={nameRef}
              value={values.name}
              inlineErrorMessage={errors.name}
              placeholder="Name*"
              autoCapitalize="words"
              onChangeText={handleChange("name")}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focusInput()}
              editable={!loading}
            />
            <CustomTextInput
              ref={phoneRef}
              value={values.phoneNumber}
              inlineErrorMessage={errors.phoneNumber}
              placeholder="Phone Number (Optional)"
              onChangeText={handleChange("phoneNumber")}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => companyNameRef.current?.focusInput()}
              editable={!loading}
            />
            <CustomTextInput
              ref={companyNameRef}
              value={values.companyName}
              inlineErrorMessage={errors.companyName}
              placeholder="Client Company Name (Optional)"
              onChangeText={handleChange("companyName")}
              returnKeyType="done"
              editable={!loading}
            />
          </FormModal>
        );
      }}
    </Formik>
  );
};

export default AddClientFormModal;

const styles = StyleSheet.create({});
