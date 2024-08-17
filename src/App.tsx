import './App.css'
import SerialContainer from './Serial/Serial.tsx'
import BLEContainer from './BLE/BLE'

function App() {
  return (
    <div className='appContainer'>
      <SerialContainer />
      <BLEContainer />
    </div>
  )
}

export default App
