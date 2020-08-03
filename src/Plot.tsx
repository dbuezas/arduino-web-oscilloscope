import React, { useRef, useLayoutEffect } from 'react'

import './Plot.css'
import updatePlot, { Datum } from './plot.d3'
import { useTriggerVoltage, useTriggerPos } from './bindings'

type Props = {
  data: Datum[]
  dataD2: Datum[]
  dataD3: Datum[]
  dataD4: Datum[]
  dataD5: Datum[]
  dataD6: Datum[]
  dataD7: Datum[]
}
export default function Plot(props: Props) {
  const nodeRef = useRef<SVGSVGElement>(null)
  const [triggerVoltage, setTriggerVoltage] = useTriggerVoltage()
  const [triggerPos, setTriggerPos] = useTriggerPos()

  useLayoutEffect(() => {
    const node = nodeRef.current!
    updatePlot(
      node,
      triggerVoltage,
      setTriggerVoltage,
      triggerPos,
      setTriggerPos,
      props.data,
      props.dataD2,
      props.dataD3,
      props.dataD4,
      props.dataD5,
      props.dataD6,
      props.dataD7,
      {
        width: window.innerWidth,
        height: window.innerHeight - 200
      }
    )
  }, [
    props.data,
    nodeRef.current,
    triggerVoltage,
    triggerPos,
    window.innerWidth,
    window.innerHeight
  ])
  // useLayoutEffect(() => {
  //   const node = nodeRef.current!
  //   updatePlot(node, props.data, {
  //     width: window.innerWidth,
  //     height: window.innerHeight - 200
  //   })
  // }, [props.data])
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
