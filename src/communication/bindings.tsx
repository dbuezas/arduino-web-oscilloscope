import { atom, selector, DefaultValue } from 'recoil'
import parseSerial from './parseSerial'
import { makeIntercom, memoSelector } from './bindingsHelper'
import { getFFT, getFrequencyCount, oversample } from '../dsp/spectrum'
import win from '../win'

export const useTriggerVoltage = makeIntercom<number>({
  key: 'V',
  ui2mcu: (v, get) => {
    const [vmin, , vpp] = get ? get(voltageRangeState) : [0, 5, 5]
    return Math.ceil(((v + vmin) / vpp) * 255)
  },
  mcu2ui: (n, get) => {
    const [vmin, , vpp] = get ? get(voltageRangeState) : [0, 5, 5]
    return (n / 255) * vpp + vmin
  },
  default: 1
})
export const useTriggerPos = makeIntercom<number>({
  key: 'P',
  ui2mcu: (v, get) => {
    const samples = get ? get(useSamplesPerBuffer.send) : 512
    const result = v * samples
    if (result < 0) return 0
    if (result > samples - 1) return samples - 1
    return result
  },
  mcu2ui: (v, get) => {
    const samples = get ? get(useSamplesPerBuffer.send) : 512
    return v / samples
  },
  default: 0.5
})
export const useSecPerSample = makeIntercom<number>({
  key: 'C',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v,
  default: 0.00000275
})
export const requestData = makeIntercom<number>({
  key: 'R',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v,
  default: 0
})
export enum TriggerDirection {
  FALLING = 'Falling',
  RISING = 'Rising'
}
export const useTriggerDirection = makeIntercom<TriggerDirection>({
  key: 'D',
  ui2mcu: (v) => (v === TriggerDirection.RISING ? 0 : 1),
  mcu2ui: (v) => (v ? TriggerDirection.FALLING : TriggerDirection.RISING),
  default: TriggerDirection.FALLING
})
export const useTriggerChannel = makeIntercom<number>({
  key: 'T',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v,
  default: 0
})
export const useIsChannelOn = makeIntercom<boolean[]>({
  key: 'B',
  ui2mcu: (v) => {
    const result = v
      .map((b) => (b ? 1 : 0) as number)
      .reduce((acc, n, i) => acc + (n << i), 0)
    return result
  },
  mcu2ui: (v) => {
    const result = Array(8)
      .fill(0)
      .map((_, i) => Boolean(v & (1 << i)))
    return result
  },
  default: [true, false, false, false, false, false]
})

export const constrain = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v
export const voltageRanges = [
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
]
export const useAmplifier = makeIntercom<number>({
  key: 'A',
  ui2mcu: (v) => constrain(v, 0, voltageRanges.length - 1),
  mcu2ui: (v) => v,
  default: 1 //TODO: use volt range or per division
})
export const useSamplesPerBuffer = makeIntercom<number>({
  key: 'S',
  ui2mcu: (v) => v,
  mcu2ui: (v) => v,
  default: 512 // TODO: this shouldn't be a setter
})
export enum TriggerMode {
  AUTO = 'Auto',
  NORMAL = 'Normal',
  SINGLE = 'Single',
  SLOW = 'Slow'
}

export const useTriggerMode = makeIntercom<TriggerMode>({
  key: 'M',
  ui2mcu: (v) => Object.values(TriggerMode).indexOf(v),
  mcu2ui: (v) => Object.values(TriggerMode)[v],
  default: TriggerMode.AUTO
})

export type PlotDatum = { t: number; v: number }
export const dataState = atom({
  key: 'data',
  default: [...new Array(8)].map(() => [] as PlotDatum[])
})

export const isRunningState = memoSelector(
  atom({
    key: 'is-running',
    default: true
  })
)
export const oversamplingFactorState = memoSelector(
  atom({
    key: 'oversampling-factor',
    default: 0
  })
)
export const XYModeState = atom({
  key: 'xy-mode',
  default: false
})
export const fftState0 = atom({
  key: 'fft0',
  default: false
})
export const fftState1 = atom({
  key: 'fft1',
  default: false
})

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
  get: ({ get }) => getFrequencyCount(get(dataState)[0])
})

const sum = (signal: number[]) =>
  signal.reduce((previous, current) => previous + current, 0)
