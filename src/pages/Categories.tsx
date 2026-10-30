import { Link } from 'react-router-dom'
import { categories } from '../lib/posts'

export default function Categories() {
  return (
    <>
      <h1 className="page-title">Categories</h1>
      <div className="category-grid">
        {categories.map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`} className="category-tile">
            <strong>{c.name}</strong>
            <span>{c.count} {c.count === 1 ? 'post' : 'posts'}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
