import { cloneDeep } from "lodash";

export interface FormSchema {
  sections: FormSection[];
}

export interface FormSection {
  id: number;
  title: string;
  fields?: FormField[];
}

export interface FormField {
  id: number;
  title: string;
  type: 'text' | 'date' | 'dropdown' | 'image';
  required: boolean;
  content?: string;
}

export interface SystemForm {
  id?: number;
  updatedAt?: string;
  systemTypeId?: string;
  schema: FormSchema;
}

export interface SystemFormSQL {
  id?: number;
  updated_at?: string;
  system_type_id?: string;
  schema: FormSchema;
}

export const mapSystemForm = (sqlData: SystemFormSQL): SystemForm => {
  if (!sqlData) return { schema: { sections: [] } };
  return {
    id: sqlData.id,
    updatedAt: sqlData.updated_at,
    systemTypeId: sqlData.system_type_id,
    schema: cloneDeep(sqlData.schema),
  };
};
