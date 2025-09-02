import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { query } from '../../../utils/db'
import { CustomError } from '../../../utils/custom.error'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { code, state } = body

  if (!code || !state) {
    throw new CustomError('Missing code or state from Slack', 400)
  }

  let orgId: string
  try {
    const decoded = jwt.verify(state, config.jwtToken as string) as { org_id: string }
    orgId = decoded.org_id
  } catch {
    throw new CustomError('Invalid or expired state', 400)
  }

  // Exchange code for access token
  const requestBody = new URLSearchParams({
    client_id: config.public.slackClientId.replace("-", "."),
    client_secret: config.slackClientSecret,
    code,
    redirect_uri: config.public.slackRedirectUri as string,
  })

  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: requestBody,
  })

  const data = await response.json()

  if (!data.ok) {
    throw new CustomError(`Slack error: ${data.error}`, 400)
  }

  const {
    access_token,
    team: { id: team_id, name: team_name },
    authed_user: { id: installed_by_user_id },
  } = data

  try {
    await query('BEGIN')

    const conflictCheck = await query(
      `SELECT * FROM slack_team_mappings WHERE team_id = $1 AND org_id != $2 AND status = 'active' LIMIT 1`,
      [team_id, orgId]
    )

    if (conflictCheck.rows.length > 0) {
      throw new CustomError('This Slack workspace is already connected to another organization.', 403)
    }

    await query(
      `DELETE FROM slack_team_mappings WHERE org_id = $1 AND status = 'inactive'`,
      [orgId]
    )

    await query(
      `DELETE FROM slack_team_mappings WHERE team_id = $1 AND status = 'inactive'`,
      [team_id]
    )

    const teamCheck = await query(
      `SELECT * FROM slack_team_mappings WHERE team_id = $1 LIMIT 1`,
      [team_id]
    )

    if (teamCheck.rows.length > 0) {
      await query(
        `UPDATE slack_team_mappings SET org_id = $1, team_name = $2, access_token = $3, installed_by_user_id = $4, updated_at = NOW(), status = 'active' WHERE team_id = $5`,
        [orgId, team_name, access_token, installed_by_user_id, team_id]
      )
    } else {
      const orgCheck = await query(
        `SELECT * FROM slack_team_mappings WHERE org_id = $1 LIMIT 1`,
        [orgId]
      )

      if (orgCheck.rows.length > 0) {
        await query(
          `UPDATE slack_team_mappings SET team_id = $1, team_name = $2, access_token = $3, installed_by_user_id = $4, updated_at = NOW(), status = 'active' WHERE org_id = $5`,
          [team_id, team_name, access_token, installed_by_user_id, orgId]
        )
      } else {
        await query(
          `INSERT INTO slack_team_mappings (team_id, org_id, team_name, access_token, installed_by_user_id, updated_at, status) VALUES ($1, $2, $3, $4, $5, NOW(), 'active')`,
          [team_id, orgId, team_name, access_token, installed_by_user_id]
        )
      }
    }

    await query('COMMIT')
  } catch (error) {
    await query('ROLLBACK')
    throw error
  }

  setResponseStatus(event, 201)
  return {
    statusCode: 201,
    message: 'Slack connected successfully',
    data: {
      teamId: team_id,
      teamName: team_name,
      installedBy: installed_by_user_id,
    },
  }
})
