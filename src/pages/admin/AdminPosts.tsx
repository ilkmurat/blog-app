import { useState } from 'react'
import { Link } from 'react-router-dom'
import Status from '../../components/Status'
import { api } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { useApi } from '../../lib/hooks'

export default function AdminPosts() {
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const state = useApi(() => api.listPosts({ page, page_size: 20 }), [page, version])
  const [error, setError] = useState<string>()

  async function remove(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await api.deletePost(slug)
      setVersion((v) => v + 1)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <section>
      <div className="section-head">
        <h2>Posts</h2>
        <Link to="/admin/posts/new" className="button primary">+ New post</Link>
      </div>
      {error && <p className="error">{error}</p>}
      <Status state={state}>
        {(data) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Likes</th><th>Published</th><th /></tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.slug}>
                      <td><Link to={`/post/${p.slug}`}>{p.title}</Link></td>
                      <td>{p.category.name}</td>
                      <td>{p.like_count}</td>
                      <td>{formatDate(p.published_at)}</td>
                      <td className="row-actions">
                        <Link to={`/admin/posts/${p.slug}/edit`} className="button">Edit</Link>
                        <button className="button danger" onClick={() => remove(p.slug, p.title)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && <tr><td colSpan={5} className="empty">No posts yet.</td></tr>}
                </tbody>
              </table>
            </div>
            {data.pages > 1 && (
              <nav className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                <span>Page {page} of {data.pages}</span>
                <button disabled={page === data.pages} onClick={() => setPage(page + 1)}>Next →</button>
              </nav>
            )}
          </>
        )}
      </Status>
    </section>
  )
}
