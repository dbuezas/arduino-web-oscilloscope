import React, { useEffect, useState } from 'react'
import {
  dataState,
  freeMemoryState,
  frequencyState,
  voltagesState
} from '../../communication/bindings'
import { formatFreq, formatTime, formatVoltage } from '../formatters'
import { Panel, Tag } from 'rsuite'
import { useRecoilValue } from 'recoil'

function FreeMemory() {
  const freeMemory = useRecoilValue(freeMemoryState)
  return <Tag>Mem: {freeMemory}bytes</Tag>
}
function FPS() {
  const [, setLastT] = useState(0)
  const [fps, setFps] = useState(0)
  const data = useRecoilValue(dataState)
  useEffect(() => {
    setLastT((lastT) => {
      setFps((fps) => {
        const newFps = 1000 / (performance.now() - lastT)
        return Math.round(fps * 0.97 + newFps * 0.03)
      })
      return performance.now()
    })
  }, [data])
  return <Tag>FPS: {fps.toFixed(0)}</Tag>
}

function Frequency() {
  const frequency = useRecoilValue(frequencyState)
  return <Tag>Freq: {formatFreq(frequency)}</Tag>
}
function Wavelength() {
  const frequency = useRecoilValue(frequencyState)
  return <Tag>Wavelength: {formatTime(1 / frequency)}</Tag>
}

const style = {
  width: ' 100%',
  display: ' flex',
  justifyContent: ' space-between'
}
function Voltages() {
  const voltages = useRecoilValue(voltagesState)
  return (
    <>
      <div style={style}>
        <Tag>Vmin: {formatVoltage(voltages.vmin)}</Tag>
        <Tag>Vmax: {formatVoltage(voltages.vmax)}</Tag>
      </div>
      <div style={style}>
        <Tag>Vavr: {formatVoltage(voltages.vavr)}</Tag>
        <Tag>Vp-p: {formatVoltage(voltages.vpp)}</Tag>
      </div>
    </>
  )
}
export default function Stats() {
  return (
    <div>
      <Panel header="Voltages" shaded collapsible defaultExpanded>
        <Voltages />
        <div style={style}>
          <FreeMemory />
          {/* <Frequency />
          <Wavelength /> */}
        </div>
        <FPS />
      </Panel>
    </div>
  )
}
