import { voltageRanges } from './bindings'

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
function get_float32_t(data: Data) {
  // IEEE 754
  // https://gist.github.com/Jozo132/2c0fae763f5dc6635a6714bb741d152f#file-float32encoding-js-L32-L43
  const arr = data.data.slice(data.i, data.i + 4)
  data.i += 4

  const int = arr.reverse().reduce((acc, curr) => (acc << 8) + curr)
  if (int === 0) return 0
  const sign = int >>> 31 ? -1 : 1
  let exp = ((int >>> 23) & 0xff) - 127
  const mantissa = ((int & 0x7fffff) + 0x800000).toString(2)
  let float32 = 0
  for (let i = 0; i < mantissa.length; i += 1) {
    float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0
    exp--
  }
  return float32 * sign
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
  const secPerSample = get_float32_t(myData)
  const triggerPos = get_uint16_t(myData)
  const amplifier = get_uint8_t(myData)
  const triggerMode = get_uint8_t(myData)
  const triggerChannel = get_uint8_t(myData)
  const isChannelOn = get_uint8_t(myData)
  // input output
  // output
  const needData = get_bool(myData)
  const forceUIUpdate = get_bool(myData)
  get_uint16_t(myData) //const bufferStartPtr =
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

  const vMax = voltageRanges[amplifier]
  const vPart = vMax / 6
  const buffers = [
    isChannelOn & 0b000001 ? analog1.map((n) => (n / 256) * vMax) : [],
    isChannelOn & 0b000010 ? analog2.map((n) => (n / 256) * vMax) : [],
    isChannelOn & 0b000100
      ? digital.map((n) => ((n + 0.2) * vPart) & 0b000100 && 1)
      : [],
    isChannelOn & 0b001000
      ? digital.map((n) => ((n + 0.4) * vPart) & 0b001000 && 1)
      : [],
    isChannelOn & 0b010000
      ? digital.map((n) => ((n + 0.6) * vPart) & 0b010000 && 1)
      : [],
    isChannelOn & 0b100000
      ? digital.map((n) => ((n + 0.8) * vPart) & 0b100000 && 1)
      : []
  ].map((channel) => channel.map((v, i) => ({ v, t: (i + 1) * secPerSample })))

  return {
    //input
    triggerVoltage,
    triggerDir,
    secPerSample,
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
