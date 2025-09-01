export default defineEventHandler(async (event) => {
  try {
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock pricing plans data
    // In a real app, this would come from your database
    const plans = [
      {
        id: 1,
        name: 'Starter',
        description: 'Perfect for individuals and small projects',
        price: 9,
        currency: 'USD',
        interval: 'month' as const,
        features: ['Up to 5 projects', '10GB storage', 'Basic support', 'Community access'],
        popular: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Pro',
        description: 'Best for growing teams and businesses',
        price: 29,
        currency: 'USD',
        interval: 'month' as const,
        features: [
          'Unlimited projects',
          '100GB storage',
          'Priority support',
          'Advanced features',
          'Team collaboration',
        ],
        popular: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 3,
        name: 'Enterprise',
        description: 'For large organizations with custom needs',
        price: 99,
        currency: 'USD',
        interval: 'month' as const,
        features: [
          'Everything in Pro',
          'Unlimited storage',
          '24/7 dedicated support',
          'Custom integrations',
          'SSO & compliance',
        ],
        popular: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    /*
    // Example with real database query:
    const plans = await db.query(`
      SELECT id, name, description, price, currency, interval, features, popular, created_at
      FROM plans 
      WHERE active = true 
      ORDER BY price ASC
    `)
    */

    return {
      success: true,
      data: plans,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch pricing plans',
    })
  }
})
