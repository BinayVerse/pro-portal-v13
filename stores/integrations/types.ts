export interface IntegrationsOverview {
  userCounts: {
    whatsapp: number
    slack: number
    teams: number
    total: number
  }
  integrationStatus: {
    whatsapp: 'connected' | 'disconnected'
    slack: 'connected' | 'disconnected'
    teams: 'connected' | 'disconnected'
  }
  tokenUsage: {
    today: {
      messages: number
      tokens: number
      cost: number
    }
    allTime: {
      messages: number
      tokens: number
      cost: number
    }
  }
  integrationDetails: {
    whatsapp: {
      phoneNumber: string | null
      status: boolean
    }
    slack: {
      teamName: string | null
      status: string
    }
    teams: {
      status: string
      serviceUrl: string | null
    }
  }
}

export interface IntegrationActivity {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  message: string
  time: string
  timestamp: Date
}

export interface ApiResponse<T> {
  statusCode: number
  status: 'success' | 'error'
  data: T
  message: string
}
