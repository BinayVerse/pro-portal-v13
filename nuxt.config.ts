import validateEnvs from "./envs/env.validator";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  runtimeConfig: {
    // Private keys (only available on server-side)
    dbUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    public: {
      siteKey: '',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || '',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
      slackClientId: process.env.NUXT_PUBLIC_SLACK_CLIENT_ID,
      slackRedirectUri: process.env.NUXT_PUBLIC_SLACK_REDIRECT_URI,
      botEndpoint: process.env.NUXT_PUBLIC_BOT_ENDPOINT,
      microsoftAppId: process.env.NUXT_PUBLIC_MICROSOFT_APP_ID,
      microsoftRedirectUri: process.env.NUXT_PUBLIC_MICROSOFT_REDIRECT_URI,
      apiBase: process.env.API_BASE_URL || '/api',
    },
    dbUser: process.env.NUXT_DB_USER,
    dbPassword: process.env.NUXT_DB_PASSWORD,
    dbHost: process.env.NUXT_DB_HOST,
    dbName: process.env.NUXT_DB_NAME,
    dbPort: process.env.NUXT_DB_PORT,
    sendgridApiKey: process.env.NUXT_SENDGRID_API_KEY,
    sendgridEmailTemplateId: process.env.NUXT_SENDGRID_EMAIL_TEMPLATE_ID,
    sendgridFromEmailId: process.env.NUXT_SENDGRID_FROM_EMAIL_ID,
    sendgridSalesTeamEmails: process.env.NUXT_SENDGRID_SALES_TEAM_EMAILS,
    googleCaptchaSecretKey: process.env.NUXT_GOOGLE_CAPTCHA_SECRET_KEY,
    jwtToken: process.env.NUXT_JWT_TOKEN,
    googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    microsoftAppPassword: process.env.NUXT_MICROSOFT_APP_PASSWORD,
    googleApplicationCredentialsBase64: process.env.NUXT_GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    slackClientSecret: process.env.NUXT_SLACK_CLIENT_SECRET,
    awsRegion: process.env.NUXT_AWS_REGION,
    awsAccessKeyId: process.env.NUXT_AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.NUXT_AWS_SECRET_ACCESS_KEY,
    awsBucketName: process.env.NUXT_AWS_BUCKET_NAME,
    awsFolderName: process.env.NUXT_AWS_FOLDER_NAME
  },
  hooks: {
    listen: () => validateEnvs(),
  },

  // Development server configuration
  devServer: {
    port: 3000
  },

  // Modules
  modules: ['@nuxt/ui', '@nuxt/icon', '@pinia/nuxt', '@nuxtjs/tailwindcss'],

  // CSS
  css: ['~/assets/css/main.css'],

  // UI Configuration
  ui: {
    global: true,
    icons: ['heroicons', 'simple-icons'],
    safelistColors: ['primary', 'brand'],
  },

  // Icon Configuration
  icon: {
    serverBundle: {
      collections: ['heroicons', 'simple-icons'],
    },
  },

  // Color Mode (Dark theme by default)
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'color-mode',
  },

  // TypeScript
  typescript: {
    strict: false,
    typeCheck: false,
  },

  // TailwindCSS
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },

  // Nitro (Server)
  nitro: {
    experimental: {
      wasm: true,
    },
    storage: {
      dev: {
        driver: 'fs',
        base: './.data',
      },
    },
    routeRules: {
      // Prevent caching for HTML pages (SSR or static)
      '/**': { headers: { 'cache-control': 'no-cache, no-store, must-revalidate' } },
      // Allow caching of assets (hashed filenames change on each build)
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
    }
  },

  // Router options to fix manifest issues
  router: {
    options: {
      hashMode: false,
    },
  },

  // Experimental features to fix manifest conflicts
  experimental: {
    payloadExtraction: false,
    writeEarlyHints: false,
    typedPages: true,
  },

  // App Config
  app: {
    head: {
      title: 'provento.ai - Your AI Partner for Smarter Interactions',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'provento.ai',
          name: 'provento.ai',
          content: 'Your AI Partner for Smarter Interactions',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
})
