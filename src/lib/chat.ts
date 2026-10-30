import { apiFetch, errorFrom } from './api'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export type ChatEvent =
  | { type: 'tool_start'; name: string; args: Record<string, unknown> }
  | { type: 'tool_end'; name: string; ok: boolean }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; detail: string }

/** The agent accepts at most 20 messages; keep the most recent ones, starting with a user turn. */
function trimHistory(messages: ChatTurn[]): ChatTurn[] {
  const recent = messages.slice(-20)
  const firstUser = recent.findIndex((m) => m.role === 'user')
  return firstUser > 0 ? recent.slice(firstUser) : recent
}

/** POSTs the conversation and calls `onEvent` for each Server-Sent Event of the reply. */
export async function streamChat(
  messages: ChatTurn[],
  onEvent: (event: ChatEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await apiFetch('/agent/v1/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: trimHistory(messages) }),
    signal,
  })
  if (!res.ok || !res.body) throw await errorFrom(res)

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value
    let end: number
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      let type = 'message'
      let data = ''
      for (const line of block.split('\n')) {
        if (line.startsWith('event: ')) type = line.slice(7)
        else if (line.startsWith('data: ')) data += line.slice(6)
      }
      onEvent({ type, ...JSON.parse(data || '{}') } as ChatEvent)
    }
  }
}
