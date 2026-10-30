import { Link } from 'react-router-dom'
import Status from '../components/Status'
import { api } from '../lib/api'
import { useApi } from '../lib/hooks'

export default function Categories() {
  const state = useApi(api.categories, [])
  return (
    <>
      <h1 className="page-title">Categories</h1>
      <Status state={state}>
        {(categories) => (
          <div className="category-grid">
            {categories.map((c) => (
              <Link key={c.slug} to={`/category/${c.slug}`} className="category-tile">
                <strong>{c.name}</strong>
                <span>{c.post_count} {c.post_count === 1 ? 'post' : 'posts'}</span>
              </Link>
            ))}
          </div>
        )}
      </Status>
    </>
  )
}
