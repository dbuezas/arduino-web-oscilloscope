import { atom, selector, DefaultValue } from 'recoil'
import parseSerial from './parseSerial'
import { makeIntercom, memoSelector } from './bindingsHelper'
import { getFFT, getFrequencyCount, oversample } from '../dsp/spectrum'

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
  default: 2.5
})
export const useTriggerPos = makeIntercom<number>({
  key: 'P',
  ui2mcu: (v) => Math.ceil(v),
  mcu2ui: (v) => v,
  default: 512 * 0.5 // TODO: use percentage in ui
})
export const useTicksPerAdcRead = makeIntercom<number>({
  key: 'C',
  ui2mcu: (v) => Math.ceil(v),
  mcu2ui: (v) => v,
  default: 88 // TODO: use frame total time or per division
})
export enum TriggerDirection {
  FALLING = 'Falling',
  RISING = 'Rising'
}
export const useTriggerDirection = makeIntercom<TriggerDirection>({
  key: 'D',
  ui2mcu: (v) => (v == TriggerDirection.RISING ? 0 : 1),
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
    console.log('ui2mcu', v, result)
    return result
  },
  mcu2ui: (v) => {
    const result = Array(8)
      .fill(0)
      .map((_, i) => Boolean(v & (1 << i)))
    console.log('mcu2ui', v, result)
    return result
  },
  default: [true, false, false, false, false, false]
})

export const useAmplifier = makeIntercom<number>({
  key: 'A',
  ui2mcu: (v) => Math.floor(v),
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
  SINGLE = 'Single'
}

export const useTriggerMode = makeIntercom<TriggerMode>({
  key: 'M',
  ui2mcu: (v) => Object.values(TriggerMode).indexOf(v),
  mcu2ui: (v) => Object.values(TriggerMode)[v],
  default: TriggerMode.AUTO
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
export const oversamplingFactorState = memoSelector(
  atom({
    key: 'oversampling-factor',
    default: 0
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
    //https://docs.google.com/spreadsheets/d/1urWB28qDmB_LL_khdBBfB-djku5h4lSx-Cw9l7Rz1u8/edit?usp=sharing
    // TODO: do this in another way
    // account for the last fifth of the ADC, which is not usable
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

const sendFullState = selector<null>({
  key: 'sendFullState-this shouldnt be a selector',
  get: () => null,
  set: ({ get, set }) => {
    set(useTriggerPos.send, get(useTriggerPos.send))
    set(useTicksPerAdcRead.send, get(useTicksPerAdcRead.send))
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
    set(useTicksPerAdcRead.receive, data.ticksPerAdcRead)
    set(useSamplesPerBuffer.receive, data.samplesPerBuffer)
    set(useAmplifier.receive, data.amplifier)
    set(useTriggerVoltage.receive, data.triggerVoltage)
    set(useTriggerDirection.receive, data.triggerDir)
    set(useTriggerChannel.receive, data.triggerChannel)
    set(useTriggerMode.receive, data.triggerMode)
    set(useIsChannelOn.receive, data.isChannelOn)
  }
})

const win = window as any
export const allDataState = selector<number[]>({
  key: 'all-data',
  get: () => [], // this is a write only selector
  set: ({ set, get }, newData) => {
    win.setTicks = (n: number) => set(useTicksPerAdcRead.send, n)
    if (newData instanceof DefaultValue) return
    if (newData.length === 0) return
    const data = parseSerial(newData)
    if (data.needData) set(sendFullState, null)
    if (data.forceUIUpdate) set(receiveFullState, data)

    const [vmin, , vpp] = get(voltageRangeState)
    let buffers = [
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
      const oversamplingFactor = get(oversamplingFactorState)
      const oldData = get(dataState)
      buffers = buffers.map((b, i) =>
        oversample(oversamplingFactor, buffers[i], oldData[i])
      )

      set(dataState, [...buffers, getFFT(buffers[0])])

      if (get(useTriggerMode.send) === TriggerMode.SINGLE) {
        set(isRunningState, false)
      }
    }
  }
})
