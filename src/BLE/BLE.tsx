import { useState } from 'react'
import './BLE.css'
import '../sharedContainers.css'
import { ReaderBox } from '../sharedComponents'

function BLEConnectionButton() {
  // if not connected, show button requesting connection
  // if connected, show device info and a disconnect button
  const [isConnected, setIsConnected] = useState(false)
  if(isConnected){
    return(
      <div className="connection-button" id='connected' onClick={e => setIsConnected(!isConnected)}>
        <h2>Connected to Bleep</h2>
      </div>
    )
  }
  else {
    return(
      <div className="connection-button" id='not-connected' onClick={e => setIsConnected(!isConnected)}>
        <h2>Click to connect to BLE device</h2>
      </div>
    )
  }
}

function CurrentValueReader(){
  let currentValue = "boop"
  return(
    <div className='holdValueReader'>
      Current Value: {currentValue}
    </div>
  )
}

function ReadValueInterval(){
  const [readInterval, setReadInterval] = useState(300)
  const [disableInput, setDisableInput] = useState(false)

  return(
    <div className='readValue'>
      Read Interval: {readInterval}
      <input type='range' id='bleReadInterval' className='bleReadInterval' min={100} max={1000} value={readInterval} disabled={disableInput} 
        onChange={e => {
          setReadInterval(Number(e.target.value))
        }}
        onSelect={e => {
          setDisableInput(true)
          setTimeout(()=>{
            setDisableInput(false)
          }, 500)
        }}
      />
    </div>
  )
}

function BLEReader(){
  // todo: before a device is connected, there should be the DVD screen, but it's BLE
  return(
    <div className='readerContainer' id='ble'>
      <ReaderBox 
        id='ble'
        title='Hold Values'
        valueList={null}
        connected={false}
      />
      <div className='singleValues'>
        <CurrentValueReader />
        <ReadValueInterval />
      </div>
    </div>
  )
}

export default function BLEContainer(){
  return(
    <div className="ble-container interface-container">
      <div className='connection-container'>
        <BLEConnectionButton />
      </div>
      <BLEReader />
    </div>
  )
}