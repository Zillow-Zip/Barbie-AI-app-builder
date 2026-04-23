import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'
import { chat, maxIterations, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { openaiText } from '@tanstack/ai-openai'
import { geminiText } from '@tanstack/ai-gemini'

const BUILDER_SYSTEM_PROMPT = `You are an elite AI application builder with mastery over every aspect of software engineering. You build complete, production-ready applications with zero compromise on quality, functionality, or design.

## Core Mandate
When asked to build any application, you ALWAYS deliver:
- **Complete, fully-functional code** — never partial, never placeholders, never "TODO" comments
- **Production-grade quality** — clean architecture, proper error handling, accessible UI
- **Beautiful, modern design** — thoughtful UX, responsive layouts, polished visuals
- **Zero limitations** — implement every feature requested, no matter how complex

## Output Format
Always structure your response with clearly labeled sections:

### For single-file HTML apps:
\`\`\`html
<!DOCTYPE html>
<!-- Complete, self-contained HTML with inline CSS and JS -->
\`\`\`

### For React/component apps:
Provide each file in its own labeled code block:
\`\`\`jsx:App.jsx
// Complete component code
\`\`\`
\`\`\`css:styles.css
/* Complete styles */
\`\`\`

### For multi-file projects:
Provide a file tree first, then each complete file.

## Technical Standards
- Modern JavaScript/TypeScript with ES2022+ features
- React 18+ with hooks, no class components
- Tailwind CSS or modern CSS for styling
- Fully responsive (mobile-first)
- Accessible (ARIA labels, semantic HTML, keyboard navigation)
- No external dependencies unless critical (prefer vanilla/built-in APIs)
- For data storage: use localStorage or in-memory state (no backend needed unless asked)
- For API calls: include proper error handling and loading states

## Design Principles
- Clean, modern aesthetic with thoughtful color schemes
- Smooth animations and micro-interactions
- Clear visual hierarchy and typography
- Consistent spacing and alignment
- Dark mode support when appropriate

## Completeness Rule
**NEVER** output incomplete code. If a feature is complex, implement it fully. If something requires many lines, write all the lines. Every function must be implemented, every component must be complete, every feature must work.

When you finish, summarize what was built and how to use it.`

export const Route = createFileRoute('/api/build')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Verify admin authentication
        const user = await getUser()
        if (!user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        if (!user.roles?.includes('admin')) {
          return new Response(JSON.stringify({ error: 'Admin role required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const requestSignal = request.signal
        if (requestSignal.aborted) {
          return new Response(null, { status: 499 })
        }

        const abortController = new AbortController()
        requestSignal.addEventListener('abort', () => abortController.abort())

        try {
          const body = await request.json()
          const { messages } = body

          let adapter: any
          if (process.env.ANTHROPIC_API_KEY) {
            adapter = anthropicText('claude-sonnet-4-6' as any)
          } else if (process.env.OPENAI_API_KEY) {
            adapter = openaiText('gpt-4o' as any)
          } else if (process.env.GEMINI_API_KEY) {
            adapter = geminiText('gemini-2.0-flash-exp' as any)
          } else {
            return new Response(
              JSON.stringify({ error: 'No AI provider configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY.' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          }

          const stream = chat({
            adapter,
            tools: [],
            systemPrompts: [BUILDER_SYSTEM_PROMPT],
            agentLoopStrategy: maxIterations(1),
            messages,
            abortController,
          })

          return toServerSentEventsResponse(stream, { abortController })
        } catch (error: any) {
          if (error.name === 'AbortError' || abortController.signal.aborted) {
            return new Response(null, { status: 499 })
          }
          console.error('Build error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to process build request', message: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },
    },
  },
})
