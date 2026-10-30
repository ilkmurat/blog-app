import { useMemo, useState } from 'react'
import PostList from '../components/PostList'
import { posts } from '../lib/posts'

export default function Home() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) =>
      [p.title, p.excerpt, p.category, ...p.tags].some((f) => f.toLowerCase().includes(q)),
    )
  }, [query])

  return (
    <>
      <section className="hero">
        <h1>Stories, guides & ideas</h1>
        <p>Thoughts on web development, design, and productivity.</p>
        <input
          className="search"
          type="search"
          placeholder="Search posts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>
      <PostList key={query} posts={filtered} />
    </>
  )
}
