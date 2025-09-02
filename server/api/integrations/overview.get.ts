import { defineEventHandler, setResponseStatus } from 'h3'
import { query } from '../../utils/db'
import { CustomError } from '../../utils/custom.error'
import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'

dayjs.extend(utc)

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = event.node.req.headers['authorization']?.split(' ')[1]

  if (!token) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let userId
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string)
    userId = (decodedToken as { user_id: string }).user_id
  } catch {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  try {
    // Get user's organization
    const userOrg = await query('SELECT org_id FROM users WHERE user_id = $1', [userId])
    if (!userOrg?.rows?.length) {
      setResponseStatus(event, 404)
      throw new CustomError('User not found or organization not assigned', 404)
    }

    const orgId = userOrg.rows[0].org_id

    // Get user counts by integration type
    const userCountsQuery = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE added_by IS NULL OR (added_by != 'slack_auto_provision' AND added_by != 'teams_auto_provision')) as whatsapp_users,
        COUNT(*) FILTER (WHERE added_by = 'slack_auto_provision') as slack_users,
        COUNT(*) FILTER (WHERE added_by = 'teams_auto_provision') as teams_users,
        COUNT(*) as total_users
      FROM users 
      WHERE org_id = $1`,
      [orgId]
    )

    // Get integration status
    const integrationStatusQuery = await query(
      `SELECT 
        CASE WHEN w.whatsapp_status = true THEN 'connected' ELSE 'disconnected' END as whatsapp_status,
        CASE WHEN s.status = 'active' THEN 'connected' ELSE 'disconnected' END as slack_status,
        CASE WHEN t.status = 'active' THEN 'connected' ELSE 'disconnected' END as teams_status
      FROM organizations o
      LEFT JOIN meta_app_details w ON o.org_id = w.org_id
      LEFT JOIN slack_team_mappings s ON o.org_id = s.org_id
      LEFT JOIN teams_tenant_mappings t ON o.org_id = t.org_id
      WHERE o.org_id = $1
      LIMIT 1`,
      [orgId]
    )

    // Get today's messages and token usage
    const today = dayjs.utc().format('YYYY-MM-DD')
    const tokenUsageQuery = await query(
      `SELECT 
        COUNT(*) as messages_today,
        COALESCE(SUM(total_tokens), 0) as total_tokens_today,
        COALESCE(SUM(total_cost), 0) as total_cost_today
      FROM token_cost_calculation 
      WHERE org_id = $1 
      AND DATE(created_at) = $2`,
      [orgId, today]
    )

    // Get total token usage (all time)
    const totalTokenUsageQuery = await query(
      `SELECT 
        COUNT(*) as total_messages,
        COALESCE(SUM(total_tokens), 0) as total_tokens_all_time,
        COALESCE(SUM(total_cost), 0) as total_cost_all_time
      FROM token_cost_calculation 
      WHERE org_id = $1`,
      [orgId]
    )

    // Get integration details
    const integrationDetailsQuery = await query(
      `SELECT 
        w.meta_whatsapp_number,
        w.whatsapp_status,
        s.team_name as slack_team_name,
        s.status as slack_status,
        t.status as teams_status,
        t.service_url as teams_service_url
      FROM organizations o
      LEFT JOIN meta_app_details w ON o.org_id = w.org_id
      LEFT JOIN slack_team_mappings s ON o.org_id = s.org_id
      LEFT JOIN teams_tenant_mappings t ON o.org_id = t.org_id
      WHERE o.org_id = $1`,
      [orgId]
    )

    const userCounts = userCountsQuery.rows[0] || {
      whatsapp_users: 0,
      slack_users: 0,
      teams_users: 0,
      total_users: 0
    }

    const integrationStatus = integrationStatusQuery.rows[0] || {
      whatsapp_status: 'disconnected',
      slack_status: 'disconnected',
      teams_status: 'disconnected'
    }

    const tokenUsageToday = tokenUsageQuery.rows[0] || {
      messages_today: 0,
      total_tokens_today: 0,
      total_cost_today: 0
    }

    const totalTokenUsage = totalTokenUsageQuery.rows[0] || {
      total_messages: 0,
      total_tokens_all_time: 0,
      total_cost_all_time: 0
    }

    const integrationDetails = integrationDetailsQuery.rows[0] || {}

    // Format response data
    const overview = {
      userCounts: {
        whatsapp: parseInt(userCounts.whatsapp_users),
        slack: parseInt(userCounts.slack_users),
        teams: parseInt(userCounts.teams_users),
        total: parseInt(userCounts.total_users)
      },
      integrationStatus: {
        whatsapp: integrationStatus.whatsapp_status || 'disconnected',
        slack: integrationStatus.slack_status || 'disconnected',
        teams: integrationStatus.teams_status || 'disconnected'
      },
      tokenUsage: {
        today: {
          messages: parseInt(tokenUsageToday.messages_today),
          tokens: parseInt(tokenUsageToday.total_tokens_today),
          cost: parseFloat(tokenUsageToday.total_cost_today || 0)
        },
        allTime: {
          messages: parseInt(totalTokenUsage.total_messages),
          tokens: parseInt(totalTokenUsage.total_tokens_all_time),
          cost: parseFloat(totalTokenUsage.total_cost_all_time || 0)
        }
      },
      integrationDetails: {
        whatsapp: {
          phoneNumber: integrationDetails.meta_whatsapp_number || null,
          status: integrationDetails.whatsapp_status || false
        },
        slack: {
          teamName: integrationDetails.slack_team_name || null,
          status: integrationDetails.slack_status || 'inactive'
        },
        teams: {
          status: integrationDetails.teams_status || 'inactive',
          serviceUrl: integrationDetails.teams_service_url || null
        }
      }
    }

    setResponseStatus(event, 200)
    return {
      statusCode: 200,
      status: 'success',
      data: overview,
      message: 'Integrations overview fetched successfully'
    }

  } catch (error: any) {
    console.error('Integrations Overview Error:', error)

    if (error instanceof CustomError) {
      setResponseStatus(event, error.statusCode)
      return {
        statusCode: error.statusCode,
        status: 'error',
        message: error.message
      }
    }

    setResponseStatus(event, 500)
    return {
      statusCode: 500,
      status: 'error',
      message: 'Failed to fetch integrations overview'
    }
  }
})
