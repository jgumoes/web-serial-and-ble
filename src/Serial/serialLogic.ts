/**
 * Simplified web serial interface
 */

import CircularBuffer from "../lib/FIFOBuffer"

class WebSerial {
  private fifo: CircularBuffer;

  constructor(bufferSize = 100) {
    this.fifo = new CircularBuffer(bufferSize);
  }

  /**
   * initiate connection, and set up an event to buffer text values
   */
  connect();
  
  public get deviceName() : string {
  }

  
  public get buffer() : CircularBuffer {
    return this.fifo.getArray()
  }
  
  
}