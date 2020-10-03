import { isEqual } from 'lodash'
import React, {
  forwardRef,
  MouseEventHandler,
  useImperativeHandle,
  useState
} from 'react'

import { useRecoilValue } from 'recoil'
import { formatTime, formatVoltage } from '../formatters'
import { xScaleSelector, yScaleSelector } from './hooks'

export type MeasureRef = {
  onMouseDown: MouseEventHandler
  onMouseUp: MouseEventHandler
  onMouseMove: MouseEventHandler
}

const Measure = forwardRef<MeasureRef>((_props, ref) => {
  const [dragging, setDragging] = useState(false)
  const xScale = useRecoilValue(xScaleSelector)
  const yScale = useRecoilValue(yScaleSelector)
  const [startPos, setStartPos] = useState({ x: -1, y: -1 })
  const [endPos, setEndPos] = useState({ x: -1, y: -1 })
  useImperativeHandle(ref, () => ({
    onMouseDown(e) {
      setStartPos({
        x: xScale.invert(e.nativeEvent.offsetX),
        y: yScale.invert(e.nativeEvent.offsetY)
      })
      setEndPos({
        x: xScale.invert(e.nativeEvent.offsetX),
        y: yScale.invert(e.nativeEvent.offsetY)
      })
      setDragging(true)
    },
    onMouseUp(e) {
      if (dragging) {
        setEndPos({
          x: xScale.invert(e.nativeEvent.offsetX),
          y: yScale.invert(e.nativeEvent.offsetY)
        })
        setDragging(false)
      }
    },
    onMouseMove(e) {
      if (dragging) {
        setEndPos({
          x: xScale.invert(e.nativeEvent.offsetX),
          y: yScale.invert(e.nativeEvent.offsetY)
        })
      }
    }
  }))
  if (isEqual(startPos, endPos)) return <></>
  return (
    <>
      <line
        className="measureCap"
        x1={xScale(startPos.x) - 5}
        x2={xScale(startPos.x) + 5}
        y1={yScale(startPos.y) - 5}
        y2={yScale(startPos.y) + 5}
      ></line>
      <line
        className="measureCap"
        x1={xScale(startPos.x) - 5}
        x2={xScale(startPos.x) + 5}
        y1={yScale(startPos.y) + 5}
        y2={yScale(startPos.y) - 5}
      ></line>
      <line
        className="measureX"
        x1={xScale(startPos.x)}
        x2={xScale(endPos.x)}
        y1={yScale(endPos.y)}
        y2={yScale(endPos.y)}
      ></line>
      <text
        fill="currentColor"
        x={xScale((startPos.x + endPos.x) / 2)}
        y={yScale(endPos.y)}
        dx="-1em"
        dy="1em"
      >
        {formatTime(endPos.x - startPos.x)}
      </text>
      <line
        className="measureCap"
        x1={xScale(endPos.x) - 5}
        x2={xScale(endPos.x) + 5}
        y1={yScale(endPos.y) - 5}
        y2={yScale(endPos.y) + 5}
      ></line>
      <line
        className="measureCap"
        x1={xScale(endPos.x) - 5}
        x2={xScale(endPos.x) + 5}
        y1={yScale(endPos.y) + 5}
        y2={yScale(endPos.y) - 5}
      ></line>
      <line
        className="measureY"
        x1={xScale(startPos.x)}
        x2={xScale(startPos.x)}
        y1={yScale(startPos.y)}
        y2={yScale(endPos.y)}
      ></line>
      <text
        fill="currentColor"
        x={xScale(startPos.x)}
        y={yScale((startPos.y + endPos.y) / 2)}
        dx="-1em"
        dy="0"
        textAnchor="end"
      >
        {formatVoltage(endPos.y - startPos.y)}
      </text>
    </>
  )
})

Measure.displayName = 'Measure'
export default Measure
