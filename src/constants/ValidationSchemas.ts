import * as Yup from "yup";

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
  phoneNumber: Yup.string().trim(),
  companyName: Yup.string().trim(),
})