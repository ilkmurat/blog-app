import { useEffect, useRef, useState, type FormEvent } from 'react'
import Status from '../../components/Status'
import { api } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { useApi } from '../../lib/hooks'

const MAX_MB = 20

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function AdminHr() {
  const [version, setVersion] = useState(0)
  const state = useApi(api.hrDocuments, [version])
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const fileInput = useRef<HTMLInputElement>(null)

  // Poll while documents are being processed in the background.
  const processing = state.data?.some((d) => d.status === 'processing') ?? false
  useEffect(() => {
    if (!processing) return
    const id = setInterval(() => setVersion((v) => v + 1), 2000)
    return () => clearInterval(id)
  }, [processing])

  const topics = [...new Set(state.data?.map((d) => d.topic) ?? [])].sort()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!file) return
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`The file is larger than ${MAX_MB} MB.`)
      return
    }
    setBusy(true)
    setError(undefined)
    try {
      await api.uploadHrDocument(file, title.trim(), topic.trim())
      setFile(null)
      setTitle('')
      setTopic('')
      if (fileInput.current) fileInput.current.value = ''
      setVersion((v) => v + 1)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Delete "${name}"? Its content will no longer be searchable.`)) return
    try {
      await api.deleteHrDocument(id)
      setVersion((v) => v + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section>
      <h2>HR documents</h2>
      <p className="muted section-note">
        Uploaded PDFs are split into passages and indexed for the chat assistant. Only logged-in users can ask
        HR questions; answers cite the document and page.
      </p>
      <form className="form card" onSubmit={submit}>
        <h3>Upload a PDF</h3>
        {error && <p className="error">{error}</p>}
        <label>
          PDF file <small>(text-based, max {MAX_MB} MB)</small>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,.pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="row">
          <label>
            Title <small>(optional, defaults to file name)</small>
            <input value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="İzin Politikası" />
          </label>
          <label>
            Topic <small>(optional)</small>
            <input value={topic} maxLength={100} list="hr-topics" onChange={(e) => setTopic(e.target.value)} placeholder="İzin" />
            <datalist id="hr-topics">
              {topics.map((t) => <option key={t} value={t} />)}
            </datalist>
          </label>
        </div>
        <div>
          <button type="submit" className="button primary" disabled={busy || !file}>
            {busy ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
      <Status state={state}>
        {(docs) => (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Topic</th><th>Status</th><th>Pages</th><th>Passages</th><th>Size</th><th>Uploaded</th><th /></tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td>
                      {d.title}
                      <div className="muted small">{d.filename}</div>
                    </td>
                    <td><span className="category-badge">{d.topic}</span></td>
                    <td>
                      <span className={`status-badge ${d.status}`}>{d.status}</span>
                      {d.error && <div className="error small">{d.error}</div>}
                    </td>
                    <td>{d.status === 'ready' ? d.pages : '–'}</td>
                    <td>{d.status === 'ready' ? d.chunk_count : '–'}</td>
                    <td>{formatSize(d.size_bytes)}</td>
                    <td>
                      {formatDate(d.created_at)}
                      {d.uploaded_by && <div className="muted small">by {d.uploaded_by}</div>}
                    </td>
                    <td className="row-actions">
                      <button className="button danger" onClick={() => remove(d.id, d.title)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && <tr><td colSpan={8} className="empty">No HR documents yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Status>
    </section>
  )
}
