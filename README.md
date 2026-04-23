# AI App Builder

An admin-only AI-powered application builder that generates complete, production-ready apps from natural language descriptions. Built with TanStack Start and deployed on Netlify.

## What It Does

Describe any application in plain English and the AI instantly generates fully functional, complete code — no placeholders, no TODOs, no limitations. Every feature requested is implemented. The builder supports:

- **Live preview** — see the generated app running instantly in an iframe
- **Code view** — inspect and copy the full source code
- **Download** — save the generated HTML app file locally
- **Multi-turn conversation** — refine and extend apps through follow-up prompts

Access is restricted to admin users only via Netlify Identity role-based authentication.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Auth | Netlify Identity (`@netlify/identity`) |
| AI | TanStack AI (Anthropic Claude / OpenAI / Gemini) |
| Deployment | Netlify |

## Running Locally

> **Note:** Netlify Identity authentication only works on deployed Netlify environments, not localhost. For local development, the app will start but auth flows won't function.

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

Set at least one AI provider API key:

```env
ANTHROPIC_API_KEY=...     # Preferred (uses claude-sonnet-4-6)
OPENAI_API_KEY=...        # Fallback (uses gpt-4o)
GEMINI_API_KEY=...        # Fallback (uses gemini-2.0-flash-exp)
```

To control which users get admin access:

```env
ADMIN_EMAILS=admin@example.com,other@example.com
```

If `ADMIN_EMAILS` is not set, all new signups receive the admin role.

## Admin Setup

1. Deploy the site to Netlify
2. Go to **Project configuration > Identity** and set Registration to **Invite only** (recommended)
3. Invite your admin user via the Netlify dashboard
4. Configure the signup webhook: **Identity > Notifications > Signup** → point to `/.netlify/functions/identity-signup`
5. Set `ADMIN_EMAILS` in your Netlify environment variables

## Usage

1. Navigate to the deployed site — you'll be redirected to `/login`
2. Sign in with your admin credentials
3. Describe any app you want to build in the chat input
4. The AI generates complete code; use the **Preview** tab to see it live or **Download** to save it
5. Continue the conversation to refine or extend the app
