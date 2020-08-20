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
  const triggerVoltageInt = get_uint8_t(myData)
  const triggerDir = get_uint8_t(myData)
  const ticksPerAdcRead = get_uint16_t(myData)
  const triggerPos = get_uint16_t(myData)
  const bufferStartPtr = get_uint16_t(myData)
  const didTrigger = get_bool(myData)
  const triggerMode = get_uint8_t(myData)
  const triggerChannel = get_uint8_t(myData)
  const freeMemory = get_uint16_t(myData)
  const isBuffer1ON = get_bool(myData)
  const isBuffer2ON = get_bool(myData)
  const isBuffer3ON = get_bool(myData)
  const samplesPerBuffer = get_uint16_t(myData)
  const analog1 = isBuffer1ON
    ? align(pull(myData, samplesPerBuffer), bufferStartPtr)
    : []
  const analog2 = isBuffer2ON
    ? align(pull(myData, samplesPerBuffer), bufferStartPtr)
    : []
  const digital = isBuffer3ON
    ? align(pull(myData, samplesPerBuffer), bufferStartPtr)
    : []
  const buffers = [
    analog1.map((n) => (n / 256) * 5),
    analog2.map((n) => (n / 256) * 5),
    digital.map((n) => (n & 0b000100 && 1) * 0.5 + 0.6 * 1),
    digital.map((n) => (n & 0b001000 && 1) * 0.5 + 0.6 * 2),
    digital.map((n) => (n & 0b010000 && 1) * 0.5 + 0.6 * 3),
    digital.map((n) => (n & 0b100000 && 1) * 0.5 + 0.6 * 4)
  ]
  return {
    triggerVoltageInt,
    triggerDir,
    ticksPerAdcRead,
    triggerPos,
    freeMemory,
    didTrigger,
    triggerMode,
    triggerChannel,
    isBuffer1ON,
    isBuffer2ON,
    isBuffer3ON,
    samplesPerBuffer,
    buffers
  }
}
