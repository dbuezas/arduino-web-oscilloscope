import { atom, selector, DefaultValue, RecoilState, RecoilValue } from 'recoil'
import serial from './Serial'
import { throttle, identity } from 'lodash'

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
export function createHook<T>({
  key,
  ui2mcu,
  mcu2ui
}: {
  key: string
  ui2mcu: (v: T, get: GetRecoilValue | null) => number
  mcu2ui: (v: number, get: GetRecoilValue | null) => T
}) {
  const remoteState = memoSelector(
    atom<number>({
      key,
      default: 0
    })
  )

  // throttle to avoid filling the MCU serial buffer
  const serial_write = throttle(serial.write, 50, {
    leading: false,
    trailing: true
  })
  const send = selector<T>({
    key: key + '-selector',
    get: ({ get }) => mcu2ui(get(remoteState), get),
    set: ({ set, get }, newValue) => {
      if (newValue instanceof DefaultValue) throw new Error('no reset allowed')
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
