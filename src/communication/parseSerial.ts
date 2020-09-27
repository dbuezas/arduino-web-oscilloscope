type Data = {
  data: number[]
  i: number
}

function pull(data: Data, count: number) {
  const result = data.data.slice(data.i, data.i + count)
  data.i += count
  return Array.from(result)
}

function get_uint8_t(data: Data) {
  const res = data.data[data.i]
  data.i++
  return res
}
const get_bool = get_uint8_t

function get_uint16_t(data: Data) {
  const l = data.data[data.i]
  data.i++
  const h = data.data[data.i]
  data.i++
  return (h << 8) | l
}
// function get_int16_t(buffer: number[]) {
//   const raw = get_uint16_t(buffer)
//   if (raw & (1 << 15)) {
//     // negative
//     return -(~raw + (1 << 16) + 1)
//   }
//   return raw
// }
export default function parseSerial(data: number[]) {
  const myData: Data = {
    data,
    i: 0
  }
  // input
  const triggerVoltage = get_uint8_t(myData)
  const triggerDir = get_uint8_t(myData)
  const ticksPerAdcRead = get_uint16_t(myData)
  const triggerPos = get_uint16_t(myData)
  const amplifier = get_uint8_t(myData)
  const triggerMode = get_uint8_t(myData)
  const triggerChannel = get_uint8_t(myData)
  const isChannelOn = get_uint8_t(myData)
  // input output
  // output
  const needData = get_bool(myData)
  const forceUIUpdate = get_bool(myData)
  const bufferStartPtr = get_uint16_t(myData)
  const didTrigger = get_bool(myData)
  const freeMemory = get_uint16_t(myData)
  const trashedSamples = get_uint16_t(myData)
  const samplesPerBuffer = get_uint16_t(myData)
  const analog1 =
    isChannelOn & 0b1 ? pull(myData, samplesPerBuffer - trashedSamples) : []
  const analog2 =
    isChannelOn & 0b10 ? pull(myData, samplesPerBuffer - trashedSamples) : []
  const digital =
    isChannelOn & 0b11111100
      ? pull(myData, samplesPerBuffer - trashedSamples)
      : []

  const buffers = [
    isChannelOn & 0b1 ? analog1.map((n) => n) : [],
    isChannelOn & 0b10 ? analog2.map((n) => n) : [],
    isChannelOn & 0b100 ? digital.map((n) => n & 0b000100 && 1) : [],
    isChannelOn & 0b1000 ? digital.map((n) => n & 0b001000 && 1) : [],
    isChannelOn & 0b10000 ? digital.map((n) => n & 0b010000 && 1) : [],
    isChannelOn & 0b100000 ? digital.map((n) => n & 0b100000 && 1) : []
  ]
  return {
    //input
    triggerVoltage,
    triggerDir,
    ticksPerAdcRead,
    triggerPos,
    amplifier,
    triggerMode,
    triggerChannel,
    isChannelOn,
    // output
    needData,
    forceUIUpdate,
    didTrigger,
    freeMemory,
    samplesPerBuffer,
    buffers
  }
}
