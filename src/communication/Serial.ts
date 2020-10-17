// based in wonky  https://github.com/yaakov-h/uniden-web-controller/blob/master/serial.js

export type Port = {
  readable: ReadableStream
  writable: WritableStream
  open: (options: SerialOptions) => Promise<void>
  close: () => Promise<void>
  getInfo: () => { usbProductId: number; usbVendorId: number }
}
export type NavigatorSerial = {
  requestPort: (optn: unknown) => Port
  getPorts: () => Promise<Port[]>
}
export type SerialOptions = {
  baudRate?: number
  dataBits?: number
  stopBits?: number
  parity?: string
  bufferSize?: number
  rtscts?: boolean
  xon?: boolean
  xoff?: boolean
  xany?: boolean
}
declare global {
  interface Window {
    serial: Serial
  }
  interface Navigator {
    serial: NavigatorSerial
  }
}
const END_SEQUENCE = [0, 1, 255, 253]
const indexesOfSequence = (needle: number[], haystack: number[]) => {
  const strNeedle = needle.map((c) => String.fromCharCode(c)).join('')
  const strHaystack = haystack.map((c) => String.fromCharCode(c)).join('')
  const start = strHaystack.indexOf(strNeedle)
  const end = strHaystack.indexOf(strNeedle, start + strNeedle.length)
  return [start, end]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class Serial {
  reader?: ReadableStreamDefaultReader
  writer?: WritableStreamDefaultWriter
  port?: Port
  readbuffer: number[] = []
  outputDone?: Promise<void>
  async close() {
    console.log('closing')
    if (this.reader) {
      const reader = this.reader
      this.reader = undefined
      await reader.cancel()
    }
    if (this.writer) {
      const writer = this.writer
      this.writer = undefined
      await writer.close()
    }
    if (this.outputDone) {
      const outputDone = this.outputDone
      this.outputDone = undefined
      await outputDone
    }
    if (this.port) {
      const port = this.port
      this.port = undefined
      await port.close()
    }
    console.log('closed')
  }
  async connectWithPaired(options: SerialOptions) {
    const filter = JSON.parse(localStorage.serialFilter)
    const ports = await navigator.serial.getPorts()
    const [port] = ports.filter(
      (port) => JSON.stringify(filter) === JSON.stringify(port.getInfo())
    )
    console.log(ports, port)
    if (!port) throw new Error('no paired')
    return this._connect(options, port)
  }
  async connect(options: SerialOptions) {
    const port = await navigator.serial.requestPort({})
    return this._connect(options, port)
  }
  async _connect(options: SerialOptions, port: Port) {
    options = {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      bufferSize: 255,
      rtscts: false,
      xon: false,
      xoff: false,
      ...options
    }
    if (this.port) await this.close()
    this.port = port

    await this.port.open(options)
    const serialFilter = port.getInfo()
    localStorage.serialFilter = JSON.stringify(serialFilter)
    this.readbuffer = []
    this.reader = this.port.readable.getReader()
    // this.writer = this.port.writable.getWriter() // binary
    const encoder = new TextEncoderStream()
    this.outputDone = encoder.readable.pipeTo(this.port.writable)
    const textOutputStream = encoder.writable
    this.writer = textOutputStream.getWriter()
    return serialFilter
  }

  write = async (text: string) => {
    if (!this.writer) return
    await this.writer.write(text)
  }
  onData(callback: (data: number[]) => unknown) {
    const consume = () => {
      let busy = true
      while (busy) {
        const [start, end] = indexesOfSequence(END_SEQUENCE, this.readbuffer)
        if (start > -1 && end > -1) {
          const dataFrame = this.readbuffer.slice(
            start + END_SEQUENCE.length,
            end
          )
          this.readbuffer = this.readbuffer.slice(end)
          const checksumShould = (dataFrame.pop()! << 8) + dataFrame.pop()!
          const checksumIs =
            dataFrame.reduce((prev, curr) => prev + curr, 0) % Math.pow(2, 16)
          if (checksumShould === checksumIs) {
            callback(dataFrame)
          } else {
            console.error(`Checksum error: ${checksumIs}≠${checksumShould}`)
            // callback(dataFrame)
          }
        } else {
          busy = false
        }
      }
    }
    let running = true
    const produce = async () => {
      while (running) {
        await sleep(16)
        if (!this.reader) continue
        const { value } = await this.reader.read()
        if (value !== undefined) {
          this.readbuffer.push(...value)
          consume()
        }
      }
    }

    produce()
    // consume()
    return () => {
      running = false
    }
  }
}
const serial = new Serial()

export default serial

window.serial = serial
window.addEventListener('beforeunload', () => serial.close())
