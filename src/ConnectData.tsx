import React, { useEffect } from 'react'
import { freeMemoryState, didTriggerState, allDataState } from './bindings'

import serial from './Serial'
import { useRecoilValue, useSetRecoilState } from 'recoil'

function ConnectData() {
  const freeMemory = useRecoilValue(freeMemoryState)
  const didTrigger = useRecoilValue(didTriggerState)
  const setAllData = useSetRecoilState(allDataState)
  useEffect(() => {
    serial.onData(setAllData)
  }, [setAllData])
  return (
    <>
      {freeMemory}-{didTrigger}
    </>
  )
}

export default ConnectData
