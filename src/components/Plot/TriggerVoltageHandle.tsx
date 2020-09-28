import React, {
  forwardRef,
  MouseEventHandler,
  useImperativeHandle,
  useState
} from 'react'

import { useTriggerVoltage } from '../../communication/bindings'
import { useRecoilState, useRecoilValue } from 'recoil'
import { margin, plotWidthSelector, yScaleSelector } from './hooks'

export type TriggerVoltageRef = {
  onMouseUp: MouseEventHandler
  onMouseMove: MouseEventHandler
}

const TriggerVoltageHandle = forwardRef<TriggerVoltageRef>((_props, ref) => {
  const [draggingTV, setDraggingTV] = useState(false)
  const yScale = useRecoilValue(yScaleSelector)
  const width = useRecoilValue(plotWidthSelector)
  const [triggerVoltage, setTriggerVoltage] = useRecoilState(
    useTriggerVoltage.send
  )
  useImperativeHandle(ref, () => ({
    onMouseUp() {
      setDraggingTV(false)
    },
    onMouseMove(e) {
      if (draggingTV) {
        setTriggerVoltage(yScale.invert(e.nativeEvent.offsetY))
      }
    }
  }))
  const scaledY = yScale(triggerVoltage)
  return (
    <>
      <line
        className="triggerVoltage"
        x1={margin.left}
        x2={width - margin.right}
        y1={scaledY}
        y2={scaledY}
      ></line>
      <line
        className="triggerVoltageHandle"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDraggingTV(true)
        }}
        x1={margin.left}
        x2={width - margin.right}
        y1={scaledY}
        y2={scaledY}
      ></line>
      <text
        fill="currentColor"
        y={scaledY}
        x={width - margin.right}
        dy=".32em"
        dx="10"
      >
        {triggerVoltage.toFixed(2)}v
      </text>
    </>
  )
})

TriggerVoltageHandle.displayName = 'TriggerVoltageHandle'

export default TriggerVoltageHandle
