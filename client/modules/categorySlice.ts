import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { triggerToast } from './appSlice'

export interface CategoryItem {
  id: number
  name: string
}

interface CategoryState {
  categoryList: CategoryItem[]
}

const initialState: CategoryState = {
  categoryList: [],
}

const categoryStore = createSlice({
  name: 'categoryList',
  initialState,
  reducers: {
    setCategoryList(state, action: PayloadAction<CategoryItem[]>) {
      state.categoryList = action.payload
    },
    appendCategory(state, action: PayloadAction<CategoryItem>) {
      state.categoryList.push(action.payload)
    },
  },
})

// 异步请求部分
const { setCategoryList, appendCategory } = categoryStore.actions

const fetchCategoryList = () => {
  return async (dispatch: any) => {
    try {
      const res = await axios.get('/api/categories')
      dispatch(setCategoryList(res.data.data.categories))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }
}

const addCategory = (name: string) => {
  return async (dispatch: any) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      dispatch(triggerToast('Category name cannot be empty', 'error'))
      return
    }
    try {
      const res = await axios.post('/api/categories', { name: trimmedName })
      dispatch(appendCategory(res.data.data.category))
      dispatch(triggerToast(`Category "${trimmedName}" added successfully!`, 'success'))
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to add category'
      dispatch(triggerToast(errorMsg, 'error'))
    }
  }
}

export { fetchCategoryList, addCategory }
const reducer = categoryStore.reducer
export default reducer
