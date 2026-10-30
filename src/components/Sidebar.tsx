import { Link, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { useApi } from '../lib/hooks'

export default function Sidebar() {
  // Refetch on navigation so counts stay current after creating/deleting posts.
  const { pathname } = useLocation()
  const categories = useApi(api.categories, [pathname])
  const tags = useApi(api.tags, [pathname])
  const recent = useApi(() => api.listPosts({ page_size: 4 }), [pathname])

  return (
    <aside className="sidebar">
      <section className="widget">
        <h3>Categories</h3>
        <ul className="category-list">
          {categories.data?.map((c) => (
            <li key={c.slug}>
              <Link to={`/category/${c.slug}`}>{c.name}</Link>
              <span className="count">{c.post_count}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="widget">
        <h3>Tags</h3>
        <div className="tag-cloud">
          {tags.data?.map((t) => (
            <Link key={t.slug} to={`/tag/${t.slug}`} className="tag">#{t.name}</Link>
          ))}
        </div>
      </section>
      <section className="widget">
        <h3>Recent posts</h3>
        <ul className="recent-list">
          {recent.data?.items.map((p) => (
            <li key={p.slug}><Link to={`/post/${p.slug}`}>{p.title}</Link></li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
