import { createReducer } from "@reduxjs/toolkit";
import { mapSystemForm, SystemForm } from "../../types/SystemForm";
import {
  addField,
  addSection,
  changeSectionTitle,
  clearFormState,
  fetchForm,
  fetchFormFailure,
  fetchFormSuccess,
  removeField,
  removeSection,
  saveForm,
  saveFormFailure,
  saveFormSuccess,
  updateField,
  updateSectionFields,
} from "../actions/systemFormActions";
import { reorderItems } from "react-native-reorderable-list";
import { Alert } from "react-native";

interface SystemFormState {
  systemForm: SystemForm;
  loading: boolean;
  saveLoading: boolean;
  saveError: string | null;
  isFormValid: boolean;
  error: string | null;
}

const initialState: SystemFormState = {
  systemForm: {
    schema: {
      sections: [],
    },
  },
  saveLoading: false,
  saveError: null,
  loading: false,
  isFormValid: false,
  error: null,
};

const systemFormReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addSection, (state) => {
      state.systemForm.schema.sections.push({
        id: Date.now(),
        title: "",
        fields: [],
      });
    })
    .addCase(removeSection, (state, action) => {
      state.systemForm.schema.sections =
        state.systemForm.schema.sections.filter(
          (section) => section.id !== action.payload
        );
    })
    .addCase(changeSectionTitle, (state, action) => {
      const section = state.systemForm.schema.sections.find(
        (section) => section.id === action.payload.sectionId
      );
      if (section) {
        section.title = action.payload.title;
      }
    })
    .addCase(addField, (state, action) => {
      const section = state.systemForm.schema.sections.find(
        (section) => section.id === action.payload.sectionId
      );
      if (section) {
        section?.fields?.push({
          id: Date.now(),
          title: "",
          required: false,
          type: "text",
        });
      }
    })
    .addCase(updateField, (state, action) => {
      const section = state.systemForm.schema.sections.find(
        (section) => section.id === action.payload.sectionId
      );
      if (section) {
        const field = section?.fields?.find(
          (field) => field.id === action.payload.fieldId
        );
        if (field) {
          Object.assign(field, action.payload.field);
        }
      }
    })
    .addCase(removeField, (state, action) => {
      const section = state.systemForm.schema.sections.find(
        (section) => section.id === action.payload.sectionId
      );
      if (section) {
        section.fields = section?.fields?.filter(
          (field) => field.id !== action.payload.fieldId
        );
      }
    })
    .addCase(updateSectionFields, (state, action) => {
      const { sectionId, from, to } = action.payload;
      const section = state.systemForm.schema.sections.find(
        (section) => section.id === sectionId
      );
      if (section) {
        section.fields = section.fields = reorderItems(
          section?.fields ?? [],
          from,
          to
        );
      }
    })
    .addCase(fetchForm, (state) => {
      state.loading = true;
    })
    .addCase(fetchFormSuccess, (state, action) => {
      state.systemForm = mapSystemForm(action.payload);
      state.loading = false;
    })
    .addCase(fetchFormFailure, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    })
    .addCase(saveForm, (state) => {
      state.saveLoading = true;
    })
    .addCase(saveFormSuccess, (state) => {
      state.saveLoading = false;
      Alert.alert("✅ Form saved successfully!");
    })
    .addCase(saveFormFailure, (state, action) => {
      state.saveError = action.payload;
      state.saveLoading = false;
      Alert.alert("❌ Error saving form:", state.saveError);
    })
    .addCase(clearFormState, () => initialState);
});

export default systemFormReducer;
