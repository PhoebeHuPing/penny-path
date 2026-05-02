import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const channelStore=createSlice({

name:'channel',
initialState:{ChannelList:[]},
reducers:{
setChannels(state,action)
{state.ChannelList=action.payload}}
}
)

//异步请求部分
const{setChannels}=channelStore.actions
const fetchChannList = ()=>{
return async(dispatch)=>{
const res = await axios.get('url')
dispatch(setChannels(res.data.data.channels))
}}

export{fetchChannList}
const reducer =channelStore.reducer
export default reducer