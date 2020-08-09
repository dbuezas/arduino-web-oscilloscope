type Format = 'uint8' | 'uint16' | 'int16'

function get(buffer: number[], format: Format) {
  const l = buffer.shift()!
  let h: number
  switch (format) {
    case 'uint8':
      return l
    case 'uint16':
      h = buffer.shift()!
      return (h << 8) | l
    case 'int16': {
      h = buffer.shift()!
      const raw = (h << 8) | l
      if (raw & (1 << 15)) {
        // negative
        return -(~raw + (1 << 16) + 1)
      }
      return raw
    }
  }
}
export default function parseSerial(data: number[]) {
  const myData = data.slice()
  const triggerVoltageInt = get(myData, 'uint8')
  const triggerDir = get(myData, 'uint8')
  const ADC_MAIN_CLOCK_TICKS = get(myData, 'uint16')
  const triggerPos = get(myData, 'int16')
  const didTrigger = get(myData, 'uint8')
  const freeMemory = get(myData, 'int16')
  const SERIAL_SAMPLES = get(myData, 'int16')
  return {
    analog: myData.slice(0, SERIAL_SAMPLES),
    digital: myData.slice(SERIAL_SAMPLES),
    triggerVoltageInt,
    triggerDir,
    ADC_MAIN_CLOCK_TICKS,
    triggerPos,
    freeMemory,
    didTrigger,
    SERIAL_SAMPLES
  }
}
