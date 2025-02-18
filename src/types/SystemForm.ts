export interface FormSchema {
  sections: FormSection[];
}

export interface FormSection {
  id: number;
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

export interface SystemForm {
  id?: string;
  updatedAt?: Date;
  systemTypeId?: string;
  schema: FormSchema;
}

export interface SystemFormSQL {
  id?: string;
  updated_at?: Date;
  system_type_id?: string;
  schema: FormSchema;
}

export const mapSystemForm = (sqlData: SystemFormSQL): SystemForm => {
  if (!sqlData) return { schema: { sections: [] } };
  return {
    id: sqlData.id,
    updatedAt: sqlData.updated_at,
    systemTypeId: sqlData.system_type_id,
    schema: sqlData.schema,
  };
};
