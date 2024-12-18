import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .required("No password provided.")
    .min(8, "Password is too short - should be 8 chars minimum.")
    .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
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
