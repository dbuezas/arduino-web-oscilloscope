// based in wonky  https://github.com/yaakov-h/uniden-web-controller/blob/master/serial.js
import dataMock from './dataMock'

type Port = {
  readable: ReadableStream
  writable: WritableStream
  open: (options: SerialOptions) => Promise<void>
  close: () => Promise<void>
}
type NavigatorSerial = {
  requestPort: (optn: unknown) => Port
  getPorts: () => Promise<Port[]>
}

declare global {
  interface Window {
    serial: Serial
  }
  interface Navigator {
    serial: NavigatorSerial
  }
}
const END_SEQUENCE = [255, 255, 255, 255]
const indexesOfSequence = (needle: number[], haystack: number[]) => {
  const result = []
  for (let i = 0, j = 0; i < haystack.length; i++) {
    if (haystack[i] === needle[j]) {
      j++
      if (j == needle.length) {
        result.push(i - j + 1)
        j = 0
      }
    } else j = 0
  }
  return result
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
type SerialOptions = {
  baudrate?: number
  databits?: number
  stopbits?: number
  parity?: string
  buffersize?: number
  rtscts?: boolean
  xon?: boolean
  xoff?: boolean
  xany?: boolean
}
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
    const [port] = await navigator.serial.getPorts()
    if (!port) throw new Error('no paired')
    this._connect(options, port)
  }
  async connect(options: SerialOptions) {
    const port = await navigator.serial.requestPort({})
    this._connect(options, port)
  }
  async _connect(options: SerialOptions, port: Port) {
    options = {
      baudrate: 9600,
      databits: 8,
      stopbits: 1,
      parity: 'none',
      buffersize: 255,
      rtscts: false,
      xon: false,
      xoff: false,
      ...options
    }
    if (this.port) await this.close()
    this.port = port
    await this.port.open(options)
    this.reader = this.port.readable.getReader()
    // this.writer = this.port.writable.getWriter() // binary
    const encoder = new TextEncoderStream()
    this.outputDone = encoder.readable.pipeTo(this.port.writable)
    const textOutputStream = encoder.writable
    this.writer = textOutputStream.getWriter()
  }

  async write(text: string) {
    // console.log(text)
    if (!this.writer) return
    await this.writer.write(text)
    await sleep(1)
  }
  async onData(callback: (data: number[]) => unknown) {
    callback(dataMock)
    while (1) {
      //
      if (!this.reader) await sleep(100)
      const data = this.reader && (await this.reader.read())
      if (data && data.value !== undefined) {
        try {
          this.readbuffer.push(...data.value)
        } catch (e) {
          console.error(e)
        }
        const idxs = indexesOfSequence(END_SEQUENCE, this.readbuffer)
        // console.log(idxs.length)
        if (idxs.length > 1) {
          const head = idxs.pop()!
          const neck = idxs.pop()! + END_SEQUENCE.length
          const length = head - neck
          callback(this.readbuffer.slice(neck, length))
          // old frames are discarded
          this.readbuffer = this.readbuffer.slice(head)
        }
      }
    }
  }
}
const serial = new Serial()

export default serial

window.serial = serial
window.addEventListener('beforeunload', () => serial.close())
