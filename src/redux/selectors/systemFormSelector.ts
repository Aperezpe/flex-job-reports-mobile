import { SystemForm } from "../../types/SystemForm";
import { RootState } from "../store";

export const selectSystemForm = (state: RootState): SystemForm =>
  state.systemForm.systemForm;

export const selectSystemFormLoading = (state: RootState): boolean =>
  state.systemForm.loading;

export const selectField = (
  state: RootState,
  sectionId: number,
  fieldId: number
) => {
  const section = state.systemForm.systemForm.schema.sections.find(
    (section) => section.id === sectionId
  );
  if (!section) {
    throw new Error(`Section with id ${sectionId} not found`);
  }
  const field = section?.fields?.find((field) => field.id === fieldId);
  if (!field) {
    throw new Error(
      `Field with id ${fieldId} not found in section ${sectionId}`
    );
  }
  return field;
};
