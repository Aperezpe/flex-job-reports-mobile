import { View } from "react-native";
import React, { useRef } from "react";
import FormModal, { FormModalProps } from "../clients/FormModal";
import { Formik } from "formik";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { AddAddressSchema } from "../../constants/ValidationSchemas";
import { globalStyles } from "../../constants/GlobalStyles";
import { useDispatch } from "react-redux";
import { upsertAddress } from "../../redux/actions/clientDetailsActions";
import { AddAddressFormValues, Address } from "../../types/Address";

// Send address to edit
type Props = {
  address?: Address;
} & FormModalProps;

const AddressFormModal = ({
  visible,
  onNegative,
  onPositive,
  address,
  onRequestClose,
}: Props) => {
  const dispatch = useDispatch();

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
        street: "",
        street2: "",
        city: "",
        state: "",
        zipcode: "",
      }}
      onSubmit={onSubmit}
      validationSchema={AddAddressSchema}
      validateOnChange={false}
    >
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
            onDismiss={resetForm}
            onShow={handleOnShow}
          >
            <CustomTextInput
              ref={streetRef}
              value={values.street}
              inlineErrorMessage={errors.street}
              placeholder="Street Address"
              onChangeText={handleChange("street")}
              returnKeyType="next"
              onSubmitEditing={() => street2Ref.current?.focusInput()}
            />
            <CustomTextInput
              ref={street2Ref}
              value={values.street2}
              inlineErrorMessage={errors.street2}
              placeholder="Apt/Suite/Other (Optional)"
              onChangeText={handleChange("street2")}
            />
            <CustomTextInput
              ref={cityRef}
              value={values.city}
              inlineErrorMessage={errors.city}
              placeholder="City"
              onChangeText={handleChange("city")}
              returnKeyType="next"
              onSubmitEditing={() => stateRef.current?.focusInput()}
            />
            <View style={[globalStyles.row, { gap: 10 }]}>
              <View style={{ flex: 1 }}>
                <CustomTextInput
                  ref={stateRef}
                  value={values.state}
                  inlineErrorMessage={errors.state}
                  placeholder="State"
                  autoCapitalize="characters"
                  onChangeText={handleChange("state")}
                  returnKeyType="next"
                  onSubmitEditing={() => zipcodeRef.current?.focusInput()}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomTextInput
                  ref={zipcodeRef}
                  value={values.zipcode}
                  inlineErrorMessage={errors.zipcode}
                  placeholder="Zipcode"
                  onChangeText={handleChange("zipcode")}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </FormModal>
        );
      }}
    </Formik>
  );
};

export default AddressFormModal;
