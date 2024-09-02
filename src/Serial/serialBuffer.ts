import CircularBuffer from "../lib/FIFOBuffer"

/**
 * wrapper for the Circular Buffer that adds character handling and makes push() private
 */
class SerialBuffer {
  private incomingValue: string = '';
  private fifo: CircularBuffer;
  constructor(fifo: CircularBuffer) {
    this.fifo = fifo
  }

  private pushToFifo(){
    this.fifo.push(this.incomingValue)
    this.incomingValue = ''
  }

  add(value: string){
    for(let c of value){
      if(c === '\n'){
        this.pushToFifo()
      }
      else{
        this.incomingValue += c
      }
    }
  }

  getArray(){
    return this.fifo.getArray()
  }
}

export default SerialBuffer