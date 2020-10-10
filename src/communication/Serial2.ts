// based in wonky  https://github.com/yaakov-h/uniden-web-controller/blob/master/serial.js
import { ReadableWebToNodeStream } from 'readable-web-to-node-stream'

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
    serial2: Serial
  }
  interface Navigator {
    serial: NavigatorSerial
  }
}

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
  port?: Port
  reader?: NodeJS.ReadableStream
  writer?: WritableStreamDefaultWriter

  async close() {
    console.log('closing')
    if (this.reader) {
      // @ts-ignore
      await this.reader.reader.cancel()
      // await this.reader.close() // this blocks if uploading failed
      this.reader = undefined
    }
    if (this.writer) {
      await this.writer.close()
      this.writer = undefined
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
    return this._connect(options, port)
  }
  async connect(options: SerialOptions) {
    const port = await navigator.serial.requestPort({})
    return this._connect(options, port)
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
    this.reader = new ReadableWebToNodeStream(this.port.readable)
    this.writer = this.port.writable.getWriter()

    // next I'm faking a NodeJS.ReadWriteStream
    const rwStream = (this.reader as unknown) as NodeJS.ReadWriteStream
    // @ts-ignore
    rwStream.write = (
      buffer: string | Uint8Array,
      onDone: (err: Error | null | undefined) => void
    ) => {
      this.writer!.write(buffer).then(() => onDone(null), onDone)
      return true
    }
    return rwStream
  }
}
const serial = new Serial()

export default serial

window.serial2 = serial
// window.addEventListener('beforeunload', () => serial.close())