export const voltagesState = selector({
  key: 'voltages',
  get: ({ get }) => {
    const signal = get(dataState)[0].map(({ v }) => v)
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
    //https://docs.google.com/spreadsheets/d/1urWB28qDmB_LL_khdBBfB-djku5h4lSx-Cw9l7Rz1u8/edit?usp=sharing
    // TODO: do this in another way
    // TODO: account for the last fifth of the ADC, which is not usable
    const vmax = voltageRanges[get(useAmplifier.send)]
    const vmin = 0
    return [vmin, vmax, vmax - vmin]
  }
})

const sendFullState = selector<null>({
  key: 'sendFullState-this shouldnt be a selector',
  get: () => null,
  set: ({ get, set }) => {
    set(useTriggerPos.send, get(useTriggerPos.send))
    set(useSecPerSample.send, get(useSecPerSample.send))
    set(useSamplesPerBuffer.send, get(useSamplesPerBuffer.send))
    set(useAmplifier.send, get(useAmplifier.send))
    set(useTriggerVoltage.send, get(useTriggerVoltage.send))
    set(useTriggerDirection.send, get(useTriggerDirection.send))
    set(useTriggerChannel.send, get(useTriggerChannel.send))
    set(useTriggerMode.send, get(useTriggerMode.send))
    set(useIsChannelOn.send, get(useIsChannelOn.send))
  }
})

type Data = ReturnType<typeof parseSerial>
const receiveFullState = selector<Data>({
  key: 'receiveFullState-this shouldnt be a selector',
  get: () => {
    throw new Error('write only selector')
  },
  set: ({ set }, data) => {
    if (data instanceof DefaultValue) return
    set(useTriggerPos.receive, data.triggerPos)
    set(useSecPerSample.receive, data.secPerSample)
    set(useSamplesPerBuffer.receive, data.samplesPerBuffer)
    set(useAmplifier.receive, data.amplifier)
    set(useTriggerVoltage.receive, data.triggerVoltage)
    set(useTriggerDirection.receive, data.triggerDir)
    set(useTriggerChannel.receive, data.triggerChannel)
    set(useTriggerMode.receive, data.triggerMode)
    set(useIsChannelOn.receive, data.isChannelOn)
  }
})

export const allDataState = selector<number[]>({
  key: 'all-data-this shouldnt be a selector',
  get: () => [], // this is a write only selector
  set: ({ set, get }, newData) => {
    win.$recoilDebugStates = [] // TODO: fix memory leak in recoiljs beta
    if (newData instanceof DefaultValue) return
    if (newData.length === 0) return
    const data = parseSerial(newData)
    if (data.needData) set(sendFullState, null)
    if (data.forceUIUpdate) set(receiveFullState, data)

    let buffers = data.buffers

    set(freeMemoryState, data.freeMemory)
    set(didTriggerState, !!data.didTrigger)
    const shouldUpdate =
      // todo use isRunning state in board for this
      get(isRunningState) && buffers.some((buffer) => buffer.length > 0)
    if (shouldUpdate) {
      const oldBuffers = get(dataState)

      const oversamplingFactor = get(oversamplingFactorState)
      if (oversamplingFactor > 0) {
        const factor = 1 - 2 / (oversamplingFactor + 1)
        buffers = buffers.map((b, i) =>
          oversample(factor, buffers[i], oldBuffers[i])
        )
      }

      if (get(useTriggerMode.send) === TriggerMode.SLOW) {
        const oldLastT = Math.max(
          ...oldBuffers.map((b) => b[b.length - 1]?.t || 0)
        )

        buffers = buffers.map((b, i) => [
          ...oldBuffers[i],
          ...b.map(({ v, t }) => ({ v, t: t + oldLastT }))
        ])
        const totalSecs =
          get(useSecPerSample.send) * get(useSamplesPerBuffer.send)
        const lastT = Math.max(...buffers.map((b) => b[b.length - 1]?.t || 0))
        if (lastT > totalSecs) {
          buffers = buffers.map(() => [])
        }
      }
      const withFFT = [
        ...buffers,
        get(fftState0) ? getFFT(buffers[0]) : [],
        get(fftState1) ? getFFT(buffers[1]) : []
      ]

      set(dataState, withFFT)
      if (get(useTriggerMode.send) === TriggerMode.SINGLE) {
        set(isRunningState, false)
      }
    }
  }
})
