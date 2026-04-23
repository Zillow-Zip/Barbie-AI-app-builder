import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Send, Square, Copy, Check, Download, Eye, Code2, LogOut, Sparkles, ChevronDown } from 'lucide-react'
import { Streamdown } from 'streamdown'
import { getServerUser } from '@/lib/auth'
import { useIdentity } from '@/lib/identity-context'
import {
  fetchServerSentEvents,
  useChat,
  createChatClientOptions,
} from '@tanstack/ai-react'

export const Route = createFileRoute('/builder')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    if (!user.roles?.includes('admin')) {
      throw redirect({ to: '/unauthorized' })
    }
    return { user }
  },
  component: BuilderPage,
})

const builderChatOptions = createChatClientOptions({
  connection: fetchServerSentEvents('/api/build'),
})

function extractCodeBlocks(text: string): { html: string | null; files: Array<{ name: string; content: string; lang: string }> } {
  const htmlMatch = text.match(/```html\n([\s\S]*?)```/)
  const html = htmlMatch ? htmlMatch[1] : null

  const fileMatches = [...text.matchAll(/```(\w+):([^\n]+)\n([\s\S]*?)```/g)]
  const files = fileMatches.map(m => ({
    lang: m[1],
    name: m[2].trim(),
    content: m[3],
  }))

  return { html, files }
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{lang || 'code'}</span>
        <button
          onClick={copy}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function PreviewPane({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }
    }
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0 bg-white rounded-lg"
      sandbox="allow-scripts allow-same-origin"
      title="App Preview"
    />
  )
}

function MessageContent({ content }: { content: string }) {
  const { html, files } = extractCodeBlocks(content)
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>(html ? 'preview' : 'code')

  const downloadHtml = () => {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'app.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="prose prose-invert prose-sm max-w-none">
        <Streamdown>{content}</Streamdown>
      </div>
      {html && (
        <div className="mt-4 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === 'preview' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === 'code' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Code
              </button>
            </div>
            <button
              onClick={downloadHtml}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
          <div className={activeTab === 'preview' ? 'h-[500px] bg-white' : 'hidden'}>
            <PreviewPane html={html} />
          </div>
          {activeTab === 'code' && (
            <CodeBlock code={html} lang="html" />
          )}
        </div>
      )}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.name}>
              <p className="text-xs text-gray-500 mb-1 font-mono">{file.name}</p>
              <CodeBlock code={file.content} lang={file.lang} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const EXAMPLE_PROMPTS = [
  'Build a fully functional todo app with drag-and-drop reordering, priorities, and local storage',
  'Create a beautiful personal finance tracker with charts, categories, and budget alerts',
  'Build a Pomodoro timer with sessions, breaks, stats tracking, and sound notifications',
  'Create a markdown editor with live preview, syntax highlighting, and export to PDF',
  'Build a habit tracker with streaks, calendar view, and motivational statistics',
  'Create a password generator with strength meter, history, and copy-to-clipboard',
]

function BuilderPage() {
  const { user, logout } = useIdentity()
  const navigate = useNavigate()
  const { messages, sendMessage, isLoading, stop } = useChat(builderChatOptions)
  const [input, setInput] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input.trim())
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">AI App Builder</h1>
            <p className="text-gray-500 text-xs mt-0.5">Admin Console</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-400 hidden sm:block">
              {user.name || user.email}
            </span>
          )}
          <span className="px-2 py-0.5 bg-violet-900/50 border border-violet-700 text-violet-300 text-xs rounded-full font-medium">
            Admin
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-6 gap-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mb-6 border border-violet-700/50">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Build any app instantly
            </h2>
            <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">
              Describe the application you want to build. The AI will generate complete,
              production-ready code with no limitations — every feature, fully implemented.
            </p>

            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
            >
              Example prompts
              <ChevronDown className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
            </button>

            {showExamples && (
              <div className="grid gap-2 w-full max-w-2xl">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt)
                      setShowExamples(false)
                      textareaRef.current?.focus()
                    }}
                    className="text-left px-4 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm'
                    : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'
                }`}>
                  {message.parts.map((part, i) => {
                    if (part.type === 'text' && part.content) {
                      if (message.role === 'assistant') {
                        return <MessageContent key={i} content={part.content} />
                      }
                      return <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">{part.content}</p>
                    }
                    return null
                  })}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold text-gray-300">
                    {(user?.name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-400">Building your app...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input area */}
        <div className="sticky bottom-0 pb-4">
          {isLoading && (
            <div className="flex justify-center mb-3">
              <button
                onClick={stop}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop generating
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-3 items-end bg-gray-900 border border-gray-700 rounded-2xl p-3 focus-within:border-violet-600 transition-colors shadow-xl">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Describe the app you want to build..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm leading-relaxed min-h-[24px] max-h-[200px] py-1"
                style={{ height: 'auto' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-9 h-9 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
