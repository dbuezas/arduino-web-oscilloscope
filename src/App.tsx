import React, { useEffect, useState, useRef } from 'react'
import { IconButton, Icon } from 'rsuite'
import { useTriggerPos, useAdcClocks } from './bindings'
import parseSerial from './parseSerial'
import Plot from './Plot'
// import 'rsuite/dist/styles/rsuite-default.css'
import 'rsuite/dist/styles/rsuite-dark.css'

import './App.css'
import serial from './Serial'
import Controls from './Controls'

const fps = (fps: number) => 1000 / fps

function App() {
  const stoppedRef = useRef<boolean>()
  const [data, setData] = useState<{ analog: number[]; digital: number[] }>({
    analog: [],
    digital: []
  })
  const hz = useRef<number>(0)
  const lastT = useRef<number>(0)
  const [, , , setTriggerPosLocal] = useTriggerPos()
  const [, , , setAdcClocks] = useAdcClocks()

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
          setTriggerPosLocal(data.triggerPos)
          setAdcClocks(data.ADC_MAIN_CLOCK_TICKS)
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
