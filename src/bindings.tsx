import { useEffect } from 'react'
import throttle from 'lodash/throttle'

import { atom, useRecoilState } from 'recoil'
import serial from './Serial'

const triggerVoltageState = atom({
  key: 'TV',
  default: 1
})

const fps = (fps: number) => 1000 / fps

const sendTriggerVoltage = throttle(
  (newValue: number) => {
    const round = Math.ceil((newValue / 5) * 255)
    const toSend = 'V' + round + '>'
    serial.write(toSend)
  },
  fps(10),
  { trailing: true, leading: true }
)

export function useTriggerVoltage(): [number, (n: number) => unknown] {
  const [triggerVoltage, setTriggerVoltage] = useRecoilState(
    triggerVoltageState
  )

  useEffect(() => sendTriggerVoltage(triggerVoltage), [triggerVoltage])

  return [triggerVoltage, setTriggerVoltage]
}

const triggerPosState = atom({
  key: 'TP',
  default: 1
})

const sendTriggerPos = throttle(
  (newValue: number) => {
    const round = Math.ceil(newValue)
    const toSend = 'P' + round + '>'
    serial.write(toSend)
  },
  fps(10),
  { trailing: true, leading: true }
)

export function useTriggerPos(): [number, (n: number) => unknown] {
  const [triggerPos, setTriggerPos] = useRecoilState(triggerPosState)

  useEffect(() => sendTriggerPos(triggerPos), [triggerPos])

  return [triggerPos, setTriggerPos]
}

function createHook(key: string, defaultValue = 0) {
  const state = atom({
    key,
    default: defaultValue
  })
  const sendValue = throttle(
    (newValue: number) => {
      const round = Math.ceil(newValue)
      const toSend = key + round + '>'
      serial.write(toSend)
    },
    fps(10),
    { trailing: true, leading: true }
  )

  return function useState(): [number, (n: number) => unknown] {
    const [value, setValue] = useRecoilState(state)
    useEffect(() => sendValue(value), [value])
    return [value, setValue]
  }
}
