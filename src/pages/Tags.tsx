import { Link } from 'react-router-dom'
import { tags } from '../lib/posts'

export default function Tags() {
  return (
    <>
      <h1 className="page-title">Tags</h1>
      <div className="tag-cloud large">
        {tags.map((t) => (
          <Link key={t.slug} to={`/tag/${t.slug}`} className="tag">
            #{t.name} <span className="count">{t.count}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
