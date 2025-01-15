import { StyleSheet } from "react-native";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import FormModal, { FormModalProps } from "./FormModal";
import { Formik } from "formik";
import { CustomTextInput, CustomTextInputRef } from "../Inputs/CustomInput";
import { useClients } from "../../context/Client.ctx";
import { AddClientSchema } from "../../constants/ValidationSchemas";
import { AddClientFormValues } from "../../types/Client";

type Props = {} & FormModalProps;

const AddClientFormModal = ({
  visible = false,
  onNegative,
}: Props) => {
  const nameRef = useRef<CustomTextInputRef | null>(null);
  const phoneRef = useRef<CustomTextInputRef | null>(null);
  const companyNameRef = useRef<CustomTextInputRef | null>(null);
  const { addClient, loading } = useClients();

  // implement a onPhoneChange function that will format the phone number as the user types
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
  
    // Remove all non-digit characters
    const phoneNumber = value.replace(/[^\d]/g, "");
  
    // Format according to phone number pattern
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  return (
    <Formik
      initialValues={{ name: "", phoneNumber: "", companyName: "" }}
      onSubmit={addClient}
      validationSchema={AddClientSchema}
    >
      {({ handleChange, handleSubmit, setFieldValue, values, errors }) => {
        return (
          <FormModal
            title={"Create New Client"}
            visible={visible}
            onNegative={onNegative}
            onPositive={handleSubmit}
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
              onChangeText={(text) => setFieldValue('phoneNumber', formatPhoneNumber(text))}
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
