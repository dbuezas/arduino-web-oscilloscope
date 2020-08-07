import React, { useEffect, useState, useRef, useMemo } from 'react'
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

function App() {
  const stoppedRef = useRef<boolean>()
  const [data, setData] = useState<{ analog: number[]; digital: number[] }>({
    analog: [],
    digital: []
  })
  const hz = useRef<number>(0)
  const lastT = useRef<number>(0)
  const [, , receiveTriggerPos] = useTriggerPos()
  const [, , receiveTriggerVoltage] = useTriggerVoltage()
  const [, , receiveTriggerDir] = useTriggerDirection()
  const [, , receiveAdcClocks] = useAdcClocks()

  useEffect(() => {
    serial
      .connectWithPaired({
        baudrate: 115200,
        buffersize: 1000000 //500 * 100
      })
      .catch(() => {})
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
      // ;(window as any).mockdata = newData
      const now = performance.now()
      const newhz = 1000 / (now - lastT.current)
      hz.current = newhz
      lastT.current = now
    })
  }, [])

  return (
    <div className="App">
      <span>{Math.round(hz.current)}hz</span>
      {useMemo(
        () => (
          <IconButton
            size="lg"
            onClick={async () => {
              await serial.connect({
                baudrate: 115200,
                buffersize: 1000000 //500 * 100
              })
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
              serial.connectWithPaired({
                baudrate: 115200,
                buffersize: 1000000 //500 * 100
              })
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
