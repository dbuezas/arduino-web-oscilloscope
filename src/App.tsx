import React, { useEffect, useState, useRef, useMemo } from 'react'
// @ts-ignore
import FPSStats from 'react-fps-stats'
import { IconButton, Icon } from 'rsuite'
import {
  useTriggerPos,
  useAdcClocks,
  useTriggerVoltage,
  useTriggerDirection
} from './bindings'
import parseSerial from './parseSerial'
import Plot from './Plot'
// import 'rsuite/dist/styles/rsuite-default.css'
import 'rsuite/dist/styles/rsuite-dark.css'

import './App.css'
import serial from './Serial'
import Controls from './Controls'

const serialOptions = {
  baudrate: 115200 * 2,
  buffersize: 1000000 //500 * 100
}

function App() {
  const stoppedRef = useRef<boolean>()
  const [data, setData] = useState<{ analog: number[]; digital: number[] }>({
    analog: [],
    digital: []
  })
  const [, , receiveTriggerPos] = useTriggerPos()
  const [, , receiveTriggerVoltage] = useTriggerVoltage()
  const [, , receiveTriggerDir] = useTriggerDirection()
  const [, , receiveAdcClocks] = useAdcClocks()

  useEffect(() => {
    serial.connectWithPaired(serialOptions).catch(() => {})
  }, [])
  useEffect(() => {
    serial.onData((newData: number[]) => {
      if (!stoppedRef.current) {
        const data = parseSerial(newData)
        if (data.analog.length > 0) {
          receiveTriggerPos(data.triggerPos)
          receiveAdcClocks(data.ADC_MAIN_CLOCK_TICKS)
          receiveTriggerVoltage((data.triggerVoltageInt / 255) * 5)
          receiveTriggerDir(data.triggerDir)
          setData(data)
        }
      }
    })
  }, [])

  return (
    <div className="App">
      <FPSStats />
      {useMemo(
        () => (
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
        ),
        []
      )}
      {useMemo(
        () => (
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
        ),
        []
      )}
      {useMemo(
        () => (
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
        ),
        []
      )}

      <Controls />
      <div
        onMouseDown={() => (stoppedRef.current = true)}
        onMouseUp={() => (stoppedRef.current = false)}
      >
        <Plot
          data={[
            data.analog.map((n) => (n / 256) * 5),
            data.digital.map((n) => (n & 0b100 && 1) * 0.5 + 0.6 * 1),
            data.digital.map((n) => (n & 0b1000 && 1) * 0.5 + 0.6 * 2),
            data.digital.map((n) => (n & 0b10000 && 1) * 0.5 + 0.6 * 3),
            data.digital.map((n) => (n & 0b100000 && 1) * 0.5 + 0.6 * 4),
            data.digital.map((n) => (n & 0b01000000 && 1) * 0.5 + 0.6 * 5),
            data.digital.map((n) => (n & 0b10000000 && 1) * 0.5 + 0.6 * 6)
          ]}
        />
      </div>
    </div>
  )
}

export default App
