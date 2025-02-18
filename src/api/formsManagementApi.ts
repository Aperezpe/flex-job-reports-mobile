import { supabase } from "../config/supabase";

export const getFormApi = async (systemTypeId: number) =>
  await supabase.from("forms").select("*").eq("system_type_id", systemTypeId).single();
