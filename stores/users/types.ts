export interface OrganizationState {
  loading: boolean
  error: string | null
  users: any[]
  roles: any[]
  userLoading: boolean
  userError: string | null
}

export interface OrganizationUser {
  id: number
  name: string
  email: string
  role: string
  contact_number: string
  primary_contact: boolean
  status: string
}

export interface Organization {
  id: string
  name: string
  docs_uploaded: string
  users_count: number
  total_tokens: string
  org_plan: Plans[]
}

export interface Plans {
  name: string
  expire_at: string
  status: string
}

export interface OrganizationResponse {
  org_id: string
  org_name: string
  docs_uploaded: string
  users_count: number
  total_tokens: string
  name: string
  status: string
  expire_at: string
}

export interface OrganizationData {
  org_id: string
  org_name: string
  docs_uploaded: number
  plan: any[]
  user: any[]
  frequentQA: any[]
}

export interface WhatsAppNumber {
  status: boolean
  data?: Record<string, any> | null
  message?: string
}

export interface BusinessWhatsAppDetails {
  business_whatsapp_number: string | null
  whatsapp_status: boolean
  permanent_access_token?: string
  app_id?: string
  app_secret_key?: string
}

export interface SlackAppDetails {
  status: boolean
  data?: Record<string, any> | null
  message?: string
}

export interface SlackAppDetailsData {
  team_id: string | null
  team_name: boolean
  access_token?: string
  installed_by_user_id?: string
}
