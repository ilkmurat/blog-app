import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Status from '../../components/Status'
import { api } from '../../lib/api'
import { useApi } from '../../lib/hooks'

/** List + create form for categories or tags. */
export default function TermAdmin({ kind }: { kind: 'category' | 'tag' }) {
  const [version, setVersion] = useState(0)
  const state = useApi(kind === 'category' ? api.categories : api.tags, [kind, version])
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const label = kind === 'category' ? 'Category' : 'Tag'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(undefined)
    try {
      await (kind === 'category' ? api.createCategory(name) : api.createTag(name))
      setName('')
      setVersion((v) => v + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section>
      <h2>{kind === 'category' ? 'Categories' : 'Tags'}</h2>
      <form className="inline-form" onSubmit={submit}>
        <input required placeholder={`New ${label.toLowerCase()} name`} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="button primary">Add {label.toLowerCase()}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <Status state={state}>
        {(terms) => (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Slug</th><th>Posts</th></tr></thead>
              <tbody>
                {terms.map((t) => (
                  <tr key={t.slug}>
                    <td><Link to={`/${kind}/${t.slug}`}>{t.name}</Link></td>
                    <td className="muted">{t.slug}</td>
                    <td>{t.post_count}</td>
                  </tr>
                ))}
                {terms.length === 0 && <tr><td colSpan={3} className="empty">None yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Status>
    </section>
  )
}
