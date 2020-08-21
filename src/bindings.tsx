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
export const useTicksPerAdcRead = createHook<number>({
  key: 'C',
  ui2mcu: (v) => Math.ceil(v),
  mcu2ui: (v) => v
})
export const useTriggerDirection = createHook<boolean>({
  key: 'D',
  ui2mcu: (v) => (v ? 1 : 0),
  mcu2ui: (v) => !!v
})
export const useTriggerChannel = createHook<number>({
  key: 'T',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v
})
export const useSamplesPerBuffer = createHook<number>({
  key: 'samples-per-buffer',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v
})
export enum TriggerMode {
  AUTO = 'Auto',
  SINGLE = 'Single',
  NORMAL = 'Normal'
}

export const useTriggerMode = createHook<TriggerMode>({
  key: 'M',
  ui2mcu: (v) => Object.values(TriggerMode).indexOf(v),
  mcu2ui: (v) => Object.values(TriggerMode)[v]
})

export const dataState = atom({
  key: 'data',
  default: [[0], [0], [0], [0], [0], [0]]
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
// TODO: receive and send are terrible names
// they should be raw and ui or st like that
export const allDataState = selector<number[]>({
  key: 'all-data',
  get: () => [], // this is a write only selector
  set: ({ set, get }, newData) => {
    if (newData instanceof DefaultValue) return
    if (newData.length === 0) return
    const data = parseSerial(newData)
    set(useTriggerPos.receive, data.triggerPos)
    set(useTicksPerAdcRead.receive, data.ticksPerAdcRead)
    ;(window as any).setTicks = (t: number) => set(useTicksPerAdcRead.send, t)
    set(useSamplesPerBuffer.receive, data.samplesPerBuffer)
    set(useTriggerVoltage.receive, data.triggerVoltageInt)
    set(useTriggerDirection.receive, data.triggerDir)
    set(useTriggerChannel.receive, data.triggerChannel)
    set(useTriggerMode.receive, data.triggerMode)
    // if (get(useTriggerMode.send) != TriggerMode.SINGLE)
    //   set(isRunningState, true)
    // set(freeMemoryState, data.freeMemory)
    const shouldUpdate =
      // todo use isRunning state in board for this
      get(isRunningState) && data.buffers.some((buffer) => buffer.length > 0)
    if (shouldUpdate) {
      // set(didTriggerState, data.didTrigger)
      set(dataState, data.buffers)
      // if (get(useTriggerMode.send) === TriggerMode.SINGLE) {
      //   set(isRunningState, false)
      // }
    }
  }
})
