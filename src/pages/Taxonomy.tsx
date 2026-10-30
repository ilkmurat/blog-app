import { Link, useParams } from 'react-router-dom'
import PostList from '../components/PostList'
import { categories, postsByCategory, postsByTag, tags } from '../lib/posts'
import NotFound from './NotFound'

export default function Taxonomy({ kind }: { kind: 'category' | 'tag' }) {
  const { slug = '' } = useParams()
  const entry = (kind === 'category' ? categories : tags).find((e) => e.slug === slug)
  if (!entry) return <NotFound />
  const list = kind === 'category' ? postsByCategory(slug) : postsByTag(slug)

  return (
    <>
      <Link to={kind === 'category' ? '/categories' : '/tags'} className="back">
        ← All {kind === 'category' ? 'categories' : 'tags'}
      </Link>
      <h1 className="page-title">
        {kind === 'category' ? entry.name : `#${entry.name}`}
        <small>{list.length} {list.length === 1 ? 'post' : 'posts'}</small>
      </h1>
      <PostList key={slug} posts={list} />
    </>
  )
}
