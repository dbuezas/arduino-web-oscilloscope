import React, {
  forwardRef,
  MouseEventHandler,
  useImperativeHandle,
  useState
} from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'
import { useTriggerPos } from '../../communication/bindings'
import {
  margin,
  plotHeightSelector,
  xDomainSelector,
  xScaleSelector
} from './hooks'

export type TriggerPosRef = {
  onMouseUp: MouseEventHandler
  onMouseMove: MouseEventHandler
}

const TriggerPosHandle = forwardRef<TriggerPosRef>((_props, ref) => {
  const [draggingTP, setDraggingTP] = useState(false)
  const xScale = useRecoilValue(xScaleSelector)
  const height = useRecoilValue(plotHeightSelector)
  const [triggerPos, setTriggerPos] = useRecoilState(useTriggerPos.send)

  const xDomain = useRecoilValue(xDomainSelector)
  useImperativeHandle(ref, () => ({
    onMouseUp() {
      setDraggingTP(false)
    },
    onMouseMove(e) {
      if (draggingTP) {
        setTriggerPos(xScale.invert(e.nativeEvent.offsetX) / xDomain[1])
      }
    }
  }))
  const scaledX = xScale(triggerPos * xDomain[1])

  return (
    <>
      <line
        className="triggerPos"
        x1={scaledX}
        x2={scaledX}
        y1={height - margin.bottom}
        y2={margin.top}
      ></line>
      <line
        className="triggerPosHandle"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDraggingTP(true)
        }}
        x1={scaledX}
        x2={scaledX}
        y1={height - margin.bottom}
        y2={margin.top}
      ></line>
      <text fill="currentColor" x={scaledX} dx="-1em" dy="1em">
        {Math.round(triggerPos * 100)}%
      </text>
    </>
  )
})

TriggerPosHandle.displayName = 'TriggerPosHandle'
export default TriggerPosHandle
