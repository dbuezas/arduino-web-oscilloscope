import { useEffect } from 'react'
import throttle from 'lodash/throttle'

import { atom, useRecoilState } from 'recoil'
import serial from './Serial'

const fps = (fps: number) => 1000 / fps

function createHook(key: string, web2ardu = Math.ceil) {
  const state = atom({
    key,
    default: 0
  })
  const sendValue = throttle(
    (newValue: number) => {
      serial.write(key + web2ardu(newValue) + '>')
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

export const useTriggerVoltage = createHook('V', (v: number) =>
  Math.ceil((v / 5) * 255)
)
export const useTriggerPos = createHook('P', Math.ceil)
