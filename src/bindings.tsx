import { useEffect, useRef, useMemo, useCallback } from 'react'
import { atom, useRecoilState } from 'recoil'
import serial from './Serial'
import { memoize } from 'lodash'

const synchModeState = atom({
  key: 'synch-mode',
  default: true
})

const win = window as any
win.synchMode = true
export const useSynchMode = (): [boolean, (v: boolean) => void] => {
  const [value, setValue1] = useRecoilState(synchModeState)
  const setValue = useCallback(
    (n: boolean) => {
      if (win.synchMode !== n) {
        setValue1(n)
        win.synchMode = n
      }
    },
    [setValue1]
  )
  return [value, setValue]
}
function createHook<T>(key: string, defaultV: T, web2ardu: (v: T) => number) {
  const state = atom({
    key,
    default: defaultV
  })

  return function useState(): [T, (n: T) => void, (n: T) => void] {
    const [value, setValue] = useRecoilState<T>(state)
    const lastVal = useRef(value)
    const receiveValue = useCallback(
      (n: T) => {
        if (win.synchMode && lastVal.current !== n) {
          setValue(n)
          lastVal.current = n
        }
      },
      [setValue]
    )
    const sendValue = useCallback(
      (newValue: T) => {
        serial.write(key + web2ardu(newValue) + '>')
        if (!win.synchMode) setValue(newValue)
      },
      [setValue]
    )

    return [value, sendValue, receiveValue]
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
