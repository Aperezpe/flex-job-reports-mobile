import React, { useRef } from "react";
import FormModal, { FormModalProps } from "./FormModal";
import { Formik } from "formik";
import { CustomTextInput, TextInputRef } from "../Inputs/CustomInput";
import { AddClientSchema } from "../../constants/ValidationSchemas";
import { AddClientFormValues } from "../../types/Client";
import { useDispatch } from "react-redux";
import { addClient } from "../../redux/actions/clientsActions";
import { useSelector } from "react-redux";
import { selectClientsLoading } from "../../redux/selectors/clientsSelectors";

type Props = {
  visible: boolean,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
} & FormModalProps;

const AddClientFormModal = ({ visible = false, setVisible }: Props) => {
  const dispatch = useDispatch();
  const nameRef = useRef<TextInputRef | null>(null);
  const phoneRef = useRef<TextInputRef | null>(null);
  const companyNameRef = useRef<TextInputRef | null>(null);
  const clientsLoading = useSelector(selectClientsLoading);

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
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  const onSubmit = (values: AddClientFormValues) => {
    dispatch(addClient(values));
    setVisible(!visible);
  }

  return (
    <Formik
      initialValues={{ name: "", phoneNumber: "", companyName: "" }}
      onSubmit={onSubmit}
      validationSchema={AddClientSchema}
    >
      {({ handleChange, handleSubmit, setFieldValue, values, errors }) => {
        return (
          <FormModal
            title={"Create New Client"}
            visible={visible}
            onNegative={() => setVisible(!visible)}
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
              editable={!clientsLoading}
            />
            <CustomTextInput
              ref={phoneRef}
              value={values.phoneNumber}
              inlineErrorMessage={errors.phoneNumber}
              placeholder="Phone Number (Optional)"
              onChangeText={(text) =>
                setFieldValue("phoneNumber", formatPhoneNumber(text))
              }
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => companyNameRef.current?.focusInput()}
              editable={!clientsLoading}
            />
            <CustomTextInput
              ref={companyNameRef}
              value={values.companyName}
              inlineErrorMessage={errors.companyName}
              placeholder="Client Company Name (Optional)"
              onChangeText={handleChange("companyName")}
              returnKeyType="done"
              editable={!clientsLoading}
            />
          </FormModal>
        );
      }}
    </Formik>
  );
};

export default AddClientFormModal;
