import { useState } from 'react'
import type { Post } from '../lib/posts'
import PostCard from './PostCard'

const PAGE_SIZE = 5

export default function PostList({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = posts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  if (posts.length === 0) return <p className="empty">No posts found.</p>

  return (
    <>
      <div className="post-list">
        {visible.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
      {pages > 1 && (
        <nav className="pagination">
          <button disabled={current === 1} onClick={() => setPage(current - 1)}>← Newer</button>
          <span>Page {current} of {pages}</span>
          <button disabled={current === pages} onClick={() => setPage(current + 1)}>Older →</button>
        </nav>
      )}
    </>
  )
}
