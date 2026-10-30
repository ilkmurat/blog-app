import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Status from '../../components/Status'
import { api } from '../../lib/api'
import { useApi } from '../../lib/hooks'
import type { Post, PostInput, TermWithCount } from '../../lib/types'

interface FormValues {
  title: string
  slug: string
  author: string
  category: string
  tags: string[]
  excerpt: string
  published: string
  content: string
}

const toForm = (post?: Post): FormValues => ({
  title: post?.title ?? '',
  slug: post?.slug ?? '',
  author: post?.author ?? '',
  category: post?.category.name ?? '',
  tags: post?.tags.map((t) => t.name) ?? [],
  excerpt: post?.excerpt ?? '',
  published: (post?.published_at ?? new Date().toISOString()).slice(0, 10),
  content: post?.content ?? '',
})

const toInput = (v: FormValues): PostInput => ({
  title: v.title,
  slug: v.slug || undefined,
  author: v.author || undefined,
  category: v.category,
  tags: v.tags,
  excerpt: v.excerpt || undefined,
  published_at: new Date(`${v.published}T00:00:00Z`).toISOString(),
  content: v.content,
})

function EditorForm({ post, categories, tags }: { post?: Post; categories: TermWithCount[]; tags: TermWithCount[] }) {
  const navigate = useNavigate()
  const [values, setValues] = useState(() => toForm(post))
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const field = (name: Exclude<keyof FormValues, 'tags'>) => ({
    value: values[name],
    onChange: (e: { target: { value: string } }) => setValues({ ...values, [name]: e.target.value }),
  })

  const toggleTag = (name: string) =>
    setValues({ ...values, tags: values.tags.includes(name) ? values.tags.filter((t) => t !== name) : [...values.tags, name] })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(undefined)
    try {
      const saved = post ? await api.updatePost(post.slug, toInput(values)) : await api.createPost(toInput(values))
      navigate(`/post/${saved.slug}`)
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  if (categories.length === 0)
    return (
      <p className="empty">
        Create a category first: <Link to="/admin/categories">Categories</Link>
      </p>
    )

  return (
    <form className="form" onSubmit={submit}>
      <h2>{post ? 'Edit post' : 'New post'}</h2>
      {error && <p className="error">{error}</p>}
      <label>Title<input required maxLength={200} {...field('title')} /></label>
      <div className="row">
        <label>
          Category
          <select required {...field('category')}>
            <option value="" disabled>Choose a category…</option>
            {categories.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
        </label>
        <label>Published<input type="date" required {...field('published')} /></label>
      </div>
      <div className="row">
        <label>
          Slug <small>(optional, from title)</small>
          <input pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="my-post" {...field('slug')} />
        </label>
        <label>Author<input placeholder="Anonymous" {...field('author')} /></label>
      </div>
      <fieldset className="tag-picker">
        <legend>Tags <small>(<Link to="/admin/tags">manage</Link>)</small></legend>
        {tags.length === 0 && <span className="muted">No tags yet.</span>}
        {tags.map((t) => (
          <label key={t.slug} className={`tag-option${values.tags.includes(t.name) ? ' selected' : ''}`}>
            <input type="checkbox" checked={values.tags.includes(t.name)} onChange={() => toggleTag(t.name)} />
            #{t.name}
          </label>
        ))}
      </fieldset>
      <label>Excerpt <small>(optional)</small><textarea rows={2} maxLength={500} {...field('excerpt')} /></label>
      <label>Content <small>(Markdown)</small><textarea required rows={16} className="mono" {...field('content')} /></label>
      <div className="actions">
        <button type="submit" className="button primary" disabled={saving}>
          {saving ? 'Saving…' : post ? 'Save changes' : 'Publish'}
        </button>
        <Link to="/admin" className="button">Cancel</Link>
      </div>
    </form>
  )
}

export default function PostEditor() {
  const { slug } = useParams()
  const state = useApi(
    () => Promise.all([slug ? api.getPost(slug) : Promise.resolve(undefined), api.categories(), api.tags()]),
    [slug],
  )
  return (
    <Status state={state}>
      {([post, categories, tags]) => <EditorForm key={slug ?? 'new'} post={post} categories={categories} tags={tags} />}
    </Status>
  )
}
