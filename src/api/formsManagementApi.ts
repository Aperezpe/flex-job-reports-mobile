import { supabase } from "../config/supabase";
import { SystemForm, SystemFormSQL } from "../types/SystemForm";

export const getFormBySystemTypeApi = async (systemTypeId: number) =>
  await supabase
    .from("forms")
    .select("*")
    .eq("system_type_id", systemTypeId)
    .single();

export const updateFormApi = async (form: SystemForm) => {
  if (!form.id) {
    throw new Error("Cannot save form: Missing form ID.");
  }
  if (!form.systemTypeId) {
    throw new Error("Cannot save form: Missing systemTypeId.");
  }

  return await supabase
    .from("forms")
    .update<SystemFormSQL>({
      schema: form.schema,
      updated_at: new Date().toISOString(),
      system_type_id: form.systemTypeId,
    })
    .eq("id", form.id);
};
