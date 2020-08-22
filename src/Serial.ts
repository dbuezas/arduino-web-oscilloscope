// based in wonky  https://github.com/yaakov-h/uniden-web-controller/blob/master/serial.js
import { profileE, profileS } from './profile'

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
const END_SEQUENCE = [0, 1, 255, 253]
const indexesOfSequence = (needle: number[], haystack: number[]) => {
  const result = []
  for (let i = haystack.length - 1, j = needle.length - 1; i >= 0; i--) {
    if (haystack[i] === needle[j]) {
      j--
      if (j == -1) {
        result.push(i)
        if (result.length == 2) return result
        j = needle.length - 1
      }
    } else j = needle.length - 1
  }
  return [-1, -1]
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
    if (!this.writer) return
    await this.writer.write(text)
  }
  async onData(callback: (data: number[]) => unknown) {
    // callback(dataMock)
    const produce = async () => {
      while (1) {
        if (!this.reader) await sleep(100)
        await new Promise((r) => requestAnimationFrame(r))

        const data = this.reader && (await this.reader.read())
        if (data && data.value !== undefined) {
          if (this.readbuffer.length > 10000)
            this.readbuffer = this.readbuffer.slice(-10000) // cap the size of the buffer
          this.readbuffer.push(...data.value)
        }
      }
    }
    const consume = async () => {
      while (1) {
        // React would do this anyway to skip paints, but only after computing the svg
        const [end, start] = indexesOfSequence(END_SEQUENCE, this.readbuffer)
        // console.log(idxs.length)
        if (start > -1 && end > -1) {
          await new Promise((r) => requestAnimationFrame(r))
          const dataFrame = this.readbuffer.slice(
            start + END_SEQUENCE.length,
            end
          )
          this.readbuffer = this.readbuffer.slice(end)
          callback(dataFrame)
          ;(window as any).discarded = (window as any).discarded || 0
          ;(window as any).discarded += start
        } else {
          await sleep(1)
        }
      }
    }
    produce()
    consume()
  }
}
const serial = new Serial()

export default serial

window.serial = serial
window.addEventListener('beforeunload', () => serial.close())
