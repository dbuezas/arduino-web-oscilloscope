import React from 'react'
import {
  freeMemoryState,
  frequencyState,
  voltagesState
} from '../../communication/bindings'
import { formatFreq, formatVoltage } from '../formatters'
import { Panel, Tag } from 'rsuite'
import { useRecoilValue } from 'recoil'

export default function Voltages() {
  const voltages = useRecoilValue(voltagesState)
  const frequency = useRecoilValue(frequencyState)
  const freeMemory = useRecoilValue(freeMemoryState)

  return (
    <div>
      <Panel header="Voltages" shaded collapsible defaultExpanded>
        <Tag>Free mem: {freeMemory}bytes</Tag>
        <Tag>Frequency: {formatFreq(frequency)}</Tag>
        <Tag>Vmin: {formatVoltage(voltages.vmin)}</Tag>
        <Tag>Vmax: {formatVoltage(voltages.vmax)}</Tag>
        <Tag>Vavr: {formatVoltage(voltages.vavr)}</Tag>
        <Tag>Vp-p: {formatVoltage(voltages.vpp)}</Tag>
      </Panel>
    </div>
  )
}
