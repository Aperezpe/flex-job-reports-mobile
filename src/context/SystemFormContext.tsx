import { createContext, useContext, useEffect, useState } from "react";
import {
  getFormBySystemTypeApi,
  updateFormApi,
} from "../api/formsManagementApi";
import { FormField, mapSystemForm, SystemForm } from "../types/SystemForm";
import { cloneDeep } from "lodash";
import {
  reorderItems,
} from "react-native-reorderable-list";
import { Alert } from "react-native";

interface SystemFormContextType {
  systemForm: SystemForm;
  addSection: () => void;
  // sections: FormSection[];
  onChangeTitle: (text: string, sectionId: number) => void;
  removeSection: (sectionId: number) => void;
  addField: (sectionId: number) => void;
  updateField: (
    sectionIndex: number,
    fieldId: number,
    newField: Partial<FormField>
  ) => void;
  removeField: (sectionIndex: number, fieldId: number) => void;
  updateSectionFields: (sectionIndex: number, from: number, to: number) => void;
  saveForm: () => Promise<void>;
  loading: boolean;
}

const SystemFormContext = createContext<SystemFormContextType | undefined>(
  undefined
);

export const SystemFormProvider = ({
  systemTypeId,
  children,
}: {
  systemTypeId: number;
  children: React.ReactNode;
}) => {
  const [systemForm, setSystemForm] = useState<SystemForm>({
    schema: {
      sections: [],
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);

        const { data, error } = await getFormBySystemTypeApi(systemTypeId);
        if (error) throw error;
        const fetchedForm = mapSystemForm(data);

        setSystemForm(fetchedForm);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, []);

  const addSection = () => {
    const clonedForm = cloneDeep(systemForm);

    clonedForm.schema.sections.push({
      id: Date.now(),
      title: "",
      fields: [],
    });

    setSystemForm(clonedForm);
  };

  const removeSection = (sectionId: number): void => {
    const clonedForm = cloneDeep(systemForm);

    setSystemForm({
      ...clonedForm,
      schema: {
        ...clonedForm.schema,
        sections: clonedForm.schema.sections.filter(
          (section) => section.id !== sectionId
        ),
      },
    });
  };

  const onChangeTitle = (text: string, sectionId: number) => {
    const clonedForm = cloneDeep(systemForm);
    clonedForm.schema.sections.map((section) => {
      if (section.id === sectionId) {
        section.title = text;
      }
      return section;
    });
    setSystemForm(clonedForm);
  };

  const addField = (sectionIndex: number) => {
    setSystemForm((prevForm) => ({
      ...prevForm,
      schema: {
        sections: prevForm.schema.sections.map((section, i) =>
          sectionIndex === i
            ? {
                ...section,
                fields: [
                  ...(section?.fields ?? []),
                  {
                    id: Date.now(),
                    title: "",
                    required: false,
                    type: "text",
                  },
                ],
              }
            : section
        ),
      },
    }));
  };

  const updateSectionFields = (
    sectionIndex: number,
    from: number,
    to: number
  ) => {
    setSystemForm((prevForm) => ({
      ...prevForm,
      schema: {
        ...prevForm.schema,
        sections: [
          ...prevForm.schema.sections.map((section, i) => {
            if (sectionIndex === i) {
              section.fields = reorderItems(section?.fields ?? [], from, to);
            }
            return section;
          }),
        ],
      },
    }));
  };

  // Update a field in a section
  const updateField = (
    sectionIndex: number,
    fieldId: number,
    newField: Partial<FormField>
  ) => {
    setSystemForm((prevForm) => ({
      ...prevForm,
      schema: {
        sections: prevForm.schema.sections.map((section, i) =>
          sectionIndex === i
            ? {
                ...section,
                fields: section?.fields?.map((field) =>
                  field.id === fieldId ? { ...field, ...newField } : field
                ),
              }
            : section
        ),
      },
    }));
  };

  // Remove a field from a section
  const removeField = (sectionIndex: number, fieldId: number) => {
    setSystemForm((prevForm) => ({
      ...prevForm,
      schema: {
        sections: prevForm.schema.sections.map((section, i) =>
          sectionIndex === i
            ? {
                ...section,
                fields: section?.fields?.filter((field) => field.id !== fieldId),
              }
            : section
        ),
      },
    }));
  }

  // Save form to the database
  const saveForm = async () => {
    try {
      const { error } = await updateFormApi(systemForm);
      if (error) throw error;

      Alert.alert("✅ Form saved successfully!");
    } catch (error) {
      Alert.alert("❌ Error saving form:", (error as Error).message);
    }
  };


  return (
    <SystemFormContext.Provider
      value={{
        systemForm,
        addSection,
        removeSection,
        onChangeTitle,
        addField,
        updateField,
        saveForm,
        removeField,
        loading,
        updateSectionFields,
      }}
    >
      {children}
    </SystemFormContext.Provider>
  );
};

// Custom hook to use the form context
export const useSystemForm = () => {
  const context = useContext(SystemFormContext);
  if (!context) {
    throw new Error("useSystemForm must be used within a SystemFormProvider");
  }
  return context;
};
