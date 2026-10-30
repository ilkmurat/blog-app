import { Link, useParams } from 'react-router-dom'
import PostList from '../components/PostList'
import Status from '../components/Status'
import { api } from '../lib/api'
import { useApi } from '../lib/hooks'
import NotFound from './NotFound'

export default function Taxonomy({ kind }: { kind: 'category' | 'tag' }) {
  const { slug = '' } = useParams()
  const state = useApi(kind === 'category' ? api.categories : api.tags, [kind])

  return (
    <Status state={state}>
      {(terms) => {
        const entry = terms.find((t) => t.slug === slug)
        if (!entry) return <NotFound />
        return (
          <>
            <Link to={kind === 'category' ? '/categories' : '/tags'} className="back">
              ← All {kind === 'category' ? 'categories' : 'tags'}
            </Link>
            <h1 className="page-title">
              {kind === 'category' ? entry.name : `#${entry.name}`}
              <small>{entry.post_count} {entry.post_count === 1 ? 'post' : 'posts'}</small>
            </h1>
            <PostList key={`${kind}-${slug}`} filters={{ [kind]: slug }} />
          </>
        )
      }}
    </Status>
  )
}
