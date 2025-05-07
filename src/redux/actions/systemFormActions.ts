import { createAction } from "@reduxjs/toolkit";
import { SystemForm } from "../../types/SystemForm";

export const addSection = createAction("ADD_SECTION");

export const removeSection = createAction<number>("REMOVE_SECTION");
export const changeSectionTitle = createAction<{
  sectionId: number;
  title: string;
}>("CHANGE_SECTION_TITLE");

export const addField = createAction<{ sectionId: number }>("ADD_FIELD");
export const removeField = createAction<{ sectionId: number; fieldId: number }>(
  "REMOVE_FIELD"
);
export const updateField = createAction<{
  sectionId: number;
  fieldId: number;
  field: any;
}>("UPDATE_FIELD");

export const updateSectionFields = createAction<{
  sectionId: number;
  from: number;
  to: number;
}>("UPDATE_SECTION_FIELDS");

export const fetchForm = createAction<number>("FETCH_FORM");
export const fetchFormSuccess = createAction<SystemForm>("FETCH_FORM_SUCCESS");
export const fetchFormFailure = createAction<string>("FETCH_FORM_FAILURE");

export const saveForm = createAction("SAVE_FORM");
export const saveFormSuccess = createAction("SAVE_FORM_SUCCESS");
export const saveFormFailure = createAction<string>("SAVE_FORM_FAILURE");

export const clearFormState = createAction("CLEAR_FORM_STATE");
