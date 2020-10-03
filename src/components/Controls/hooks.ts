import mapValues from 'lodash/mapValues'
import { useState } from 'react'

export function useActiveBtns<T extends string>(btns: Record<T, boolean>) {
  const [state, setState] = useState(btns)

  const [timeouts, setTimeouts] = useState(() => mapValues(btns, () => -1))
  const activateBtn = (btn: T) => {
    setState({ ...state, [btn]: true })
    clearTimeout(timeouts[btn])
    const timeout = setTimeout(
      () => setState((timeouts) => ({ ...timeouts, [btn]: false })),
      200
    )
    setTimeouts({ ...timeouts, [btn]: timeout })
  }
  return [state, activateBtn] as [typeof state, typeof activateBtn]
}
