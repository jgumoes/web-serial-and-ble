/**
 * Implementation of a circular buffer (aka FIFO)
 */


export type buffer_t = (number | string | undefined)[];

class CircularBuffer {
  endPointer = 0;
  unreadValues = false; // true if new values have been pushed since the last read

  buffer: buffer_t;

  constructor(bufferSize: number) {
    this.buffer = new Array(bufferSize);
    this.endPointer = 0;
    // for(let i = 0; i < bufferSize; i++){
    //   this.buffer[i] = 0; // TODO: do I want this to be zero though?
    // }
  }

  /**
   * Increments the end pointer, then pushes the value to the new end pointer
   * @param value value to push to buffer
   */
  public push(value: number | string) {
    this.endPointer += 1;
    if(this.endPointer >= this.buffer.length){this.endPointer = 0}
    this.buffer[this.endPointer] = value;
    this.unreadValues = true;
  }
  
  public getArray(size = this.buffer.length) : buffer_t {
    // todo: throw an error if size is too big
    if(size > this.buffer.length){
      throw new RangeError(`array size ${size} is larger than the buffer length ${this.buffer.length}`)
    }
    if(size < 1){
      throw new RangeError(`array size ${size} is too small`)
    }
    // todo: maybe return an iterator instead?
    // if((this.endPointer >= (size - 1))){  
    //   return this.buffer.slice(this.endPointer - size, this.endPointer)
    // }
    this.unreadValues = false
    if(size < this.endPointer){
      return this.buffer.slice(this.endPointer-size + 1, this.endPointer + 1)
    }
    const endIndex = 1 + this.buffer.length - (size - this.endPointer)
    const midIndex = 1 + this.endPointer - size < 0 ? 0 : 1 + this.endPointer - size
    return [...this.buffer.slice(endIndex, this.buffer.length), ...this.buffer.slice(midIndex, this.endPointer + 1)]

  }
  
}

export default CircularBuffer