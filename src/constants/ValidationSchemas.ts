import * as Yup from "yup";
import { AddSystemFormValues } from "../types/System";
import { AddSystemTypeForm } from "../types/SystemType";
import { FieldEditValues, fieldTypeOptions } from "../types/FieldEdit";
import { CompanyConfigForm, JoinCompanyForm } from "../types/Company";

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
  street: Yup.string().required("Street is required").trim(),
  street2: Yup.string().trim(),
  city: Yup.string().required("City is required").trim(),
  state: Yup.string()
    .required("State is required")
    .oneOf(
      [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
      ],
      "State must be a valid US state abbreviation"
    )
    .trim(),
  zipcode: Yup.string()
    .matches(/^\d{5}$/, "Zipcode must be exactly 5 digits")
    .trim(),
});

export const AddSystemSchema = Yup.object<AddSystemFormValues>({
  systemTypeId: Yup.number().required(),
  area: Yup.string().trim(),
  tonnage: Yup.string().trim(),
});

export const AddSystemTypeSchema = Yup.object<AddSystemTypeForm>({
  systemType: Yup.string().required("System Type is required").trim(),
});

export const JoinCompanySchema = Yup.object<JoinCompanyForm>({
  companyUid: Yup.string().required("Company ID is required").trim(),
});

export const FieldEditSchema = Yup.object<FieldEditValues>({
  // Title is required and must be a trimmed string
  title: Yup.string().required("Title is required").trim(),

  // Description is optional, but will be trimmed if present
  description: Yup.string().trim(),

  // Type must be one of the allowed fieldTypeOptions and is required
  type: Yup.string()
    .oneOf(fieldTypeOptions as readonly string[])
    .required(),

  // Required is a boolean indicating if the field is mandatory
  required: Yup.boolean(),

  listContent: Yup.mixed().when("type", {
    is: (type: string) =>
      ["dropdown", "multipleChoice", "checkboxes"].includes(type),
    then: () =>
      Yup.array()
        .of(
          Yup.object({
            value: Yup.string().trim().required("Item cannot be empty"),
          })
        )
        .min(1, "Field must have at least one item")
        .test(
          "unique-values",
          "Values must be unique",
          (listContent) => {
            if (!Array.isArray(listContent)) return false;
            const values = listContent.map((item) => item.value?.trim());
            return new Set(values).size === values.length;
          }
        )
        .required("listContent is required for this field type"),
    otherwise: () => Yup.mixed().strip(),
  }),

  // gridContent is only validated for the "multipleChoiceGrid" type
  gridContent: Yup.mixed().when("type", {
    is: "multipleChoiceGrid",
    then: () =>
      Yup.object({
        rows: Yup.array()
          .of(Yup.object({ value: Yup.string().required() }))
          .min(1, "At least 1 row required"),
        columns: Yup.array()
          .of(Yup.object({ value: Yup.string().required() }))
          .min(1, "At least 1 column required"),
      }).test("unique-values", "Rows and Columns must be unique", (value) => {
        if (!value?.rows || !value?.columns) return false;
        const rowVals = value.rows.map((r) => r.value.trim());
        const colVals = value.columns.map((c) => c.value.trim());
        return (
          new Set(rowVals).size === rowVals.length &&
          new Set(colVals).size === colVals.length
        );
      }),
    otherwise: () => Yup.mixed().strip(), // ✅ exclude from validation when not needed
  }),
});

export const CompanyConfigSchema = Yup.object<CompanyConfigForm>({
  jobReportEmailEnabled: Yup.boolean().required(),
  jobReportEmail: Yup.string().email("Invalid email format"),
  smartSummariesEnabled: Yup.boolean().required(),
});
