import { atom, selector, DefaultValue } from 'recoil'
import serial from './Serial'
import parseSerial from './parseSerial'

const isSynchronousMode = atom({
  key: 'synch-mode',
  default: true
})

export const synchMode = selector<boolean>({
  key: 'synch-mode-selector',
  get: ({ get }) => get(isSynchronousMode),
  set: ({ set, get }, newValue) => {
    const isSynch = get(isSynchronousMode)
    if (isSynch !== newValue) {
      set(isSynchronousMode, newValue)
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

export enum TriggerMode {
  AUTO = 'Auto',
  SINGLE = 'Single',
  NORMAL = 'Normal'
}
export const triggerModeState = atom<TriggerMode>({
  key: 'trigger-mode',
  default: TriggerMode.AUTO
})

export const isRunningState = atom({
  key: 'is-running',
  default: true
})
export const didTriggerState = atom({
  key: 'did-trigger',
  default: false
})
export const freeMemoryState = atom({
  key: 'free-memory',
  default: 0
})

export const allDataState = selector<number[]>({
  key: 'all-data',
  get: () => [], // this is a write only selector
  set: ({ set, get }, newData) => {
    if (newData instanceof DefaultValue) return
    const data = parseSerial(newData)
    if (data.analog.length == 0) return // TODO: some CRC instead?
    set(useTriggerPos.receive, data.triggerPos)
    set(useAdcClocks.receive, data.ADC_MAIN_CLOCK_TICKS)
    set(useTriggerVoltage.receive, data.triggerVoltageInt)
    set(useTriggerDirection.receive, data.triggerDir)
    const triggerMode = get(triggerModeState)
    const canUpdate = {
      [TriggerMode.AUTO]: true,
      [TriggerMode.SINGLE]: Boolean(data.didTrigger),
      [TriggerMode.NORMAL]: Boolean(data.didTrigger)
    }[triggerMode]

    set(freeMemoryState, data.freeMemory)
    const shouldUpdate = get(isRunningState) && canUpdate
    if (shouldUpdate) {
      set(didTriggerState, data.didTrigger)
      set(dataState, [
        data.analog.map((n) => (n / 256) * 5),
        data.digital.map((n) => (n & 0b100 && 1) * 0.5 + 0.6 * 1),
        data.digital.map((n) => (n & 0b1000 && 1) * 0.5 + 0.6 * 2),
        data.digital.map((n) => (n & 0b10000 && 1) * 0.5 + 0.6 * 3),
        data.digital.map((n) => (n & 0b100000 && 1) * 0.5 + 0.6 * 4),
        data.digital.map((n) => (n & 0b01000000 && 1) * 0.5 + 0.6 * 5),
        data.digital.map((n) => (n & 0b10000000 && 1) * 0.5 + 0.6 * 6)
      ])
      if (triggerMode === TriggerMode.SINGLE) {
        set(isRunningState, false)
      }
    }
  }
})
