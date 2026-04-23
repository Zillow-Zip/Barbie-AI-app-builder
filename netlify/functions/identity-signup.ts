import type { Handler, HandlerEvent } from '@netlify/functions'

/**
 * Assigns the 'admin' role to users whose email matches ADMIN_EMAILS env var.
 * Set ADMIN_EMAILS as a comma-separated list of admin email addresses.
 * Configure this webhook in Netlify dashboard > Identity > Notifications > Signup.
 */
const handler: Handler = async (event: HandlerEvent) => {
  const payload = JSON.parse(event.body || '{}')
  const email: string = payload?.email || ''

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const isAdmin = adminEmails.length === 0 || adminEmails.includes(email.toLowerCase())

  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: {
        roles: isAdmin ? ['admin'] : ['user'],
      },
    }),
  }
}

export { handler }
