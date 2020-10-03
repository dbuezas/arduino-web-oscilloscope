import React from 'react'
import {
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
          <Frequency />
          <Wavelength />
        </div>
      </Panel>
    </div>
  )
}
