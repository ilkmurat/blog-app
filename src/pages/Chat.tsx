import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import Markdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { useAuth } from '../lib/auth'
import { streamChat, type ChatTurn } from '../lib/chat'

interface ToolUse {
  name: string
  args: Record<string, unknown>
  status: 'running' | 'ok' | 'failed'
}

interface Message extends ChatTurn {
  tools?: ToolUse[]
  error?: string
  pending?: boolean
}

const TOOL_LABELS: Record<string, string> = {
  list_posts: 'Listing posts',
  top_liked_posts: 'Finding the most liked posts',
  search_posts: 'Searching posts',
  get_post: 'Reading a post',
  list_categories: 'Listing categories',
  list_tags: 'Listing tags',
  site_stats: 'Checking site stats',
  user_stats: 'Counting users',
  admin_list_users: 'Listing users (admin)',
}

const SUGGESTIONS = [
  'Web Development kategorisindeki yazıları getir',
  'En çok hangi yazı beğenildi?',
  'Kaç kullanıcı var? Son 7 günde kaç kişi giriş yaptı?',
  'Which posts talk about staying focused?',
]

function describeArgs(args: Record<string, unknown>): string {
  return Object.entries(args)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join(', ')
}

function AnswerMarkdown({ text }: { text: string }) {
  return (
    <Markdown
      components={{
        // Site links stay inside the app; external links open in a new tab.
        a: ({ href = '', children }) =>
          href.startsWith('/') ? (
            <Link to={href}>{children}</Link>
          ) : (
            <a href={href} target="_blank" rel="noreferrer">{children}</a>
          ),
      }}
    >
      {text}
    </Markdown>
  )
}

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  /** Applies `change` to the assistant message being streamed (always the last one). */
  const updateLast = (change: (m: Message) => Message) =>
    setMessages((all) => [...all.slice(0, -1), change(all[all.length - 1])])

  async function send(text: string) {
    const question = text.trim()
    if (!question || busy) return
    const history: ChatTurn[] = [
      ...messages.filter((m) => !m.error && m.content).map(({ role, content }) => ({ role, content })),
      { role: 'user', content: question },
    ]
    setMessages((all) => [...all, { role: 'user', content: question }, { role: 'assistant', content: '', tools: [], pending: true }])
    setInput('')
    setBusy(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamChat(
        history,
        (event) => {
          switch (event.type) {
            case 'token':
              updateLast((m) => ({ ...m, content: m.content + event.text }))
              break
            case 'tool_start':
              updateLast((m) => ({ ...m, tools: [...(m.tools ?? []), { name: event.name, args: event.args, status: 'running' }] }))
              break
            case 'tool_end':
              updateLast((m) => {
                const tools = [...(m.tools ?? [])]
                const i = tools.findIndex((t) => t.name === event.name && t.status === 'running')
                if (i >= 0) tools[i] = { ...tools[i], status: event.ok ? 'ok' : 'failed' }
                return { ...m, tools }
              })
              break
            case 'error':
              updateLast((m) => ({ ...m, error: event.detail }))
              break
          }
        },
        controller.signal,
      )
    } catch (e) {
      if (controller.signal.aborted) {
        updateLast((m) => ({ ...m, error: m.content ? undefined : 'Stopped.' }))
      } else {
        const message =
          e instanceof ApiError && e.status === 429
            ? 'You are asking too fast — please wait a moment and try again.'
            : `Couldn't reach the assistant: ${(e as Error).message}`
        updateLast((m) => ({ ...m, error: message }))
      }
    } finally {
      updateLast((m) => ({ ...m, pending: false }))
      setBusy(false)
      abortRef.current = null
      inputRef.current?.focus()
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    void send(input)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void send(input)
    }
  }

  return (
    <div className="chat">
      <div className="chat-head">
        <h1 className="page-title">Ask Inkwell</h1>
        <p className="muted">
          Ask about posts, categories, tags, likes and site statistics — in Turkish or English.
          {user?.is_admin && ' As an admin you can also ask about users.'}
        </p>
        {messages.length > 0 && (
          <button className="link-button" onClick={() => setMessages([])} disabled={busy}>New chat</button>
        )}
      </div>

      <div className="chat-log" aria-live="polite">
        {messages.length === 0 && (
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="bubble user">{m.content}</div>
          ) : (
            <div key={i} className="bubble assistant">
              {m.tools && m.tools.length > 0 && (
                <ul className="tool-uses">
                  {m.tools.map((t, j) => (
                    <li key={j} className={`tool-use ${t.status}`}>
                      <span className="tool-dot" aria-hidden="true" />
                      {TOOL_LABELS[t.name] ?? t.name}
                      {Object.keys(t.args).length > 0 && <span className="tool-args">{describeArgs(t.args)}</span>}
                    </li>
                  ))}
                </ul>
              )}
              {m.content ? (
                <div className="prose answer"><AnswerMarkdown text={m.content} /></div>
              ) : (
                m.pending && !m.error && <div className="thinking" aria-label="Thinking"><span /><span /><span /></div>
              )}
              {m.error && <p className="error">{m.error}</p>}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={submit}>
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Ask something about the blog…"
          value={input}
          maxLength={4000}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Your question"
        />
        {busy ? (
          <button type="button" className="button" onClick={() => abortRef.current?.abort()}>Stop</button>
        ) : (
          <button type="submit" className="button primary" disabled={!input.trim()}>Send</button>
        )}
      </form>
    </div>
  )
}
