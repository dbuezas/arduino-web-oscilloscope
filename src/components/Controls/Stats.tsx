import React from 'react'
import {
  freeMemoryState,
  frequencyState,
  voltagesState
} from '../../communication/bindings'
import { formatFreq, formatVoltage } from '../formatters'
import { Panel, Tag } from 'rsuite'
import { useRecoilValue } from 'recoil'

function FreeMemory() {
  const freeMemory = useRecoilValue(freeMemoryState)
  return <Tag>Free mem: {freeMemory}bytes</Tag>
}

function Frequency() {
  const frequency = useRecoilValue(frequencyState)
  return <Tag>Frequency: {formatFreq(frequency)}</Tag>
}

function Voltages() {
  const voltages = useRecoilValue(voltagesState)
  return (
    <>
      <Tag>Vmin: {formatVoltage(voltages.vmin)}</Tag>
      <Tag>Vmax: {formatVoltage(voltages.vmax)}</Tag>
      <Tag>Vavr: {formatVoltage(voltages.vavr)}</Tag>
      <Tag>Vp-p: {formatVoltage(voltages.vpp)}</Tag>
    </>
  )
}
export default function Stats() {
  return (
    <div>
      <Panel header="Voltages" shaded collapsible defaultExpanded>
        <FreeMemory />
        <Frequency />
        <Voltages />
      </Panel>
    </div>
  )
}
