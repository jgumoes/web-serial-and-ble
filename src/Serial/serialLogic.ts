/**
 * Simplified web serial interface
 */

// import CircularBuffer, { buffer_t } from "../lib/FIFOBuffer"
import {interval_t} from '../lib/appTypes'
import CircularBuffer, { buffer_t } from '../lib/FIFOBuffer';

interface serialOptions_i {
  "readValues": boolean;
  "writeValues": boolean;
  "other": boolean;
}

// type serialOptionKeys_t = keyof serialOptions_i;

let connectedDeviceName = ''
let mcuReadInterval = 1000;
let mcuReadOptions: serialOptions_i = {
  "readValues": false,
  "writeValues": false,
  "other": false,
}
let valueBounds: [number, number] = [0, 0];
let fakeIntervalID: interval_t | undefined = undefined;

let connected: boolean = false
// let bufferSubscribers = new Set<() => void>();
// let stateSubscribers = new Set<() => void>();
let subscribers = new Set<() => void>();
/**
 * number of elements in the buffer
 */
const bufferSize = 20
const fifo = new CircularBuffer(bufferSize);

type serialState_t = {
  "connected": boolean,
  "deviceName": string,
  "buffer": buffer_t
}

/**
 * The serial state that subscribers access. Do not wirte to it directly
 */
let serialState: serialState_t = {
  "connected": connected,
  "deviceName": connectedDeviceName,
  "buffer": []
}

/**
 * Reassigns the SerialState object and alerts the subscribers. Must be called after any state changes
 */
function updateSerialState(){
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
  serialState = {
    "connected": connected,
    "deviceName": connectedDeviceName,
    "buffer": buffer
  }
  subscribers.forEach((callback)=>(callback()))
}

/**
 * Requests the settings of the connected device, and updates the class variables accordingly
 */
function getDeviceSettings(){
  connectedDeviceName = "Fake MCU (Fakey McFakington Industries Inc.)"
  valueBounds = [0, 3.3];
  mcuReadOptions = {
    "readValues": true,
    "writeValues": true,
    "other": true,
  }
  console.error('WebSerialClass.getDeviceSettings() is still using fake values')
}

/**
 * Write a new interval time to the mcu. If newInterval <= 0, the interval is just cleared but mcuReadInterval isn't overwritten
 * @param newInterval new read interval in milliseconds
 */
function checkForUpdates(newInterval: number = mcuReadInterval){
  // todo: write the new interval to the mcu, and update when confirmation response is recieved
  console.time("checkForUpdates")
  clearInterval(fakeIntervalID)
  if(newInterval <= 0){
    return
  }
  fakeIntervalID = setInterval(()=>{
    const [min, max] = valueBounds
    const fakeValue = Math.round((Math.random()*(max-min) - min)*100)/100
    fifo.push(fakeValue)
    updateSerialState()
  }, newInterval)

  mcuReadInterval = newInterval
  console.timeEnd("checkForUpdates")

}

const WebSerial = {
  /**
   * initiate connection, and set up an event to buffer text values
   */
  connect(){
    // todo: first, send and process a settings request to the mcu. then, send a values request to start a stream of values
    // the device should return an options object that can be parsed as json
    getDeviceSettings()
    connected = true;
    checkForUpdates(mcuReadInterval)
    console.error("WebSerialClass.connect() is still using fake values")
    console.time("WebSerial.connect() is alerting subscribers")
    subscribers.forEach((callback)=>{callback()})
    console.timeEnd("WebSerial.connect() is alerting subscribers")

    updateSerialState()
  },
  
  disconnect(){
    checkForUpdates(0)
    connectedDeviceName = '';
    mcuReadOptions = {
    "readValues": false,
    "writeValues": false,
    "other": false,
  }
    valueBounds = [0, 0];
    connected = false;
    console.error("WebSerialClass.disconnect() is still using fake values")

    updateSerialState()
    subscribers.forEach((callback)=>{callback()})
  },

  getDeviceName() : string {return connectedDeviceName;},
  
  getReadInterval() {return mcuReadInterval;},
  setReadInterval(newInterval: number){
    checkForUpdates(newInterval);
  },

  getState(){
    return serialState
  },

  subscribe(callback: () => void){
    subscribers.add(callback)
    return () => subscribers.delete(callback)
  },

  toggleConnection(){
    if(connected){
      this.disconnect()
    }
    else{
      this.connect()
    }
  },

  isConnected(){
    return connected
  },
}

export default WebSerial