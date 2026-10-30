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
}

export interface Post extends PostSummary {
  content: string
  created_at: string
  updated_at: string
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
