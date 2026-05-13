import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const categoryStore = createSlice({
  name: 'categoryList',
  initialState: { categoryList: [] },
  reducers: {
    setCategoryList(state, action) {
      state.categoryList = action.payload
    },
    appendCategory(state, action) {
      state.categoryList.push(action.payload)
    },
  },
})

//异步请求部分
const { setCategoryList, appendCategory } = categoryStore.actions
const fetchCategoryList = () => {
  return async (dispatch) => {
    const res = await axios.get('/api/categories')
    dispatch(setCategoryList(res.data.data.categories))
  }
}

const addCategory = (name: string) => {
  return async (dispatch) => {
    const res = await axios.post('/api/categories', { name })
    dispatch(appendCategory(res.data.data.category))
  }
}

export { fetchCategoryList, addCategory }
const reducer = categoryStore.reducer
export default reducer
