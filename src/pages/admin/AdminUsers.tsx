import { useState, type FormEvent } from 'react'
import Status from '../../components/Status'
import { api } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { useApi } from '../../lib/hooks'

const EMPTY = { username: '', email: '', first_name: '', last_name: '', password: '', is_admin: false }

export default function AdminUsers() {
  const [version, setVersion] = useState(0)
  const state = useApi(api.users, [version])
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState<string>()

  const field = (name: Exclude<keyof typeof EMPTY, 'is_admin'>) => ({
    value: values[name],
    onChange: (e: { target: { value: string } }) => setValues({ ...values, [name]: e.target.value }),
  })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(undefined)
    try {
      await api.createUser(values)
      setValues(EMPTY)
      setVersion((v) => v + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section>
      <h2>Users</h2>
      <form className="form card" onSubmit={submit}>
        <h3>Add user</h3>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <label>First name<input required {...field('first_name')} /></label>
          <label>Last name<input required {...field('last_name')} /></label>
        </div>
        <div className="row">
          <label>Username<input required autoComplete="off" {...field('username')} /></label>
          <label>Email<input required autoComplete="off" {...field('email')} /></label>
        </div>
        <label>Password<input required type="password" autoComplete="new-password" {...field('password')} /></label>
        <label className="checkbox">
          <input type="checkbox" checked={values.is_admin} onChange={(e) => setValues({ ...values, is_admin: e.target.checked })} />
          Admin
        </label>
        <div><button type="submit" className="button primary">Add user</button></div>
      </form>
      <Status state={state}>
        {(users) => (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Username</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td className="muted">{u.email}</td>
                    <td>{u.is_admin ? <span className="category-badge">Admin</span> : 'Member'}</td>
                    <td>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Status>
    </section>
  )
}
