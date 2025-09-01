import { Env } from './env.schema'

export default function validateEnvs() {
  try {
    const envs = { ...process.env }
    const validation = Env.safeParse(envs)
    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        console.warn(`Missing env ${issue.path.join('.')} ${issue.message}`)
      })
      // Don't exit in development mode, just warn
      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }
    }
    // eslint-disable-next-line no-console
    console.log('Loaded environment variables')
  }
  catch (error) {
    console.error('Unable to parse .env. validation error:', error)
    // Don't exit in development mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
