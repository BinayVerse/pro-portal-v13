export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  // Validate input
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  try {
    // Demo credentials for testing
    if (email === 'demo@example.com' && password === 'password') {
      const user = {
        id: 1,
        email: email,
        name: 'Demo User',
        role: 'admin',
        createdAt: new Date().toISOString(),
      }

      return {
        success: true,
        data: user,
      }
    }

    // In a real app, you would:
    // 1. Query your database for the user
    // 2. Verify the password hash
    // 3. Generate and return a JWT token
    // 4. Set secure cookies

    /*
    // Example with database query:
    const user = await getUserByEmail(email)
    if (!user || !await verifyPassword(password, user.passwordHash)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
    
    const token = generateJWT(user)
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
    */

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
