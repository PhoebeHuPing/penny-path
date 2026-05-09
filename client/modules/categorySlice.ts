import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const categoryStore = createSlice({
  name: 'categoryList',
  initialState: { categoryList: [] },
  reducers: {
    setCategoryList(state, action) {
      state.categoryList = action.payload
    },
  },
})

//异步请求部分
const { setCategoryList } = categoryStore.actions
const fetchCategoryList = () => {
  return async (dispatch) => {
    const res = await axios.get('/api/categories')
    console.log(res)

    dispatch(setCategoryList(res.data.data.categories))
  }
}

export { fetchCategoryList }
const reducer = categoryStore.reducer
export default reducer
