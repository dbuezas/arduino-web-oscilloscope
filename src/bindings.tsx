import { useEffect } from 'react'

import { atom, useRecoilState } from 'recoil'
import serial from './Serial'

function createHook<T>(key: string, defaultV: T, web2ardu: (v: T) => number) {
  const state = atom({
    key,
    default: defaultV
  })
  const sendValue = (newValue: T) => {
    serial.write(key + web2ardu(newValue) + '>')
  }

  return function useState(): [T, (n: T) => void] {
    const [value, setValue] = useRecoilState<T>(state)
    useEffect(() => sendValue(value), [value])
    return [value, setValue]
  }
}
export const useTriggerVoltage = createHook<number>('V', 0, (v) =>
  Math.ceil((v / 5) * 255)
)
export const useTriggerPos = createHook<number>('P', 0, (v) => Math.ceil(v))
export const useAdcClocks = createHook<number>('C', 79, (v) => Math.ceil(v))
export const useTriggerDirection = createHook<boolean>('D', false, (v) =>
  v ? 1 : 0
)
export const useBlockInterrupts = createHook<boolean>('B', false, (v) =>
  v ? 1 : 0
)
