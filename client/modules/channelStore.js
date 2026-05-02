import { createSlice } from "@reduxjs/toolkit";

createSlice({

name:'channel',
initialState:{ChannelList:[]},
reducers:{
setChannels(state,action)
{state.ChannelList=action.payload}}
}
)