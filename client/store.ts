import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './modules/counterStore'
import channelReucer from './modules/channelStore'


const store = configureStore({
  reducer: {
    counter: counterReducer,
    channel:channelReucer
  },
})

export default store
