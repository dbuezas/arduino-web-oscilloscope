import React, { useState } from 'react'
import { Button, Icon, Progress } from 'rsuite'
import serial2 from '../../communication/Serial2'
import async from 'async'
import intel_hex from 'intel-hex'
import Stk500 from 'stk500'

const stk500 = new Stk500()
const bootload = async (
  stream: NodeJS.ReadWriteStream,
  hex: string,
  opt: typeof board,
  progress: (percent: number) => void
) => {
  let sent = 0
  stk500.log = (what: string) => {
    if (what == 'loaded page') {
      sent += 1
      const percent = Math.round((100 * sent) / (hex.length / opt.pageSize))
      progress(percent)
    }
  }

  await async.series([
    // send two dummy syncs like avrdude does
    stk500.sync.bind(stk500, stream, 3, opt.timeout),
    stk500.sync.bind(stk500, stream, 3, opt.timeout),
    stk500.sync.bind(stk500, stream, 3, opt.timeout),
    stk500.verifySignature.bind(stk500, stream, opt.signature, opt.timeout),
    stk500.setOptions.bind(stk500, stream, {}, opt.timeout),
    stk500.enterProgrammingMode.bind(stk500, stream, opt.timeout),
    stk500.upload.bind(stk500, stream, hex, opt.pageSize, opt.timeout),
    // stk500.verify.bind(stk500, stream, hex, opt.pageSize, opt.timeout),
    stk500.exitProgrammingMode.bind(stk500, stream, opt.timeout)
  ])
}

const serialOptions = {
  baudrate: 57600,
  buffersize: 20000
}
const board = {
  signature: Buffer.from([0x1e, 0x95, 0x0f]),
  pageSize: 128,
  timeout: 400
}
function Uploader() {
  const [percent, setPercent] = useState(0)
  const [status, setStatus] = useState<'active' | 'fail' | 'success'>('active')
  const [isProgressHidden, setIsProgressHidden] = useState(true)
  const [message, setMessage] = useState('')
  const onClick = async () => {
    setMessage('Uploading...')
    try {
      setIsProgressHidden(true)
      const hex = await fetch(process.env.PUBLIC_URL + '/src.ino.hex')
        .then((response) => response.text())
        .then((text) => intel_hex.parse(text).data)
      const serialStream = await serial2.connect(serialOptions)
      setStatus('active')
      setPercent(0)
      setIsProgressHidden(false)
      await bootload(serialStream, hex, board, setPercent)
      setStatus('success')
      setMessage(`Uploaded ${hex.length} bytes.`)
    } catch (e) {
      setMessage(e.toString())
      setStatus('fail')
    }
    serial2.close()
  }
  return (
    <>
      <br />
      <Button color="green" onClick={onClick}>
        <Icon icon="upload2" /> Upload lgt328p Firmware
      </Button>
      {!isProgressHidden && (
        <>
          <Progress.Line percent={percent} status={status} />
          {message}
        </>
      )}
    </>
  )
}

export default Uploader
