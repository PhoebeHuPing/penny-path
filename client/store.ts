import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './modules/counterSlice'
import channelReducer from './modules/channelSlice'
import expenseReducer from './modules/expenseSlice'


const store = configureStore({
  reducer: {
    counter: counterReducer,
    channel: channelReducer,
    expenses: expenseReducer,
  },
})

export default store
