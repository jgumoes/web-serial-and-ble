import './Serial.css'
import '../sharedContainers.css'
import { useState, useSyncExternalStore } from 'react'
import { ReaderBox } from '../sharedComponents'
import { timeout_t } from '../lib/appTypes'
import WebSerial from './serialLogic'

const SerialConnectionButton = () => {
  console.time("SerialConnectionButton")
  const serialState = useSyncExternalStore(WebSerial.subscribe, WebSerial.getState)
  const id = serialState.connected ? 'connected' : 'not-connected'
  const text = serialState.connected ? `Connected to ${serialState.deviceName}` : 'Click to connect to serial device'
  console.log("connection state: ", serialState.connected)
  const handleClick = (_event: any) => {
    console.time("handleClick")
    WebSerial.toggleConnection();
    console.timeEnd("handleClick")
  }
  console.timeEnd("SerialConnectionButton")
  return(
    <div className="connection-button" id={id} onClick={handleClick}>
      <h2>{text}</h2>
    </div>
  )
}

const SerialReader = ()=>{
  // todo: before a device is connected, there should be an animation of a usb being plugged slightly in, then being turned, and loop
  const serialState = useSyncExternalStore(WebSerial.subscribe, WebSerial.getState)
  return(
    <div className="readerContainer" id='serial'>
      <ReaderBox
        id='serial'
        title='Serial Monitor'
        valueList={serialState.buffer}
        connected={serialState.connected}
      />
    </div>
  )
}

/**
 * in milliseconds
 */
const rangeInputResetTime: number = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--rangeInputResetTime'))

/**
 * in milliseconds
 */
const buttonPulseTime: number = 2*parseInt(getComputedStyle(document.documentElement).getPropertyValue('--buttonPulseTime'))

function RangeInputButton(props:{
  id: string;
  text: string;
  clickCallback: ()=>void;
  rangeTimeoutID: timeout_t | undefined;
}){
  // todo: okay so here's the plane: make the animation container slightly oversized. use framer to draw a border around the cancel button. the components id get set to a random number to force rerendering.
  const {id, text, clickCallback, rangeTimeoutID} = props
  const [isPressed, setIsPressed] = useState(false)


  const pendingClassName = 'pending'
  const notPendingClassName = 'notPending'
  return(
    <div className='rangeValueButtonContainer' id={id}>
      <button
        className={`readValueRangeButton ${isPressed ? 'pressed' : ''} ${rangeTimeoutID !== undefined ? pendingClassName : notPendingClassName}`}
        id={id}
        onClick={()=>{
          if(rangeTimeoutID !== undefined){
            console.log("button clicked")
            setIsPressed(true);
            setTimeout(() => setIsPressed(false), buttonPulseTime);
            clickCallback();
          }
        }}
        type='button'
        >
          {text}
        </button>
    </div>
  )
}

function SerialOptions(){
  // todo: this should be a double slider that changes the min and max interpolation values on the mcu
  // todo: if the cancel button size could pulse when auto-cancelling, that would be great
  
  const [rangeTimeout, setRangeTimeout] = useState<timeout_t | undefined>(undefined)
  const [mcuRangeValue, setMcuRangeValue] = useState<number>(3.3);
  const [rangeValue, setRangeValue] = useState<number>(mcuRangeValue);
  return(
    <div className='optionsContainer' id='serial'>
      <div className='loggingOptions'>
        <h3>Logging Options</h3>
        <label>
          <input type='checkbox' name='readValues'/>
          Show Read Values
        </label>
        <label>
          <input type='checkbox' name='holdValues'/>
          Show Hold Values
        </label>
        <label>
          <input type='checkbox' name='everythingElse'/>
          Show Everything Else
        </label>
      </div>
      
      <div className='mcuOptions'>
        <h3>MCU Options</h3>
        <label className='readValueRangeLabel'>
          Read Value Range
          <br/>
          (current value: {mcuRangeValue})
          <br/>
          <input
            type='range'
            min={0}
            max={5}
            value={rangeValue}
            onChange={e=>{
              setRangeValue(Number(e.target.value));
              clearTimeout(rangeTimeout);
              setRangeTimeout(setTimeout(()=>{
                setRangeTimeout(undefined);
                setRangeValue(mcuRangeValue);
              }, rangeInputResetTime))
            }}
          />
          {rangeValue}
        </label>
        <div className='uploadButtonsContainer'>
          <RangeInputButton
            id='upload'
            text='Upload'
            clickCallback={()=>{
              setMcuRangeValue(rangeValue);
              setRangeTimeout(undefined);
              clearTimeout(rangeTimeout);
            }}
            rangeTimeoutID={rangeTimeout}
          />
          <RangeInputButton
            id='cancel'
            text='Cancel'
            clickCallback={()=>{
              clearTimeout(rangeTimeout);
              setRangeTimeout(undefined);
              setRangeValue(mcuRangeValue);
            }}
            rangeTimeoutID={rangeTimeout}
          />
        </div>
      </div>
    </div>
  )
}

export default function SerialContainer(){
  // todo: create connection state
  return(
      <div className="serial-container interface-container">
        <div className='connection-container'>
          <SerialConnectionButton />
        </div>
        <SerialReader />
    `   <SerialOptions />`
      </div>
  )
}