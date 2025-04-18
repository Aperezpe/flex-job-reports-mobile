export interface JoinRequest {
  id?: number;
  createdAt?: string;
  companyUid?: string;
  userId?: string;
  userName?: string;
  status?: 'PENDING' | 'REJECTED' | 'ACCEPTED';
}

export interface JoinRequestSQL {
  id?: number;
  created_at?: string;
  company_uid?: string;
  user_id?: string;
  user_name?: string;
  status?: 'PENDING' | 'REJECTED' | 'ACCEPTED';
}

export const mapJoinRequest = (sqlData: JoinRequestSQL): JoinRequest => {
  if (!sqlData) return {} as JoinRequest;
  return {
    id: sqlData.id,
    createdAt: sqlData.created_at,
    companyUid: sqlData.company_uid,
    userId: sqlData.user_id,
    userName: sqlData.user_name,
  };
};



