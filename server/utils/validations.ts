import { z } from 'zod'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const requestForOptions = [
  'legal',
  'hr',
  'finance',
  'research',
  'customer-support',
  'other',
] as const
const companySizeOptions = ['1-10', '11-50', '51-200', '201-1000', '1000+'] as const

export const createUserValidation = z.object({
  user_id: z.any(),
  name: z.string(),
  email: z.string().email(),
  contact_number: z.string(),
  primary_contact: z.boolean().optional(),
  role_id: z.any(),
})

export const ContactUsValidation = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  lastname: z.string().min(1, 'Last name is required').max(255, 'Last name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  phone: z.string().max(20, 'Phone number too long').optional(),
  message: z.string().max(1000, 'Message too long').optional(),
  requestFor: z
    .enum(requestForOptions, {
      errorMap: () => ({
        message:
          'Request type must be one of: legal, hr, finance, research, customer-support, other',
      }),
    })
    .optional(),
  company: z.string().max(255, 'Company name too long').optional(),
  jobTitle: z.string().max(255, 'Job title too long').optional(),
  companySize: z
    .enum(companySizeOptions, {
      errorMap: () => ({
        message: 'Company size must be one of: 1-10, 11-50, 51-200, 201-1000, 1000+',
      }),
    })
    .optional(),
  token: z.string().min(1, 'reCAPTCHA token is required'),
  domain: z.string().optional(),
})

export type ContactUsData = z.infer<typeof ContactUsValidation>

// Password validation regex
export const getPasswordRegex = () =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Signin validation schema
export const SigninValidation = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string().min(1, 'Password is required'),
})

// Signup validation schema
export const SignupValidation = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (val) => getPasswordRegex().test(val),
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  wpNumber: z.string().max(20, 'Phone number too long').optional(),
  companyName: z.string().min(1, 'Company name is required').max(255, 'Company name too long'),
})

// Google signup validation schema
export const GoogleSignupValidation = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  wpNumber: z.string().max(20, 'Phone number too long').optional(),
  companyName: z.string().min(1, 'Company name is required').max(255, 'Company name too long'),
})

export const uploadBulkUserValidation = z.object({
  Name: z.string().trim().min(1, { message: `"Name" is required` }),

  Email: z.string().trim().email({ message: `"Email" is not valid` }),

  'Whatsapp Number': z
    .string()
    .trim()
    .min(1, { message: `"Whatsapp Number" is required.` })
    .refine((value) => value.startsWith('+'), {
      message: `The WhatsApp number must start with a '+' followed by the country code (e.g., +1 for USA, +91 for India).`,
    })
    .refine(
      (value) => {
        const phoneNumber = parsePhoneNumberFromString(value)
        return phoneNumber?.isValid() ?? false
      },
      {
        message: `The WhatsApp number is not valid. Please include a valid country code and number.`,
      },
    ),

  Role: z
    .string()
    .trim()
    .min(1, { message: `"Role" is required` })
    .transform((val) => val.toLowerCase())
    .refine((val) => ['user', 'admin'].includes(val), {
      message: `"Role" must be either 'User' or 'Admin'`,
    }),
})

export type SigninData = z.infer<typeof SigninValidation>
export type SignupData = z.infer<typeof SignupValidation>
export type GoogleSignupData = z.infer<typeof GoogleSignupValidation>
