import { useDispatch, useSelector } from 'react-redux'
import { increment, decrement } from '../modules/counterStore'

function App() {
  const { count } = useSelector((state) => state.counter)
  const dispatch = useDispatch()
  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      {count}
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  )
}

export default App
