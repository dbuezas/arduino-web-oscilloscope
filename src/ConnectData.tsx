import React, { useState, useEffect } from 'react'
import {
  useTriggerPos,
  useAdcClocks,
  useTriggerVoltage,
  useTriggerDirection,
  dataState
} from './bindings'
import parseSerial from './parseSerial'

import serial from './Serial'
import { useSetRecoilState } from 'recoil'

function ConnectData() {
  const setData = useSetRecoilState(dataState)
  const receiveTriggerPos = useSetRecoilState(useTriggerPos.receive)
  const receiveTriggerVoltage = useSetRecoilState(useTriggerVoltage.receive)
  const receiveTriggerDir = useSetRecoilState(useTriggerDirection.receive)
  const receiveAdcClocks = useSetRecoilState(useAdcClocks.receive)
  const [freeMemory, setFreeMemory] = useState(0)
  const [didTrigger, setDidTrigger] = useState(0)
  useEffect(() => {
    serial.onData((newData: number[]) => {
      const data = parseSerial(newData)
      if (data.analog.length > 0) {
        receiveTriggerPos(data.triggerPos)
        receiveAdcClocks(data.ADC_MAIN_CLOCK_TICKS)
        receiveTriggerVoltage(data.triggerVoltageInt)
        receiveTriggerDir(data.triggerDir)
        setFreeMemory(data.freeMemory)
        setDidTrigger(data.didTrigger)
        if (data.didTrigger)
          // NORMAL MODE, falta single mode, auto mode y la UI de todo esto
          setData([
            data.analog.map((n) => (n / 256) * 5),
            data.digital.map((n) => (n & 0b100 && 1) * 0.5 + 0.6 * 1),
            data.digital.map((n) => (n & 0b1000 && 1) * 0.5 + 0.6 * 2),
            data.digital.map((n) => (n & 0b10000 && 1) * 0.5 + 0.6 * 3),
            data.digital.map((n) => (n & 0b100000 && 1) * 0.5 + 0.6 * 4),
            data.digital.map((n) => (n & 0b01000000 && 1) * 0.5 + 0.6 * 5),
            data.digital.map((n) => (n & 0b10000000 && 1) * 0.5 + 0.6 * 6)
          ])
      }
    })
  }, [])
  return (
    <>
      {freeMemory}-{didTrigger}
    </>
  )
}

export default ConnectData
