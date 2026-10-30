export interface Term {
  name: string
  slug: string
}

export interface TermWithCount extends Term {
  post_count: number
}

export interface PostSummary {
  id: number
  slug: string
  title: string
  excerpt: string
  author: string
  category: Term
  tags: Term[]
  published_at: string
  reading_time: number
  like_count: number
}

export interface Post extends PostSummary {
  content: string
  created_at: string
  updated_at: string
  liked_by_me: boolean
}

export interface PostPage {
  items: PostSummary[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface SearchHit {
  score: number
  post: PostSummary
}

export interface PostInput {
  title: string
  slug?: string
  excerpt?: string
  content: string
  author?: string
  category: string
  tags: string[]
  published_at?: string
}

export interface LikeResult {
  like_count: number
  liked_by_me: boolean
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_admin: boolean
  created_at: string
}

export interface UserInput {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  is_admin?: boolean
}

export interface AuthResponse {
  token: string
  user: User
}
