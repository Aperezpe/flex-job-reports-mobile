import * as Yup from "yup";
import { AddSystemFormValues } from "../types/System";
import { AddSystemTypeForm } from "../types/SystemType";

export const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required").trim(),
  password: Yup.string()
    .required("No password provided.")
    .min(8, "Password is too short - should be 8 chars minimum.")
    .matches(
      /^[a-zA-Z0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/,
      "Password can only contain Latin letters, numbers, and common symbols."
    ),
});

export const CompanyIdSchema = Yup.object().shape({
  companyId: Yup.string()
    .matches(
      /^[a-z0-9-_]+$/,
      "Company ID can only contain lowercase letters, numbers, dashes, and underscores."
    )
    .required("Company ID is required.")
    .min(6, "Company ID must be at least 6 characters.")
    .max(30, "Company ID must be at most 30 characters.")
    .trim(),
});

export const AddClientSchema = Yup.object().shape({
  name: Yup.string().required("Name is required").trim(),
  phoneNumber: Yup.string().matches(
    /^\(\d{3}\) \d{3}-\d{4}$/,
    "Invalid phone number"
  ),
  companyName: Yup.string().trim(),
});

export const AddAddressSchema = Yup.object().shape({
  title: Yup.string().required("Title is required").trim(),
  street: Yup.string().required("Street is required").trim(),
  street2: Yup.string().trim(),
  city: Yup.string().required("City is required").trim(),
  state: Yup.string()
    .required("State is required")
    .oneOf(
      [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", 
        "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", 
        "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", 
        "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", 
        "WI", "WY"
      ],
      "State must be a valid US state abbreviation"
    )
    .trim(),
  zipcode: Yup.string()
    .required("Zipcode is required")
    .matches(/^\d{5}$/, "Zipcode must be exactly 5 digits")
    .trim(),
});

export const AddSystemSchema = Yup.object<AddSystemFormValues>({
  systemName: Yup.string().required('System Name is required').trim(),
  systemType: Yup.string().required('System Type is required').trim(),
  area: Yup.string().trim(),
  tonnage: Yup.string().trim(),
});

export const AddSystemTypeSchema = Yup.object<AddSystemTypeForm>({
  systemType: Yup.string().required('System Type is required').trim(),
})
