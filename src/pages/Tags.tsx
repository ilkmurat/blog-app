import { Link } from 'react-router-dom'
import Status from '../components/Status'
import { api } from '../lib/api'
import { useApi } from '../lib/hooks'

export default function Tags() {
  const state = useApi(api.tags, [])
  return (
    <>
      <h1 className="page-title">Tags</h1>
      <Status state={state}>
        {(tags) => (
          <div className="tag-cloud large">
            {tags.map((t) => (
              <Link key={t.slug} to={`/tag/${t.slug}`} className="tag">
                #{t.name} <span className="count">{t.post_count}</span>
              </Link>
            ))}
          </div>
        )}
      </Status>
    </>
  )
}
