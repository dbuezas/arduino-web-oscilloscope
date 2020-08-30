import * as d3 from 'd3'
import React, { useRef, useLayoutEffect, useState, useMemo } from 'react'
import useSize from '@react-hook/size'

import './Plot.css'
import { Datum, renderXAxis, renderYAxis } from './plot.d3'
import {
  useTriggerVoltage,
  useTriggerPos,
  useTicksPerAdcRead,
  dataState,
  useSamplesPerBuffer,
  voltageRangeState
} from '../../communication/bindings'
import { useRecoilValue, useRecoilState } from 'recoil'
const margin = { top: 20, right: 50, bottom: 30, left: 50 }
const constrain = (n: number, min: number, max: number) =>
  n > max ? max : n < min ? min : n

export default function Plot() {
  const data = useRecoilValue(dataState)
  const nodeRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, height] = useSize(containerRef)

  const samples = useRecoilValue(useSamplesPerBuffer.send)
  const ticksPerAdcRead = useRecoilValue(useTicksPerAdcRead.send)
  const [triggerVoltage, setTriggerVoltage] = useRecoilState(
    useTriggerVoltage.send
  )
  const [triggerPosInt, setTriggerPosInt] = useRecoilState(useTriggerPos.send)
  const [draggingTP, setDraggingTP] = useState(false)
  const [draggingTV, setDraggingTV] = useState(false)
  const yDomain = useRecoilValue(voltageRangeState)
  const xDomain = useMemo(() => {
    return [0, (ticksPerAdcRead / 32000000) * samples] as [number, number]
  }, [ticksPerAdcRead, samples])
  const triggerPos = (triggerPosInt / samples) * xDomain[1]
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(xDomain)
      .range([margin.left, width - margin.right])
  }, [xDomain, width])
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(yDomain)
      .rangeRound([height - margin.bottom, margin.top])
  }, [height, yDomain])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const svg = useMemo(() => d3.select(nodeRef.current!), [nodeRef.current])

  useLayoutEffect(() => {
    renderYAxis(svg, yScale, width)
  }, [svg, yScale, width, height])
  useLayoutEffect(() => {
    renderXAxis(svg, xScale, height)
  }, [svg, xScale, width, height])
  const line = useMemo(
    () =>
      d3
        .line<Datum>()
        .x((d, i) => xScale(((i + 0.5) / samples) * xDomain[1]))
        .y((d) => yScale(d)),
    [samples, xDomain, xScale, yScale]
  )

  const ds = data.map((data) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks,react-hooks/exhaustive-deps
    useMemo(() => line(data) || undefined, [line, data])
  )

  return (
    <div className="plotContainer" ref={containerRef}>
      <svg
        className="plot"
        ref={nodeRef}
        onMouseMove={(e) => {
          if (draggingTP) {
            const offsetLeft = nodeRef.current!.getBoundingClientRect().left
            let scaled =
              (xScale.invert(e.clientX - offsetLeft) / xDomain[1]) * samples
            scaled = constrain(scaled, 0, samples)
            setTriggerPosInt(scaled)
          }
          if (draggingTV) {
            const offsetTop = nodeRef.current!.getBoundingClientRect().top
            setTriggerVoltage(yScale.invert(e.clientY - offsetTop))
          }
        }}
        onMouseUp={() => {
          setDraggingTP(false)
          setDraggingTV(false)
        }}
      >
        <g className="x axis"></g>
        <g className="y axis"></g>
        {ds.map((d, i) => (
          <path key={i} className={`plot-area-d${i}`} d={d}></path>
        ))}
        <line
          className="triggerVoltage"
          x1={margin.left}
          x2={width - margin.right}
          y1={yScale(triggerVoltage)}
          y2={yScale(triggerVoltage)}
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
          y1={yScale(triggerVoltage)}
          y2={yScale(triggerVoltage)}
        ></line>
        <text
          fill="currentColor"
          y={yScale(triggerVoltage)}
          x={width - margin.right}
          dy=".32em"
          dx="10"
        >
          {triggerVoltage.toFixed(2)}v
        </text>
        <line
          className="triggerPos"
          x1={xScale(triggerPos)}
          x2={xScale(triggerPos)}
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
          x1={xScale(triggerPos)}
          x2={xScale(triggerPos)}
          y1={height - margin.bottom}
          y2={margin.top}
        ></line>
        <text fill="currentColor" x={xScale(triggerPos)} dx="-1em" dy="1em">
          {Math.round((triggerPos / xDomain[1]) * 100)}%
        </text>
      </svg>
    </div>
  )
}
