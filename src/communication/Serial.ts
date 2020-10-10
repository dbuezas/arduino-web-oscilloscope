// based in wonky  https://github.com/yaakov-h/uniden-web-controller/blob/master/serial.js

export type Port = {
  readable: ReadableStream
  writable: WritableStream
  open: (options: SerialOptions) => Promise<void>
  close: () => Promise<void>
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
      await this.reader.cancel()
      this.reader = undefined
    }
    if (this.writer) {
      await this.writer.close()
      this.writer = undefined
    }
    if (this.outputDone) {
      await this.outputDone
      this.outputDone = undefined
    }
    if (this.port) {
      await this.port.close()
      this.port = undefined
    }
    console.log('closed')
  }
  async connectWithPaired(options: SerialOptions) {
    const ports = await navigator.serial.getPorts()
    console.log(ports)
    if (!ports.length) throw new Error('no paired')
    this._connect(options, ports[0])
  }
  async connect(options: SerialOptions) {
    const port = await navigator.serial.requestPort({})
    this._connect(options, port)
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
    this.readbuffer = []
    this.reader = this.port.readable.getReader()
    // this.writer = this.port.writable.getWriter() // binary
    const encoder = new TextEncoderStream()
    this.outputDone = encoder.readable.pipeTo(this.port.writable)
    const textOutputStream = encoder.writable
    this.writer = textOutputStream.getWriter()
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
