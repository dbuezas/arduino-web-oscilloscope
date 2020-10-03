import { useState } from 'react'

export function useActiveBtns() {
  const [state, setState] = useState(false)

  const [timeout, setTimeout] = useState(-1)
  const activateBtn = () => {
    setState(true)
    clearTimeout(timeout)
    const timeoutId = window.setTimeout(() => setState(false), 200)
    setTimeout(timeoutId)
  }
  return [state, activateBtn] as [typeof state, typeof activateBtn]
}
