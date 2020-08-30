import { atom, selector, DefaultValue } from 'recoil'
import parseSerial from './parseSerial'
import { createHook, memoSelector } from './bindingsHelper'
import { getFFT, getFrequencyCount } from './spectrum'

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
export const useIsBuffer0ON = createHook<number>({
  key: '0',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v
})
export const useIsBuffer1ON = createHook<number>({
  key: '1',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v
})
export const useIsBuffer2ON = createHook<number>({
  key: '2',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v
})
export const useAmplifier = createHook<number>({
  key: 'A',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v
})
export const useSamplesPerBuffer = createHook<number>({
  key: 'S',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v
})
export enum TriggerMode {
  AUTO = 'Auto',
  NORMAL = 'Normal',
  SINGLE = 'Single'
}

export const useTriggerMode = createHook<TriggerMode>({
  key: 'M',
  ui2mcu: (v) => Object.values(TriggerMode).indexOf(v),
  mcu2ui: (v) => Object.values(TriggerMode)[v]
})

export const dataState = atom({
  key: 'data',
  default: [[0], [0], [0], [0], [0], [0], [0]]
})

export const isRunningState = memoSelector(
  atom({
    key: 'is-running',
    default: true
  })
)
export const isOversamplingState = memoSelector(
  atom({
    key: 'is-oversampling',
    default: false
  })
)
export const didTriggerState = memoSelector(
  atom({
    key: 'did-trigger',
    default: false
  })
)
export const freeMemoryState = memoSelector(
  atom({
    key: 'free-memory',
    default: 0
  })
)
export const frequencyState = selector({
  key: 'frequency',
  get: ({ get }) => {
    const secs =
      (get(useTicksPerAdcRead.send) / 32000000) * get(useSamplesPerBuffer.send)
    return getFrequencyCount(get(dataState)[0], secs)
  }
})

const sum = (signal: number[]) =>
  signal.reduce((previous, current) => previous + current, 0)
export const voltagesState = selector({
  key: 'voltages',
  get: ({ get }) => {
    const signal = get(dataState)[0]
    const vmax = Math.max(...signal)
    const vmin = Math.min(...signal)
    const vpp = vmax - vmin
    const vavr = sum(signal) / signal.length

    return {
      vavr,
      vpp,
      vmin,
      vmax
    }
  }
})

const win = window as any
export const allDataState = selector<number[]>({
  key: 'all-data',
  get: () => [], // this is a write only selector
  set: ({ set, get }, newData) => {
    if (newData instanceof DefaultValue) return
    if (newData.length === 0) return
    const data = parseSerial(newData)
    if (data.forceUIUpdate) {
      set(useTriggerPos.receive, data.triggerPos)
      set(useTicksPerAdcRead.receive, data.ticksPerAdcRead)
      win.setTicks = (n: number) => set(useTicksPerAdcRead.send, n)
      set(useSamplesPerBuffer.receive, data.samplesPerBuffer)
      set(useTriggerVoltage.receive, data.triggerVoltageInt)
      set(useTriggerDirection.receive, data.triggerDir)
      set(useTriggerChannel.receive, data.triggerChannel)
      set(useAmplifier.receive, data.amplifier)
      set(useTriggerMode.receive, data.triggerMode)
      set(useIsBuffer0ON.receive, data.isBuffer0ON)
      set(useIsBuffer1ON.receive, data.isBuffer1ON)
      set(useIsBuffer2ON.receive, data.isBuffer2ON)
    }

    set(freeMemoryState, data.freeMemory)
    set(didTriggerState, data.didTrigger)
    const shouldUpdate =
      // todo use isRunning state in board for this
      get(isRunningState) && data.buffers.some((buffer) => buffer.length > 0)
    if (shouldUpdate) {
      if (get(isOversamplingState)) {
        const smoothingFactor = 0.9
        const oldData = get(dataState)
        const avrData = data.buffers.map((b, i) =>
          b.map(
            (n, j) =>
              (oldData[i][j] || 0) * smoothingFactor + n * (1 - smoothingFactor)
          )
        )
        set(dataState, [...avrData, getFFT(avrData[0])])
      } else {
        set(dataState, [...data.buffers, getFFT(data.buffers[0])])
      }
      if (get(useTriggerMode.send) === TriggerMode.SINGLE) {
        set(isRunningState, false)
      }
    }
  }
})
