import { atom, selector, DefaultValue } from 'recoil'
import serial from './Serial'

const synchModeAtom = atom({
  key: 'synch-mode',
  default: true
})

export const synchMode = selector<boolean>({
  key: 'synch-mode-selector',
  get: ({ get }) => get(synchModeAtom),
  set: ({ set, get }, newValue) => {
    const isSynch = get(synchModeAtom)
    if (isSynch !== newValue) {
      set(synchModeAtom, newValue)
      console.log('set synch', newValue)
    }
  }
})

function createHook<T>({
  key,
  ui2mcu,
  mcu2ui
}: {
  key: string
  ui2mcu: (v: T) => number
  mcu2ui: (v: number) => T
}) {
  const localState = atom<number>({
    key,
    default: 0
  })
  const send = selector<T>({
    key: key + '-selector',
    get: ({ get }) => mcu2ui(get(localState)),
    set: ({ set, get }, newValue) => {
      const current = get(localState)
      const mcuValue =
        newValue instanceof DefaultValue ? newValue : ui2mcu(newValue)
      if (current !== mcuValue) {
        const isSynch = get(synchMode)
        if (!isSynch) set(localState, mcuValue)
        serial.write(key + mcuValue + '>')
      }
    }
  })
  const receive = selector<number>({
    key: key + '-local-selector',
    get: ({ get }) => get(localState),
    set: ({ set, get }, newValue) => {
      const current = get(localState)
      if (current !== newValue) {
        const isSynch = get(synchMode)
        console.log(key, 'received', newValue)

        if (isSynch) set(localState, newValue)
      }
    }
  })

  return { send, receive }
}
export const useTriggerVoltage = createHook<number>({
  key: 'V',
  ui2mcu: (v) => Math.ceil((v / 5) * 255),
  mcu2ui: (n) => (n / 255) * 5
})
export const useTriggerPos = createHook<number>({
  key: 'P',
  ui2mcu: (v) => Math.ceil(v),
  mcu2ui: (v) => v
})
export const useAdcClocks = createHook<number>({
  key: 'C',
  ui2mcu: (v) => Math.ceil(v),
  mcu2ui: (v) => v
})
export const useTriggerDirection = createHook<boolean>({
  key: 'D',
  ui2mcu: (v) => (v ? 1 : 0),
  mcu2ui: (v) => !!v
})

export const dataState = atom({
  key: 'data',
  default: [[0], [0], [0], [0], [0], [0], [0]]
})
