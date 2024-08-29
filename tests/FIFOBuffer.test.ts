import CircularBuffer from "../src/lib/FIFOBuffer";

function idEqualsValue(arr){
  return arr.map(v => {
    if(v === undefined){return v}
    return {id: v, value: v}
  })
}

test("inits with an empty array", ()=>{
  const fifo = new CircularBuffer(5);
  expect(fifo.unreadValues).toBe(false)
  const resArr = fifo.getArray()
  expect(resArr).toEqual([undefined,undefined,undefined,undefined,undefined])
})

describe("pushing a value updates the buffer:", ()=>{
  test("for one value", ()=>{
    const fifo = new CircularBuffer(3);
    fifo.push(1);
    expect(fifo.unreadValues).toBe(true)
    const resArr = fifo.getArray()
    expect(resArr).toEqual([undefined, undefined, {id: 0, value: 1}])
    expect(fifo.unreadValues).toBe(false)
  });

  test("for a full buffer", ()=>{
    const fifo = new CircularBuffer(5);
    for(let i = 0; i < 5; i++){
      fifo.push(i)
    }
    expect(fifo.unreadValues).toBe(true)
    const resArr = fifo.getArray()
    expect(resArr).toEqual([
      {id: 0, value:0},
      {id: 1, value:1},
      {id: 2, value:2},
      {id: 3, value:3},
      {id: 4, value:4}
    ])
    expect(fifo.unreadValues).toBe(false)
  });

  test("for an overflowing buffer", ()=>{
    const fifo = new CircularBuffer(5);
    let i = 0
    for(i; i < 7; i++){
      fifo.push(i)
    }
    expect(fifo.unreadValues).toBe(true)
    const resArr = fifo.getArray()
    expect(resArr).toEqual([
      {id: 2, value: 2},
      {id: 3, value: 3},
      {id: 4, value: 4},
      {id: 5, value: 5},
      {id: 6, value: 6}
    ])
    expect(fifo.unreadValues).toBe(false)

    fifo.push(i)
    expect(fifo.unreadValues).toBe(true)
    const resArr2 = fifo.getArray()
    expect(resArr2).toEqual([
      {id: 3, value: 3},
      {id: 4, value: 4},
      {id: 5, value: 5},
      {id: 6, value: 6},
      {id: 7, value: 7}
    ])
    expect(fifo.unreadValues).toBe(false)
  });
})

describe("fifo.getArray() returns correct array for numbers", ()=>{
  const expectedResults = [undefined, undefined, undefined, undefined, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  test.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(`when pushing numbers up to %i`, (testEnd)=>{
    // const testEnd = 0
    const iEnd: number = testEnd + 1
    const fifo = new CircularBuffer(5)
    for(let i = 0; i < iEnd; i++){
      fifo.push(i)
    }
    const expArr = idEqualsValue(expectedResults.slice(testEnd, testEnd + 5))
    expect(fifo.getArray()).toEqual(expArr)
  })
})

describe("fifo.getArray(size)", ()=>{
  test("returns the correct array when size < bufferSize", ()=>{
    const fifo = new CircularBuffer(5);
    for(let i = 0; i < 5; i++){
      fifo.push(i)
    }
    const resArr = fifo.getArray(3)
    expect(resArr).toEqual(idEqualsValue([2,3,4]))
  });

  test("returns the correct array when size < bufferSize and the array crosses the buffer boundary", ()=>{
    const fifo = new CircularBuffer(5);
    for(let i = 0; i < 7; i++){
      fifo.push(i)
    }
    const resArr = fifo.getArray(4)
    expect(resArr).toEqual(idEqualsValue([3, 4, 5, 6]))
  });

  test("returns the latest value when size = 1", ()=>{
    const fifo = new CircularBuffer(5);
    for(let i = 0; i < 7; i++){
      fifo.push(i)
    }
    const resArr = fifo.getArray(1)
    expect(resArr).toEqual(idEqualsValue([6]))
  });

  test("returns the correct array when called multiple times", ()=>{
    const bufferSize = 5
    const fifo = new CircularBuffer(bufferSize);
    for(let i = 0; i < 7; i++){
      fifo.push(i)
    }
    const resArr = fifo.getArray(3)
    expect(resArr).toEqual(idEqualsValue([4, 5, 6]))
    const resArr2 = fifo.getArray(1)
    expect(resArr2).toEqual(idEqualsValue([6]))
    const resArr3 = fifo.getArray()
    expect(resArr3).toEqual(idEqualsValue([2, 3, 4, 5, 6]))
  });

  test("fifo.getArray(0) throws an error", ()=>{
    const fifo = new CircularBuffer(5);
    for(let i = 0; i < 7; i++){
      fifo.push(i)
    }

    const e = () => {fifo.getArray(0)}
    expect(e).toThrow(new RangeError(`array size ${0} is too small`))
  })

  test("fifo.getArray(size < 0) throws an error", ()=>{
    const fifo = new CircularBuffer(5);
    for(let i = 0; i < 7; i++){
      fifo.push(i)
    }
    const e = () => {fifo.getArray(-2)}
    expect(e).toThrow(new RangeError(`array size ${-2} is too small`))
  })

  test("fifo.getArray(size > bufferSize) throws an error", ()=>{
    const bufferSize = 5;
    const fifo = new CircularBuffer(bufferSize);
    for(let i = 0; i < 7; i++){
      fifo.push(i)
    }
    expect(fifo.unreadValues).toBe(true)
    const e = () => {fifo.getArray(bufferSize * 2)}
    expect(e).toThrow(new RangeError(`array size ${bufferSize*2} is larger than the buffer length ${bufferSize}`))
  })

  const expectedResults = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  test.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(`getArray(3), and pushing numbers up to %i`, (testEnd)=>{
    const iEnd: number = testEnd + 1
    const fifo = new CircularBuffer(10)
    for(let i = 0; i < iEnd; i++){
      fifo.push(i)
    }
    const resArr = fifo.getArray(3)
    const expArr = idEqualsValue(expectedResults.slice(testEnd+7, testEnd + 10))
    expect(resArr).toEqual(expArr)
  })
})