import type { ReactNode } from 'react'
import type { AsyncState } from '../lib/hooks'
import NotFound from '../pages/NotFound'
import { ApiError } from '../lib/api'

/** Renders loading / error states, or `children(data)` once loaded. */
export default function Status<T>({ state, children }: { state: AsyncState<T>; children: (data: T) => ReactNode }) {
  if (state.error instanceof ApiError && state.error.status === 404) return <NotFound />
  if (state.error) return <p className="error">Couldn't load data: {state.error.message}</p>
  if (state.data === undefined) return <p className="loading">Loading…</p>
  return <>{children(state.data)}</>
}
