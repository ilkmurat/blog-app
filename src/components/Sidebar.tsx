import { Link } from 'react-router-dom'
import { categories, posts, tags } from '../lib/posts'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <section className="widget">
        <h3>Categories</h3>
        <ul className="category-list">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link to={`/category/${c.slug}`}>{c.name}</Link>
              <span className="count">{c.count}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="widget">
        <h3>Tags</h3>
        <div className="tag-cloud">
          {tags.map((t) => (
            <Link key={t.slug} to={`/tag/${t.slug}`} className="tag">#{t.name}</Link>
          ))}
        </div>
      </section>
      <section className="widget">
        <h3>Recent posts</h3>
        <ul className="recent-list">
          {posts.slice(0, 4).map((p) => (
            <li key={p.slug}><Link to={`/post/${p.slug}`}>{p.title}</Link></li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
