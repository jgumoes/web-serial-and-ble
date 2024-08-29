import { useState, useSyncExternalStore } from 'react'
import './BLE.css'
import '../sharedContainers.css'
import { ReaderBox } from '../sharedComponents'
import WebBluetooth from './bleLogic'

function BLEConnectionButton() {
  // if not connected, show button requesting connection
  // if connected, show device info and a disconnect button
  const bleState = useSyncExternalStore(WebBluetooth.subscribe, WebBluetooth.getState)
  
  const id = bleState.connected ? 'connected' : 'not-connected'
  const text = bleState.connected ? `Connected to ${bleState.deviceName}` : 'Click to connect to serial device'
  const handleClick = (_event: any) => {
    WebBluetooth.toggleConnection();
  }
  return(
    <div className="connection-button" id={id} onClick={handleClick}>
      <h2>{text}</h2>
    </div>
  )
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
  const bleState = useSyncExternalStore(WebBluetooth.subscribe, WebBluetooth.getState)
  console.log("current value: ", bleState.currentValue)
  return(
    <div className='readerContainer' id='ble'>
      <ReaderBox 
        id='ble'
        title='Hold Values'
        valueList={bleState.buffer}
        connected={bleState.connected}
      />
      <div className='singleValues'>
        <div className='holdValueReader'>
          Current Value: {bleState.currentValue}
        </div>
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