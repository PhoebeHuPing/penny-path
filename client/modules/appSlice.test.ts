import { describe, it, expect } from 'vitest'
import reducer, { setInitialized, setToast } from './appSlice'

const initialState = {
  initialized: false,
  toast: null,
}

describe('appSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setInitialized', () => {
    const state = reducer(initialState, setInitialized(true))
    expect(state.initialized).toBe(true)
  })

  it('should handle setToast with success message', () => {
    const state = reducer(
      initialState,
      setToast({ message: 'Saved!', type: 'success' }),
    )
    expect(state.toast).toEqual({ message: 'Saved!', type: 'success' })
  })

  it('should handle setToast with error message', () => {
    const state = reducer(
      initialState,
      setToast({ message: 'Something went wrong', type: 'error' }),
    )
    expect(state.toast).toEqual({ message: 'Something went wrong', type: 'error' })
  })

  it('should handle clearing toast', () => {
    const stateWithToast = {
      ...initialState,
      toast: { message: 'Hello', type: 'info' as const },
    }
    const state = reducer(stateWithToast, setToast(null))
    expect(state.toast).toBeNull()
  })
})
