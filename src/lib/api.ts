import type { Post, PostInput, PostPage, SearchHit, TermWithCount } from './types'

// Empty by default: requests go to the same origin (nginx in Docker, Vite proxy in dev).
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = Array.isArray(body.detail)
        ? body.detail.map((d: { loc?: string[]; msg: string }) => `${d.loc?.at(-1) ?? ''}: ${d.msg}`).join('; ')
        : body.detail ?? message
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, message)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  return entries.length ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])) : ''
}

export interface ListParams {
  page?: number
  page_size?: number
  category?: string
  tag?: string
  q?: string
}

export const api = {
  listPosts: (params: ListParams = {}) => request<PostPage>(`/api/v1/posts${qs({ ...params })}`),
  searchPosts: (q: string, limit = 10) =>
    request<{ items: SearchHit[] }>(`/api/v1/posts/search${qs({ q, limit })}`).then((r) => r.items),
  getPost: (slug: string) => request<Post>(`/api/v1/posts/${encodeURIComponent(slug)}`),
  createPost: (body: PostInput) => request<Post>('/api/v1/posts', { method: 'POST', body: JSON.stringify(body) }),
  updatePost: (slug: string, body: Partial<PostInput>) =>
    request<Post>(`/api/v1/posts/${encodeURIComponent(slug)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletePost: (slug: string) => request<void>(`/api/v1/posts/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
  categories: () => request<TermWithCount[]>('/api/v1/categories'),
  tags: () => request<TermWithCount[]>('/api/v1/tags'),
}
