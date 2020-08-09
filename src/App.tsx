import React, { useEffect, useState, useRef, useMemo } from 'react'
// @ts-ignore
import FPSStats from 'react-fps-stats'
import { IconButton, Icon } from 'rsuite'
import {
  useTriggerPos,
  useAdcClocks,
  useTriggerVoltage,
  useTriggerDirection,
  dataState
} from './bindings'
import parseSerial from './parseSerial'
import Plot from './Plot'
import 'shards-ui/dist/css/shards.min.css'
// import 'rsuite/dist/styles/rsuite-default.css'
import 'rsuite/dist/styles/rsuite-dark.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import './App.css'
import serial from './Serial'
import Controls from './Controls'
import ConnectData from './ConnectData'

const serialOptions = {
  baudrate: 115200 * 2,
  buffersize: 1000000 //500 * 100
}

function App() {
  console.log('App')

  useEffect(() => {
    serial.connectWithPaired(serialOptions).catch(() => {})
  }, [])

  return (
    <div className="App">
      <FPSStats />

      <IconButton
        size="lg"
        onClick={async () => {
          await serial.connect(serialOptions)
          console.log('connected')
        }}
        icon={<Icon icon="arrow-right" />}
        placement="right"
      >
        Connect
      </IconButton>

      <IconButton
        size="lg"
        onClick={async () => {
          await serial.close()
          console.log('closed')
        }}
        icon={<Icon icon="stop" />}
        placement="right"
      >
        disConnect
      </IconButton>

      <IconButton
        size="lg"
        onClick={async () => {
          try {
            await serial.connectWithPaired(serialOptions)
          } catch (e) {
            await serial.connect(serialOptions)
          }
        }}
        icon={<Icon icon="recycle" />}
        placement="right"
      >
        reconnect
      </IconButton>

      <ConnectData />

      <Controls />
      <Plot />
    </div>
  )
}

export default App
