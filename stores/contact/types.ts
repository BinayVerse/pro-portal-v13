export interface createAPIPayload {
  name: string
  email: string
  phoneNumber: string
  requestFor: string
  message: string
  token: string
  domain: string
}

export interface DemoRequestPayload {
  name: string
  lastname: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  companySize?: string
  requestFor?: string
  message?: string
  token: string
  domain?: string
}

export interface State {
  loading: boolean;
}
