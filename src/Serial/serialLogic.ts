/**
 * Simplified web serial interface
 */

// import CircularBuffer, { buffer_t } from "../lib/FIFOBuffer"
import {interval_t} from '../lib/appTypes'
import CircularBuffer, { buffer_t } from '../lib/FIFOBuffer';
import SerialBuffer from './serialBuffer';

interface serialObjects_i {
  port: SerialPort | null,
  reader: ReadableStreamDefaultReader<Uint8Array> | null,
}

const serialObjects: serialObjects_i = {
  port: null,
  reader: null,
}

interface serialOptions_i {
  "connectedDeviceName": string,
  "valueBounds": [number, number],
  "readValues": boolean;
  "writeValues": boolean;
  "other": boolean;
}

let mcuOptions: serialOptions_i = {
  "connectedDeviceName": '',
  "valueBounds": [0, 0],
  "readValues": false,
  "writeValues": false,
  "other": false,
}

let mcuReadIntervalTime = 100;
let serialReadInterval: interval_t | undefined = undefined;

let connected: boolean = false
// let bufferSubscribers = new Set<() => void>();
// let stateSubscribers = new Set<() => void>();
let subscribers = new Set<() => void>();
/**
 * number of elements in the buffer
 */
const bufferSize = 20
const fifo = new SerialBuffer(new CircularBuffer(bufferSize))

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
  "deviceName": mcuOptions.connectedDeviceName,
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
    "deviceName": mcuOptions.connectedDeviceName,
    "buffer": buffer
  }
  subscribers.forEach((callback)=>(callback()))
}

/**
 * Requests the settings of the connected device, and updates the class variables accordingly
 */
function getDeviceSettings(){
  // TODO: make real
  mcuOptions = {
    "connectedDeviceName": "Fake MCU (Fakey McFakington Industries Inc.)",
    "valueBounds": [0, 360],
    "readValues": true,
    "writeValues": true,
    "other": true,
  }
  console.error('WebSerialClass.getDeviceSettings() is still using fake values')
}

/**
 * Write a new interval time to the mcu. If newInterval <= 0, the interval is just cleared but mcuReadInterval isn't overwritten
 * @param newIntervalTime new read interval in milliseconds
 */
function checkForUpdates(newIntervalTime: number = mcuReadIntervalTime){
  // todo: write the new interval to the mcu, and update when confirmation response is recieved
  clearInterval(serialReadInterval)
  if(newIntervalTime <= 0){
    return
  }
  serialReadInterval = setInterval(()=>{
    if(serialObjects.reader === null){
      WebSerial.disconnect();
    }
    else{
      serialObjects.reader.read().then(function processText({done, value}){
        if(done){
            // Google is lying to you! they are blatantly deceiving us, trying controlling our perspective of the world!
            // 'done' is never true! it lies! the buffer empties and still it returns false! It IS false!
            console.log(`done: ${done}`);
            return;
        }
        let strValue = String.fromCharCode.apply(null, value); // ignore it it's fine
        fifo.add(strValue);
      // reader.releaseLock();
      })
      updateSerialState()
      return;
    }
  }, newIntervalTime)

  mcuReadIntervalTime = newIntervalTime
}

const WebSerial = {
  /**
   * initiate connection, and set up an event to buffer text values
   */
  async connect(){
    // todo: first, send and process a settings request to the mcu. then, send a values request to start a stream of values
    // the device should return an options object that can be parsed as json
    try {
      serialObjects.port = await navigator.serial.requestPort();
      await serialObjects.port.open({ baudRate: 9600 });
      if(serialObjects.port.readable !== null){
        serialObjects.reader = serialObjects.port.readable.getReader();
      }
      else{
        throw new Error("serialObjects.port.readable is null");
      }
      connected = true
      checkForUpdates(mcuReadIntervalTime)
      getDeviceSettings()
    } catch (error) {
      console.error(error)
      this.disconnect()
    }
    
    updateSerialState()
    subscribers.forEach((callback)=>{callback()})
  },
  
  async disconnect(){
    // TODO: send stop signal
    checkForUpdates(0)
    // mcuOptions = {
    //   "connectedDeviceName": '',
    //   "valueBounds": [0, 0],
    //   "readValues": false,
    //   "writeValues": false,
    //   "other": false,
    // }
    mcuOptions.connectedDeviceName = ''
    if(serialObjects.reader !== null){
      await serialObjects.reader.releaseLock();
    }
    if(serialObjects.port !== null){
      await serialObjects.port.close();
    }
    connected = false;

    updateSerialState()
    subscribers.forEach((callback)=>{callback()})
  },

  getDeviceName() : string {return mcuOptions.connectedDeviceName;},
  
  getReadInterval() {return mcuReadIntervalTime;},
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