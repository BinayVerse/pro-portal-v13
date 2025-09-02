import { CustomError } from '../utils/custom.error'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    console.error('[Error Handler]:', error)

    if (process.dev) {
      console.error('Stack trace:', error.stack)
    }

    // Handle CustomError instances with proper response format
    if (error instanceof CustomError) {
      // Set the response status
      if (event && event.node && event.node.res) {
        event.node.res.statusCode = error.statusCode
      }

      // Return structured error response
      return {
        statusCode: error.statusCode,
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    }

    // Handle other errors with generic format
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal Server Error'

    if (event && event.node && event.node.res) {
      event.node.res.statusCode = statusCode
    }

    return {
      statusCode,
      status: 'error', 
      message,
      timestamp: new Date().toISOString()
    }
  })

  // Handle render errors
  nitroApp.hooks.hook('render:response', async (response, { event }) => {
    if (response.statusCode >= 400) {
      console.error(`[${response.statusCode}] ${event.node.req.url}`)
    }
  })
})
