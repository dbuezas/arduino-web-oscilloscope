import React, { useEffect, useRef } from 'react'
import useSize from '@react-hook/size'

import './Plot.css'
import {
  dataState,
  useIsChannelOn,
  XYModeState
} from '../../communication/bindings'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import TriggerVoltageHandle, { TriggerVoltageRef } from './TriggerVoltageHandle'
import TriggerPosHandle, { TriggerPosRef } from './TriggerPosHandle'
import {
  lineSelector,
  plotHeightSelector,
  plotWidthSelector,
  XYLineSelector
} from './hooks'
import XAxis from './XAxis'
import YAxis from './YAxis'
import Measure, { MeasureRef } from './Measure'

function XYCurve() {
  const xyMode = useRecoilValue(XYModeState)
  const isChannelOn = useRecoilValue(useIsChannelOn.send)

  const xyLine = useRecoilValue(XYLineSelector)
  const data = useRecoilValue(dataState)
  const d = data[0].map(
    (d, i) => [-data[1][i]?.v || 0, d.v] as [number, number]
  )
  if (!xyMode || !isChannelOn[0] || !isChannelOn[1]) return <></>
  return (
    <>
      <path className={`plot-area-xy`} d={xyLine(d) || undefined}></path>
    </>
  )
}
function Curves() {
  const line = useRecoilValue(lineSelector)
  const data = useRecoilValue(dataState)
  const ds = data.map((data) => line(data) || undefined)
  const analogs = ds.slice(0, 2)
  const digitals = ds.slice(2, 6)
  const ffts = ds.slice(6, 8)
  return (
    <>
      {analogs.map((d, i) => (
        <path key={i} className={`plot-area-a${i}`} d={d}></path>
      ))}
      {digitals.map((d, i) => (
        <path key={i} className={`plot-area-d${i}`} d={d}></path>
      ))}
      {ffts.map((d, i) => (
        <path key={i} className={`plot-area-fft${i}`} d={d}></path>
      ))}
    </>
  )
}

export default function Plot() {
  const nodeRef = useRef<SVGSVGElement>(null)
  const triggerPosRef = useRef<TriggerPosRef>(null)
  const triggerVoltageRef = useRef<TriggerVoltageRef>(null)
  const measureRef = useRef<MeasureRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, height] = useSize(containerRef)
  const setPlotHeight = useSetRecoilState(plotHeightSelector)
  const setPlotWidth = useSetRecoilState(plotWidthSelector)
  useEffect(() => {
    setPlotHeight(height)
    setPlotWidth(width)
  }, [height, setPlotHeight, setPlotWidth, width])
  return (
    <div className="plotContainer" ref={containerRef}>
      <svg
        className="plot"
        ref={nodeRef}
        onMouseMove={(e) => {
          triggerPosRef.current?.onMouseMove(e)
          triggerVoltageRef.current?.onMouseMove(e)
          measureRef.current?.onMouseMove(e)
          e.preventDefault()
        }}
        onMouseLeave={(e) => {
          triggerPosRef.current?.onMouseUp(e)
          triggerVoltageRef.current?.onMouseUp(e)
          measureRef.current?.onMouseUp(e)
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          triggerPosRef.current?.onMouseUp(e)
          triggerVoltageRef.current?.onMouseUp(e)
          measureRef.current?.onMouseUp(e)
          e.preventDefault()
        }}
        onMouseDown={(e) => {
          measureRef.current?.onMouseDown(e)
          e.preventDefault()
        }}
      >
        <XAxis />
        <YAxis />
        <Curves />
        <XYCurve />
        <Measure ref={measureRef} />
        <TriggerVoltageHandle ref={triggerVoltageRef} />
        <TriggerPosHandle ref={triggerPosRef} />
      </svg>
    </div>
  )
}
