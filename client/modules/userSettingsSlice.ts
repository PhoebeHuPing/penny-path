import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import api from '../api'
import { triggerToast } from './appSlice'
import { setUser } from './authSlice'
import type { AppDispatch } from '../store'

interface UserSettingsState {
  loading: boolean
  error: string | null
}

const initialState: UserSettingsState = {
  loading: false,
  error: null,
}

export const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    setSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setSettingsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setSettingsLoading, setSettingsError } =
  userSettingsSlice.actions

// --- Async actions ---

export const changePassword =
  (currentPassword: string, newPassword: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(setSettingsLoading(true))
    dispatch(setSettingsError(null))
    try {
      await api.put('/api/user/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      dispatch(triggerToast('Password updated successfully!', 'success'))
      return true
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>
      const msg =
        axiosError.response?.data?.detail || 'Failed to change password'
      dispatch(setSettingsError(msg))
      dispatch(triggerToast(msg, 'error'))
      return false
    } finally {
      dispatch(setSettingsLoading(false))
    }
  }

export const updateProfile =
  (data: {
    display_name?: string | null
    avatar_url?: string | null
    currency?: string | null
  }) =>
  async (dispatch: AppDispatch) => {
    dispatch(setSettingsLoading(true))
    dispatch(setSettingsError(null))
    try {
      const res = await api.put('/api/user/profile', data)
      dispatch(setUser(res.data))
      dispatch(triggerToast('Profile updated successfully!', 'success'))
      return true
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>
      const msg =
        axiosError.response?.data?.detail || 'Failed to update profile'
      dispatch(setSettingsError(msg))
      dispatch(triggerToast(msg, 'error'))
      return false
    } finally {
      dispatch(setSettingsLoading(false))
    }
  }

export default userSettingsSlice.reducer
