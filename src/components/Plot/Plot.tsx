import React, { useRef, useState } from 'react'
import useSize from '@react-hook/size'

import './Plot.css'
import { dataState } from '../../communication/bindings'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import TriggerVoltageHandle, { TriggerVoltageRef } from './TriggerVoltageHandle'
import TriggerPosHandle, { TriggerPosRef } from './TriggerPosHandle'
import { lineSelector, plotHeightSelector, plotWidthSelector } from './hooks'
import XAxis from './XAxis'
import YAxis from './YAxis'

function Curves() {
  const line = useRecoilValue(lineSelector)
  const data = useRecoilValue(dataState)
  const ds = data.map((data) => line(data) || undefined)
  return (
    <>
      {ds.map((d, i) => (
        <path key={i} className={`plot-area-d${i}`} d={d}></path>
      ))}
    </>
  )
}

export default function Plot() {
  const nodeRef = useRef<SVGSVGElement>(null)
  const triggerPosRef = useRef<TriggerPosRef>(null)
  const triggerVoltageRef = useRef<TriggerVoltageRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, height] = useSize(containerRef)
  const setPlotHeight = useSetRecoilState(plotHeightSelector)
  setPlotHeight(height)
  const setPlotWidth = useSetRecoilState(plotWidthSelector)
  setPlotWidth(width)
  return (
    <div className="plotContainer" ref={containerRef}>
      <svg
        className="plot"
        ref={nodeRef}
        onMouseMove={(e) => {
          triggerPosRef.current?.onMouseMove(e)
          triggerVoltageRef.current?.onMouseMove(e)
        }}
        onMouseUp={(e) => {
          triggerPosRef.current?.onMouseUp(e)
          triggerVoltageRef.current?.onMouseUp(e)
        }}
      >
        <XAxis />
        <YAxis />
        <Curves />

        <TriggerVoltageHandle ref={triggerVoltageRef} />
        <TriggerPosHandle ref={triggerPosRef} />
      </svg>
    </div>
  )
}
