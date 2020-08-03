// based in wonky  https://github.com/yaakov-h/uniden-web-controller/blob/master/serial.js
import dataMock from './dataMock'

const findSequence = (needle: number[], haystack: number[]) => {
  let needleIdx = 0
  let i
  for (i = 0; i < haystack.length && needleIdx < needle.length; i++) {
    if (needle[needleIdx] === haystack[i]) needleIdx++
    else needleIdx = 0
  }
  if (needleIdx === needle.length) return [i - needleIdx - 1, i - 1]
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
  reader: any
  writer: any
  port: any
  readbuffer: number[] = []
  data: any
  outputDone: any
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
  async connect(options: SerialOptions) {
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
    this.port = await (navigator as any).serial.requestPort({})
    await this.port.open(options)
    window['myport' as any] = this.port
    this.reader = this.port.readable.getReader()
    // this.writer = this.port.writable.getWriter()
    const encoder = new TextEncoderStream()
    this.outputDone = encoder.readable.pipeTo(this.port.writable)
    const textOutputStream = encoder.writable
    this.writer = textOutputStream.getWriter()
  }

  async write(text: string) {
    console.log(text)
    if (!this.writer) return
    await this.writer.write(text)
    await sleep(1)
  }
  async onData(callback: (data: number[]) => unknown) {
    callback(dataMock)
    const reader = async (): Promise<any> => {
      const data =
        this.reader && (await Promise.race([sleep(500), this.reader.read()]))
      if (data && data.value !== undefined) {
        this.readbuffer.push(...data.value)
        let first = true
        while (true) {
          const [firstIdx, lastIdx] = findSequence(
            [255, 255, 255, 255],
            this.readbuffer
          )
          if (firstIdx > -1) {
            if (first) {
              const response = this.readbuffer.slice(0, firstIdx)
              callback(response)
            }
            this.readbuffer = this.readbuffer.slice(lastIdx + 1)
            first = false
          } else break
        }
      }
      requestAnimationFrame(reader)
    }
    reader()
  }
}
const serial = new Serial()
export default serial

declare global {
  interface Window {
    serial: any
  }
}
window.serial = serial
window.addEventListener('beforeunload', () => serial.close())
