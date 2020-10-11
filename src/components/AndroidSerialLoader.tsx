import React from 'react'
import { serial } from 'web-serial-polyfill'

function AndroidSerialLoader() {
  ;(navigator as any).serial = serial
  return <></>
}

export default AndroidSerialLoader
