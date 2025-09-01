export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    console.error('[Error Handler]:', error)

    if (process.dev) {
      console.error('Stack trace:', error.stack)
    }
  })
})
