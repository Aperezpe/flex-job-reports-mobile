import { View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { Formik } from "formik";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { AddAddressSchema } from "../../constants/ValidationSchemas";
import { globalStyles } from "../../constants/GlobalStyles";
import { useDispatch } from "react-redux";
import { upsertAddress } from "../../redux/actions/clientDetailsActions";
import { AddAddressFormValues, Address } from "../../types/Address";
import { useForceUpdate } from "../../hooks/useForceUpdate";

// Send address id to edit address
type Props = {
  address?: Address;
} & FormModalProps;

const UpsertAddressFormModal = ({
  visible,
  onNegative,
  onPositive,
  address,
  onRequestClose,
  onDismiss,
}: Props) => {
  const dispatch = useDispatch();

  const titleRef = useRef<TextInputRef | null>(null);
  const streetRef = useRef<TextInputRef | null>(null);
  const street2Ref = useRef<TextInputRef | null>(null);
  const cityRef = useRef<TextInputRef | null>(null);
  const stateRef = useRef<TextInputRef | null>(null);
  const zipcodeRef = useRef<TextInputRef | null>(null);

  const onSubmit = (values: AddAddressFormValues) => {
    dispatch(upsertAddress({ values, addressId: address?.id }));
    onPositive?.();
  };

  return (
    <Formik
      initialValues={{
        title: "",
        street: "",
        street2: "",
        city: "",
        state: "",
        zipcode: "",
      }}
      onSubmit={onSubmit}
      validationSchema={AddAddressSchema}
    >
      {/* TODO: Do I want loading somewhere here? */}
      {({
        handleChange,
        handleSubmit,
        values,
        errors,
        setValues,
        resetForm,
      }) => {

        const handleOnShow = () => {
          if (address?.id)
            setValues(
              {
                title: address?.addressTitle ?? "",
                street: address?.addressStreet ?? "",
                street2: address?.addressStreet2 ?? "",
                city: address?.addressCity ?? "",
                state: address?.addressState ?? "",
                zipcode: address?.addressZipcode ?? "",
              },
              false
            );
          else resetForm();
        };

        return (
          <FormModal
            title={address ? "Update Address" : "Add New Address"}
            visible={visible}
            onNegative={onNegative}
            onPositive={handleSubmit}
            onRequestClose={onRequestClose}
            onDismiss={onDismiss}
            onShow={handleOnShow}
            // onShow={}
            // loading={loading}
          >
            <CustomTextInput
              ref={titleRef}
              value={values.title}
              inlineErrorMessage={errors.title}
              placeholder="Address Title"
              onChangeText={handleChange("title")}
              returnKeyType="next"
              onSubmitEditing={() => streetRef.current?.focusInput()}
              // editable={!loading}
            />
            <CustomTextInput
              ref={streetRef}
              value={values.street}
              inlineErrorMessage={errors.street}
              placeholder="Street Address"
              onChangeText={handleChange("street")}
              returnKeyType="next"
              onSubmitEditing={() => street2Ref.current?.focusInput()}
              // editable={!loading}
            />
            <CustomTextInput
              ref={street2Ref}
              value={values.street2}
              inlineErrorMessage={errors.street2}
              placeholder="Apt/Suite/Other (Optional)"
              onChangeText={handleChange("street2")}
              // editable={!loading}
            />
            <CustomTextInput
              ref={cityRef}
              value={values.city}
              inlineErrorMessage={errors.city}
              placeholder="City"
              onChangeText={handleChange("city")}
              returnKeyType="next"
              onSubmitEditing={() => stateRef.current?.focusInput()}
              // editable={!loading}
            />
            <View style={[globalStyles.row, { gap: 10 }]}>
              <CustomTextInput
                ref={stateRef}
                value={values.state}
                inlineErrorMessage={errors.state}
                placeholder="State"
                onChangeText={handleChange("state")}
                returnKeyType="next"
                onSubmitEditing={() => zipcodeRef.current?.focusInput()}
                // editable={!loading}
                inputContainerStyle={{ flex: 1 }}
              />
              <CustomTextInput
                ref={zipcodeRef}
                value={values.zipcode}
                inlineErrorMessage={errors.zipcode}
                placeholder="Zipcode"
                onChangeText={handleChange("zipcode")}
                keyboardType="number-pad"
                // editable={!loading}
                inputContainerStyle={{ flex: 1 }}
              />
            </View>
          </FormModal>
        );
      }}
    </Formik>
  );
};

export default UpsertAddressFormModal;
