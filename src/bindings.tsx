import { atom, selector, DefaultValue } from 'recoil'
import parseSerial from './parseSerial'
import { createHook, memoSelector } from './bindingsHelper'
import { getFFT, getFrequencyCount } from './spectrum'

export const useTriggerVoltage = createHook<number>({
  key: 'V',
  ui2mcu: (v, get) => {
    if (!get) return 0
    const [vmin, , vpp] = get(voltageRangeState)
    return Math.ceil(((v + vmin) / vpp) * 255)
  },
  mcu2ui: (n, get) => {
    if (!get) return 0
    const [vmin, , vpp] = get(voltageRangeState)
    return (n / 255) * vpp + vmin
  }
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
  ui2mcu: (v) => Math.floor(v),
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
export const voltageRangeState = selector({
  key: 'voltage-range',
  get: ({ get }) => {
    const vmax = [
      25,
      6.25,
      5,
      3.125,
      1.5625,
      0.78125,
      0.78125,
      0.625,
      0.390625,
      0.3125,
      0.1953125,
      0.15625
    ][get(useAmplifier.send)]
    const vmin = 0
    return [vmin, vmax, vmax - vmin]
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
    win.setTicks = (n: number) => set(useTicksPerAdcRead.send, n)
    if (data.forceUIUpdate) {
      set(useTriggerPos.receive, data.triggerPos)
      set(useTicksPerAdcRead.receive, data.ticksPerAdcRead)
      set(useSamplesPerBuffer.receive, data.samplesPerBuffer)
      set(useAmplifier.receive, data.amplifier)
      set(useTriggerVoltage.receive, data.triggerVoltageInt)
      set(useTriggerDirection.receive, data.triggerDir)
      set(useTriggerChannel.receive, data.triggerChannel)
      set(useTriggerMode.receive, data.triggerMode)
      set(useIsBuffer0ON.receive, data.isBuffer0ON)
      set(useIsBuffer1ON.receive, data.isBuffer1ON)
      set(useIsBuffer2ON.receive, data.isBuffer2ON)
    }

    const [vmin, , vpp] = get(voltageRangeState)
    const buffers = [
      data.buffers[0].map((n) => (n / 256) * vpp + vmin),
      data.buffers[1].map((n) => (n / 256) * vpp + vmin),
      data.buffers[2].map((n) => n * (vpp / 6) + vmin + 0.2 * vpp),
      data.buffers[3].map((n) => n * (vpp / 6) + vmin + 0.4 * vpp),
      data.buffers[4].map((n) => n * (vpp / 6) + vmin + 0.6 * vpp),
      data.buffers[5].map((n) => n * (vpp / 6) + vmin + 0.8 * vpp)
    ]

    set(freeMemoryState, data.freeMemory)
    set(didTriggerState, data.didTrigger)
    const shouldUpdate =
      // todo use isRunning state in board for this
      get(isRunningState) && buffers.some((buffer) => buffer.length > 0)
    if (shouldUpdate) {
      if (get(isOversamplingState)) {
        const smoothingFactor = 0.9
        const oldData = get(dataState)
        const avrData = buffers.map((b, i) =>
          b.map(
            (n, j) =>
              (oldData[i][j] || 0) * smoothingFactor + n * (1 - smoothingFactor)
          )
        )
        set(dataState, [...avrData, getFFT(avrData[0])])
      } else {
        set(dataState, [...buffers, getFFT(buffers[0])])
      }
      if (get(useTriggerMode.send) === TriggerMode.SINGLE) {
        set(isRunningState, false)
      }
    }
  }
})
