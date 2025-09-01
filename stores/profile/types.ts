export interface UserProfile {
  user_id: number
  name: string
  email: string
  company: string
  whatsappNumber?: string
  primary_contact: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserProfileState {
  userProfile: UserProfile | any
  profileStatus: string // 'complete' or 'incomplete'
  profileMessage: string | null
  loading: boolean
}
