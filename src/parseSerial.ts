function pull(buffer: number[], count: number) {
  const result = []
  while (count-- && buffer.length) {
    result.push(buffer.shift()!)
  }
  return result
}
function align(buffer: number[], offset: number) {
  return [...buffer.slice(offset), ...buffer.slice(0, offset)]
}

function get_uint8_t(buffer: number[]) {
  return buffer.shift()!
}
function get_bool(buffer: number[]) {
  return buffer.shift()!
}
function get_uint16_t(buffer: number[]) {
  const l = buffer.shift()!
  const h = buffer.shift()!
  return (h << 8) | l
}
function get_int16_t(buffer: number[]) {
  const raw = get_uint16_t(buffer)
  if (raw & (1 << 15)) {
    // negative
    return -(~raw + (1 << 16) + 1)
  }
  return raw
}
export default function parseSerial(data: number[]) {
  const myData = data.slice()
  const forceUIUpdate = get_bool(myData)
  const triggerVoltageInt = get_uint8_t(myData)
  const triggerDir = get_uint8_t(myData)
  const ticksPerAdcRead = get_uint16_t(myData)
  const triggerPos = get_uint16_t(myData)
  const amplifier = get_uint8_t(myData)
  const bufferStartPtr = get_uint16_t(myData)
  const didTrigger = get_bool(myData)
  const triggerMode = get_uint8_t(myData)
  const triggerChannel = get_uint8_t(myData)
  const freeMemory = get_uint16_t(myData)
  const isBuffer0ON = get_bool(myData)
  const isBuffer1ON = get_bool(myData)
  const isBuffer2ON = get_bool(myData)
  const trashedSamples = get_uint16_t(myData)
  const samplesPerBuffer = get_uint16_t(myData)
  let analog1 = isBuffer0ON
    ? align(pull(myData, samplesPerBuffer), bufferStartPtr)
    : []
  let analog2 = isBuffer1ON
    ? align(pull(myData, samplesPerBuffer), bufferStartPtr)
    : []
  let digital = isBuffer2ON
    ? align(pull(myData, samplesPerBuffer), bufferStartPtr)
    : []

  if (trashedSamples > 0) {
    analog1 = analog1.slice(0, -trashedSamples)
    analog2 = analog2.slice(0, -trashedSamples)
    digital = digital.slice(0, -trashedSamples)
  }
  const buffers = [
    analog1.map((n) => n),
    analog2.map((n) => n),
    digital.map((n) => n & 0b000100 && 1),
    digital.map((n) => n & 0b001000 && 1),
    digital.map((n) => n & 0b010000 && 1),
    digital.map((n) => n & 0b100000 && 1)
  ]
  return {
    forceUIUpdate,
    triggerVoltageInt,
    triggerDir,
    ticksPerAdcRead,
    triggerPos,
    amplifier,
    freeMemory,
    didTrigger,
    triggerMode,
    triggerChannel,
    isBuffer0ON,
    isBuffer1ON,
    isBuffer2ON,
    samplesPerBuffer,
    buffers
  }
}
