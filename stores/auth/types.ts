export interface AuthUser {
  user_id?: string;
  email?: string;
  name?: string;
  contact_number?: string;
  org_id?: string;
  primary_contact?: boolean;
  role_id?: number;
  profile_complete?: boolean;
  added_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
  token?: string;
  user?: AuthUser;
  redirect?: string;
}
