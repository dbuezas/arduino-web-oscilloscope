import React, { useRef, useEffect } from 'react'

import './Plot.css'
import updatePlot, { Datum } from './plot.d3'
import { useTriggerVoltage, useTriggerPos } from './bindings'

type Props = {
  data: Datum[][]
}
export default function Plot(props: Props) {
  const nodeRef = useRef<SVGSVGElement>(null)
  const [triggerVoltage, setTriggerVoltage] = useTriggerVoltage()
  const [triggerPos, setTriggerPos] = useTriggerPos()

  useEffect(() => {
    const node = nodeRef.current!
    updatePlot(
      node,
      triggerVoltage,
      setTriggerVoltage,
      triggerPos,
      setTriggerPos,
      [0, 500],
      props.data,
      {
        width: window.innerWidth,
        height: window.innerHeight - 200
      }
    )
  }, [props.data, triggerVoltage, triggerPos, setTriggerVoltage, setTriggerPos])

  return (
    <svg
      ref={nodeRef}
      width={window.innerWidth}
      height={window.innerHeight - 200}
    >
      <g className="x axis"></g>
      <g className="y axis"></g>
      <path className="plot-area-d2"></path>
      <path className="plot-area-d3"></path>
      <path className="plot-area-d4"></path>
      <path className="plot-area-d5"></path>
      <path className="plot-area-d6"></path>
      <path className="plot-area-d7"></path>
      <path className="plot-area"></path>
    </svg>
  )
}
