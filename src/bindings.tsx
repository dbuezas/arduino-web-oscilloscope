import { atom, selector, DefaultValue, RecoilState } from 'recoil'
import ft from 'fourier-transform'
import serial from './Serial'
import parseSerial from './parseSerial'
import { throttle } from 'lodash'

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
      // TODO: this synch mode thing needs rework
      // Ideally the state is stored only in the board, but
      // that makes the UI laggy for long frames, since the MCU
      // doesn't have time to respond to UI changes
      set(isSynchronousMode, newValue)
    }
  }
})

function makeSelector<T>(theAtom: RecoilState<T>) {
  return selector<T>({
    key: theAtom.key + '_selector',
    get: ({ get }) => get(theAtom),
    set: ({ set, get }, newValue) => {
      const old = get(theAtom)
      if (old !== newValue) {
        set(theAtom, newValue)
      }
    }
  })
}

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

  // throttle to avoid filling the MCU serial buffer
  const serial_write = throttle(serial.write, 50, {
    leading: false,
    trailing: true
  })
  let last = performance.now()
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
        serial_write(key + mcuValue + '>')
        last = performance.now()
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

export const isRunningState = makeSelector(
  atom({
    key: 'is-running',
    default: true
  })
)
export const isOversamplingState = makeSelector(
  atom({
    key: 'is-oversampling',
    default: false
  })
)
export const didTriggerState = makeSelector(
  atom({
    key: 'did-trigger',
    default: false
  })
)
export const freeMemoryState = makeSelector(
  atom({
    key: 'free-memory',
    default: 0
  })
)
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
    set(useAmplifier.receive, data.amplifier)
    set(useTriggerMode.receive, data.triggerMode)
    set(useIsBuffer0ON.receive, data.isBuffer0ON)
    set(useIsBuffer1ON.receive, data.isBuffer1ON)
    set(useIsBuffer2ON.receive, data.isBuffer2ON)
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
        const fourier = ft(avrData[0])

        set(dataState, [...avrData, fourier])
      } else {
        const fourier = ft(data.buffers[0])
        {
          const d = data.buffers[0]
          const max = Math.max(...d)
          const min = Math.min(...d)
          const mid = (max - min) / 2
          let firstCross = -1
          let lastCross = 0
          let count = 0
          for (let i = 1; i < d.length; i++) {
            if (d[i - 1] < mid && d[i] >= mid) {
              count++
              if (firstCross < 0) firstCross = i
              lastCross = i
            }
          }

          let maxA = 0
          let maxI = 0
          for (let i = 1; i < fourier.length; i++) {
            if (maxA < fourier[i]) {
              maxA = fourier[i]
              maxI = i
            }
          }
          const sPerFrame =
            (data.ticksPerAdcRead / 32000000) * data.samplesPerBuffer
          let sFirstToLast =
            ((lastCross - firstCross) / data.samplesPerBuffer) * sPerFrame
          if (firstCross < 0) sFirstToLast = Number.MAX_VALUE
          console.log(
            'freq count',
            (count - 1) / sFirstToLast,
            'freq fft',
            maxI / sPerFrame
          )
          set(dataState, [...data.buffers, fourier])
        }
        // set(dataState, [...data.buffers, fourier])
      }

      // set(dataState, data.buffers)
      if (get(useTriggerMode.send) === TriggerMode.SINGLE) {
        set(isRunningState, false)
      }
    }
  }
})
