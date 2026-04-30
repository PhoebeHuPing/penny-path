import { createSlice } from '@reduxjs/toolkit'

const counterStore = createSlice({
  name: 'counter',
  //初始化state
  initialState: { count: 0 },
  //修改数据的方法 同步方法 支持直接修改
  reducers: {
    increment(state) {
      state.count++
    },
    decrement(state) {
      state.count--
    },
  },
})

//解构出来actionCreater的函数
const { increment, decrement } = counterStore.actions
//获取reducer
const reducer = counterStore.reducer

//以按需到处的方式导出actionCreater
export { increment, decrement }

//以默认导出的方式导出 reducer
export default reducer
