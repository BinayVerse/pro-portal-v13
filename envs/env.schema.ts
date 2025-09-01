import { z } from 'zod'

export const BaseSchema = z.object({
  NUXT_HOST: z.string().optional(),
  NUXT_PORT: z.string().optional(),
})

const PrivateSchema = z.object({
  NODE_ENV: z.string(),
  NUXT_PUBLIC_APP_URL: z.string(),
  NUXT_PUBLIC_SITE_KEY: z.string().default('http://localhost:3001/'),
  NUXT_SENDGRID_API_KEY: z.string(),
  NUXT_SENDGRID_EMAIL_TEMPLATE_ID: z.string(),
  NUXT_SENDGRID_FROM_EMAIL_ID: z.string(),
  NUXT_SENDGRID_SALES_TEAM_EMAILS: z.string(),
  NUXT_GOOGLE_CAPTCHA_SECRET_KEY: z.string(),
  NUXT_JWT_TOKEN: z.string(),
  NUXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
  NUXT_GOOGLE_CLIENT_SECRET: z.string(),
  NUXT_PUBLIC_MICROSOFT_APP_ID: z.string(),
  NUXT_MICROSOFT_APP_PASSWORD: z.string(),
  NUXT_PUBLIC_MICROSOFT_REDIRECT_URI: z.string(),
  NUXT_GOOGLE_APPLICATION_CREDENTIALS_BASE64: z.string(),
  NUXT_PUBLIC_SLACK_CLIENT_ID: z.string(),
  NUXT_SLACK_CLIENT_SECRET: z.string(),
  NUXT_PUBLIC_SLACK_REDIRECT_URI: z.string(),
  NUXT_PUBLIC_BOT_ENDPOINT: z.string(),
  NUXT_AWS_REGION: z.string(),
  NUXT_AWS_ACCESS_KEY_ID: z.string(),
  NUXT_AWS_SECRET_ACCESS_KEY: z.string(),
  NUXT_AWS_BUCKET_NAME: z.string(),
  NUXT_AWS_FOLDER_NAME: z.string(),
  NUXT_DB_HOST: z.string(),
  NUXT_DB_PORT: z.string(),
  NUXT_DB_NAME: z.string(),
  NUXT_DB_USER: z.string(),
  NUXT_DB_PASSWORD: z.string(),
})

export const Env = BaseSchema.merge(PrivateSchema)
