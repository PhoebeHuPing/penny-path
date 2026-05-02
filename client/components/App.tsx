import { useDispatch, useSelector } from 'react-redux'
import { increment, decrement,addToNum } from '../modules/counterStore'

function App() {
  const { count } = useSelector((state) => state.counter)
  const dispatch = useDispatch()
  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      {count}
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={()=>dispatch(addToNum(10))}>add to 10</button>
      <button onClick={()=>dispatch(addToNum(20))}>add to 20</button>
    </div>
  )
}

export default App
