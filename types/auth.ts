export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'manager'
  status: 'active' | 'inactive' | 'suspended'
  avatar?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
  industry?: string
  companyName?: string
  phoneNumber?: string
  address?: string
  marketingConsent?: boolean
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshTokenResponse {
  token: string
  expiresIn: number
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  avatar?: File
}
