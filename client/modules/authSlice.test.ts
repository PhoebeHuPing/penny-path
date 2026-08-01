import { describe, it, expect } from 'vitest'
import reducer, {
  setCredentials,
  setUser,
  setLoading,
  setError,
  logout,
} from './authSlice'

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
}

describe('authSlice', () => {
  it('should return the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' })
    expect(state.user).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should handle setCredentials', () => {
    const user = { id: 1, email: 'test@example.com', username: 'testuser' }
    const token = 'jwt-token-123'
    const state = reducer(initialState, setCredentials({ user, token }))
    expect(state.user).toEqual(user)
    expect(state.token).toBe(token)
    expect(state.error).toBeNull()
  })

  it('should handle setUser', () => {
    const user = { id: 2, email: 'jane@example.com', username: 'jane' }
    const state = reducer(initialState, setUser(user))
    expect(state.user).toEqual(user)
  })

  it('should handle setLoading', () => {
    const state = reducer(initialState, setLoading(true))
    expect(state.loading).toBe(true)

    const state2 = reducer(state, setLoading(false))
    expect(state2.loading).toBe(false)
  })

  it('should handle setError', () => {
    const state = reducer(initialState, setError('Something went wrong'))
    expect(state.error).toBe('Something went wrong')

    const state2 = reducer(state, setError(null))
    expect(state2.error).toBeNull()
  })

  it('should handle logout', () => {
    const loggedInState = {
      user: { id: 1, email: 'test@example.com', username: 'testuser' },
      token: 'jwt-token-123',
      loading: false,
      error: 'some error',
    }
    const state = reducer(loggedInState, logout())
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.error).toBeNull()
  })

  it('should clear error when setCredentials is called', () => {
    const stateWithError = { ...initialState, error: 'Login failed' }
    const user = { id: 1, email: 'test@example.com', username: 'testuser' }
    const state = reducer(stateWithError, setCredentials({ user, token: 'token' }))
    expect(state.error).toBeNull()
  })
})
