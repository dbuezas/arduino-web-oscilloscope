import { atom, selector, DefaultValue, RecoilState, RecoilValue } from 'recoil'
import serial from './Serial'

export function memoSelector<T>(theAtom: RecoilState<T>) {
  return selector<T>({
    key: 'memo' + theAtom.key,
    get: ({ get }) => get(theAtom),
    set: ({ set, get }, newValue) => {
      const old = get(theAtom)
      if (old !== newValue) {
        set(theAtom, newValue)
      }
    }
  })
}
type GetRecoilValue = <T>(recoilVal: RecoilValue<T>) => T
export function makeIntercom<T>({
  key,
  ui2mcu,
  mcu2ui,
  default: defaultValue
}: {
  key: string
  ui2mcu: (v: T, get: GetRecoilValue | null) => number
  mcu2ui: (v: number, get: GetRecoilValue | null) => T
  default: T
}) {
  const remoteState = memoSelector(
    atom<number>({
      key,
      default: ui2mcu(defaultValue, null)
    })
  )

  // throttle to avoid filling the MCU serial buffer
  const serial_write = serial.write
  // const serial_write = throttle(serial.write, 40, {
  //   leading: false,
  //   trailing: true
  // })
  const send = selector<T>({
    key: key + '-selector',
    get: ({ get }) => mcu2ui(get(remoteState), get),
    set: ({ set, get, reset }, newValue) => {
      if (newValue instanceof DefaultValue) return reset(remoteState)
      set(remoteState, ui2mcu(newValue, get))
      serial_write(key + ui2mcu(newValue, get) + '>')
    }
  })
  const receive = selector<number>({
    key: key + '-receive-selector',
    get: () => {
      throw new Error('cant get here')
    },
    set: ({ set }, newValue) => {
      if (newValue instanceof DefaultValue) throw new Error('no reset allowed')
      set(remoteState, newValue)
    }
  })

  return { send, receive }
}
