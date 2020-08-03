// import { useThrottle } from '@react-hook/throttle'
import React, { useEffect, useState, useRef } from 'react'
import throttle from 'lodash/throttle'
import { Button, IconButton, Icon } from 'rsuite'

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
  useEffect(() => {
    const throttled = throttle(
      (newData: number[]) => {
        if (!stoppedRef.current) {
          setData(parseSerial(newData))
        }
        // ;(window as any).mockdata = newData
        const now = performance.now()
        const newhz = 1000 / (now - lastT.current)
        hz.current = newhz
        lastT.current = now
      },
      fps(10)
      // { leading: true, trailing: false }
    )
    serial.onData(throttled)
  }, [])

  return (
    <div className="App">
      <span>{Math.round(hz.current)}hz</span>
      <IconButton
        size="lg"
        onClick={async () => {
          // await serial.connect(170000)
          await serial.connect({ baudrate: 115200 * 2, buffersize: 500 * 100 })
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
          data={data.analog.map((n, i) => ({ v: (n / 256) * 5, t: i }))}
          dataD2={data.digital.map((n, i) => ({
            v: (n & 0b100 && 1) * 0.5 + 0.6 * 1,
            t: i
          }))}
          dataD3={data.digital.map((n, i) => ({
            v: (n & 0b1000 && 1) * 0.5 + 0.6 * 2,
            t: i
          }))}
          dataD4={data.digital.map((n, i) => ({
            v: (n & 0b10000 && 1) * 0.5 + 0.6 * 3,
            t: i
          }))}
          dataD5={data.digital.map((n, i) => ({
            v: (n & 0b100000 && 1) * 0.5 + 0.6 * 4,
            t: i
          }))}
          dataD6={data.digital.map((n, i) => ({
            v: (n & 0b01000000 && 1) * 0.5 + 0.6 * 5,
            t: i
          }))}
          dataD7={data.digital.map((n, i) => ({
            v: (n & 0b10000000 && 1) * 0.5 + 0.6 * 6,
            t: i
          }))}
        />
      </div>
    </div>
  )
}

export default App
