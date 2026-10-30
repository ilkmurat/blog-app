import { useState } from 'react'
import { api, type ListParams } from '../lib/api'
import { useApi } from '../lib/hooks'
import PostCard from './PostCard'
import Status from './Status'

const PAGE_SIZE = 5

/** Server-paginated post list. Remount (via `key`) to reset to page 1 when filters change. */
export default function PostList({ filters = {} }: { filters?: Omit<ListParams, 'page' | 'page_size'> }) {
  const [page, setPage] = useState(1)
  const state = useApi(
    () => api.listPosts({ ...filters, page, page_size: PAGE_SIZE }),
    [page, filters.category, filters.tag, filters.q],
  )

  return (
    <Status state={state}>
      {(data) =>
        data.items.length === 0 ? (
          <p className="empty">No posts found.</p>
        ) : (
          <>
            <div className="post-list">
              {data.items.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
            {data.pages > 1 && (
              <nav className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Newer</button>
                <span>Page {page} of {data.pages}</span>
                <button disabled={page === data.pages} onClick={() => setPage(page + 1)}>Older →</button>
              </nav>
            )}
          </>
        )
      }
    </Status>
  )
}
