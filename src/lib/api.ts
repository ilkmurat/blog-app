import type {
  AuthResponse,
  HrDocument,
  LikeResult,
  Post,
  PostInput,
  PostPage,
  SearchHit,
  TermWithCount,
  User,
  UserInput,
} from './types'

// Empty by default: requests go to the same origin (nginx in Docker, Vite proxy in dev).
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

let authToken: string | null = null

/** Set by the auth provider; sent as a bearer token on every request. */
export function setAuthToken(token: string | null) {
  authToken = token
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Builds an ApiError from a failed response, using FastAPI's `detail` when present. */
export async function errorFrom(res: Response): Promise<ApiError> {
  let message = res.statusText
  try {
    const body = await res.json()
    message = Array.isArray(body.detail)
      ? body.detail.map((d: { loc?: string[]; msg: string }) => `${d.loc?.at(-1) ?? ''}: ${d.msg}`).join('; ')
      : body.detail ?? message
  } catch {
    // non-JSON error body
  }
  return new ApiError(res.status, message)
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(BASE + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers,
    },
  })
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init)
  if (!res.ok) throw await errorFrom(res)
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
  likePost: (slug: string) => request<LikeResult>(`/api/v1/posts/${encodeURIComponent(slug)}/like`, { method: 'POST' }),
  categories: () => request<TermWithCount[]>('/api/v1/categories'),
  tags: () => request<TermWithCount[]>('/api/v1/tags'),
  createCategory: (name: string) =>
    request<TermWithCount>('/api/v1/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  createTag: (name: string) => request<TermWithCount>('/api/v1/tags', { method: 'POST', body: JSON.stringify({ name }) }),

  register: (body: UserInput) =>
    request<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (username: string, password: string) =>
    request<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request<void>('/api/v1/auth/logout', { method: 'POST' }),
  me: () => request<User>('/api/v1/auth/me'),
  users: () => request<User[]>('/api/v1/users'),

  hrDocuments: () => request<HrDocument[]>('/api/v1/hr/documents'),
  deleteHrDocument: (id: number) => request<void>(`/api/v1/hr/documents/${id}`, { method: 'DELETE' }),
  /** multipart upload: let the browser set the Content-Type boundary */
  uploadHrDocument: async (file: File, title: string, topic: string) => {
    const form = new FormData()
    form.append('file', file)
    if (title) form.append('title', title)
    if (topic) form.append('topic', topic)
    const res = await fetch(BASE + '/api/v1/hr/documents', {
      method: 'POST',
      body: form,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    })
    if (!res.ok) throw await errorFrom(res)
    return (await res.json()) as HrDocument
  },
  createUser: (body: UserInput) => request<User>('/api/v1/users', { method: 'POST', body: JSON.stringify(body) }),
}
