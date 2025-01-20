import { StyleSheet, View } from "react-native";
import React, { useRef } from "react";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { Formik } from "formik";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { useClients } from "../../context/Client.ctx";
import {
  AddAddressSchema,
} from "../../constants/ValidationSchemas";
import { globalStyles } from "../../constants/GlobalStyles";

type Props = {} & FormModalProps;

const AddAddressFormModal = ({ visible = false, onNegative }: Props) => {
  const titleRef = useRef<TextInputRef | null>(null);
  const streetRef = useRef<TextInputRef | null>(null);
  const street2Ref = useRef<TextInputRef | null>(null);
  const cityRef = useRef<TextInputRef | null>(null);
  const stateRef = useRef<TextInputRef | null>(null);
  const zipcodeRef = useRef<TextInputRef | null>(null);
  const { addAddress, loading } = useClients();

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
      onSubmit={addAddress}
      validationSchema={AddAddressSchema}
    >
      {({ handleChange, handleSubmit, values, errors }) => {
        return (
          <FormModal
            title={"Create New Client"}
            visible={visible}
            onNegative={onNegative}
            onPositive={handleSubmit}
            loading={loading}
          >
            <CustomTextInput
              ref={titleRef}
              value={values.title}
              inlineErrorMessage={errors.title}
              placeholder="Address Title"
              onChangeText={handleChange("title")}
              returnKeyType="next"
              onSubmitEditing={() => streetRef.current?.focusInput()}
              editable={!loading}
            />
            <CustomTextInput
              ref={streetRef}
              value={values.street}
              inlineErrorMessage={errors.street}
              placeholder="Street Address"
              onChangeText={handleChange("street")}
              returnKeyType="next"
              onSubmitEditing={() => street2Ref.current?.focusInput()}
              editable={!loading}
            />
            <CustomTextInput
              ref={street2Ref}
              value={values.street2}
              inlineErrorMessage={errors.street2}
              placeholder="Apt/Suite/Other (Optional)"
              onChangeText={handleChange("street2")}
              editable={!loading}
            />
            <CustomTextInput
              ref={cityRef}
              value={values.city}
              inlineErrorMessage={errors.city}
              placeholder="City"
              onChangeText={handleChange("city")}
              returnKeyType="next"
              onSubmitEditing={() => stateRef.current?.focusInput()}
              editable={!loading}
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
                editable={!loading}
                inputContainerStyle={{ flex: 1 }}
              />
              <CustomTextInput
                ref={zipcodeRef}
                value={values.zipcode}
                inlineErrorMessage={errors.zipcode}
                placeholder="Zipcode"
                onChangeText={handleChange("zipcode")}
                keyboardType="number-pad"
                editable={!loading}
                inputContainerStyle={{ flex: 1 }}
              />
            </View>
          </FormModal>
        );
      }}
    </Formik>
  );
};

export default AddAddressFormModal;

const styles = StyleSheet.create({});
