import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'

export type AuthMode = 'login' | 'signup'

const EMPTY = { username: '', email: '', first_name: '', last_name: '', password: '' }

export default function AuthModal({
  mode,
  onModeChange,
  onClose,
}: {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onClose: () => void
}) {
  const { login, register } = useAuth()
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const field = (name: keyof typeof EMPTY) => ({
    name,
    value: values[name],
    onChange: (e: { target: { value: string } }) => setValues({ ...values, [name]: e.target.value }),
  })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      if (mode === 'login') await login(values.username, values.password)
      else await register(values)
      onClose()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  const switchTo = (next: AuthMode) => {
    setError(undefined)
    onModeChange(next)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal form" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 id="auth-title">{mode === 'login' ? 'Log in' : 'Create your account'}</h2>
        {error && <p className="error">{error}</p>}
        {mode === 'signup' && (
          <>
            <div className="row">
              <label>First name<input required autoFocus {...field('first_name')} /></label>
              <label>Last name<input required {...field('last_name')} /></label>
            </div>
            <label>Email<input required {...field('email')} /></label>
          </>
        )}
        <label>Username<input required autoFocus={mode === 'login'} autoComplete="username" {...field('username')} /></label>
        <label>
          Password
          <input
            required
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            {...field('password')}
          />
        </label>
        <button type="submit" className="button primary block" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        <p className="switch">
          {mode === 'login' ? (
            <>No account? <button type="button" className="link-button" onClick={() => switchTo('signup')}>Sign up</button></>
          ) : (
            <>Already a member? <button type="button" className="link-button" onClick={() => switchTo('login')}>Log in</button></>
          )}
        </p>
      </form>
    </div>
  )
}
