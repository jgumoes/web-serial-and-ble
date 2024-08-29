import { interval_t } from "../lib/appTypes";
import CircularBuffer, { buffer_t } from "../lib/FIFOBuffer";

let fakeIntervalID: interval_t | undefined = undefined;


let connectedDeviceName = ''

let subscribers = new Set<() => void>();

let connected: boolean = false
let currentValue: number | null = null
/**
 * number of elements in the buffer
 */
const bufferSize = 20
const fifo = new CircularBuffer(bufferSize);

type bleState_t = {
  "connected": boolean,
  "deviceName": string,
  "buffer": buffer_t,
  "currentValue": number | null
}

/**
 * The serial state that subscribers access. Do not wirte to it directly
 */
let bleState: bleState_t = {
  "connected": connected,
  "deviceName": connectedDeviceName,
  "buffer": [],
  "currentValue": null
}

/**
 * Reassigns the bleState object and alerts the subscribers. Must be called after any state changes
 */
function updateBleState(){
  let buffer: buffer_t
  if(connected){
    // fucking flex-box doesn't scroll when flex-direction is column, but does when it's column-reverse
    let tempBuffer = fifo.getArray().filter(value => value !== undefined)
    tempBuffer.reverse()
    buffer = tempBuffer
  }
  else{
    buffer = []
  }
  bleState = {
    "connected": connected,
    "deviceName": connectedDeviceName,
    "buffer": buffer,
    "currentValue": currentValue
  }
  subscribers.forEach((callback)=>(callback()))
}

/**
 * the time between checking the Web Bluetooth buffer
 */
let updateInterval = 1000
/**
 * Write a new interval time to the mcu. If newInterval <= 0, the interval is just cleared but mcuReadInterval isn't overwritten
 * @param newInterval new read interval in milliseconds
 */
function checkForUpdates(newInterval: number = updateInterval){
  // todo: write the new interval to the mcu, and update when confirmation response is recieved
  clearInterval(fakeIntervalID)
  if(newInterval <= 0){
    return
  }
  fakeIntervalID = setInterval(()=>{
    const [min, max] = [0, 360]
    const fakeValue = Math.round((Math.random()*(max-min) - min)*100)/100
    currentValue = Math.round((Math.random()*(max-min) - min)*100)/100
    fifo.push(fakeValue)
    updateBleState()
  }, newInterval)

  updateInterval = newInterval
}

const WebBluetooth = {
  async connect(){
    connected = true;
    connectedDeviceName = "Fake MCU (Fakey McFakington Industries Inc.)"
    console.error("WebBluetooth.connect() is still using fake values")

    checkForUpdates(updateInterval)
    subscribers.forEach((callback)=>{callback()})

    updateBleState();
  },

  async disconnect(){
    checkForUpdates(0)
    connectedDeviceName = '';
    connected = false;
    currentValue = null
    console.error("WebBluetooth.disconnect() is still using fake values")

    updateBleState()
    subscribers.forEach((callback)=>{callback()})
  },

  subscribe(callback: () => void){
    subscribers.add(callback)
    return () => subscribers.delete(callback)
  },

  getState(){
    return bleState
  },
  toggleConnection(){
    if(connected){
      this.disconnect()
    }
    else{
      this.connect()
    }
  }
}

export default WebBluetooth