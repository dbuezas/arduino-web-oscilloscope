import * as d3 from 'd3'
import React, { useRef, useLayoutEffect, useState, useMemo } from 'react'

import './Plot.css'
import { Datum, renderXAxis, renderYAxis } from './plot.d3'
import {
  useTriggerVoltage,
  useTriggerPos,
  useAdcClocks,
  dataState
} from './bindings'
import { useRecoilValue, useRecoilState } from 'recoil'
const margin = { top: 20, right: 50, bottom: 30, left: 50 }
const constrain = (n: number, min: number, max: number) =>
  n > max ? max : n < min ? min : n

export default function Plot() {
  const data = useRecoilValue(dataState)
  const nodeRef = useRef<SVGSVGElement>(null)
  const [adcClocks] = useRecoilState(useAdcClocks.send)
  const [triggerVoltage, setTriggerVoltage] = useRecoilState(
    useTriggerVoltage.send
  )
  const [triggerPosInt, setTriggerPosInt] = useRecoilState(useTriggerPos.send)
  const [draggingTP, setDraggingTP] = useState(false)
  const [draggingTV, setDraggingTV] = useState(false)
  const samples = data[0].length

  const size = useMemo(
    () => ({
      width: window.innerWidth,
      height: window.innerHeight - 200
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [window.innerWidth, window.innerHeight]
  )
  const yDomain = useMemo(() => [0, 5] as [number, number], [])
  const xDomain = useMemo(() => {
    return [0, (adcClocks / 32000000) * samples] as [number, number]
  }, [adcClocks, samples])
  const triggerPos = (triggerPosInt / samples) * xDomain[1]
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(xDomain)
      .range([margin.left, size.width - margin.right])
  }, [xDomain, size.width])
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(yDomain)
      .rangeRound([size.height - margin.bottom, margin.top])
  }, [size.height, yDomain])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const svg = useMemo(() => d3.select(nodeRef.current!), [nodeRef.current])

  useLayoutEffect(() => {
    renderYAxis(svg, yScale, size)
  }, [svg, yScale, size])
  useLayoutEffect(() => {
    renderXAxis(svg, xScale, size)
  }, [svg, xScale, size])
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
  const offset = useMemo(
    () => nodeRef.current?.getBoundingClientRect() || { top: 0, left: 0 },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, nodeRef.current]
  )

  return (
    <svg
      ref={nodeRef}
      width={size.width}
      height={size.height}
      onMouseMove={(e) => {
        if (draggingTP) {
          let scaled = (xScale.invert(e.clientX) / xDomain[1]) * samples
          scaled = constrain(scaled, 0, samples)
          setTriggerPosInt(scaled)
        }
        if (draggingTV) {
          setTriggerVoltage(yScale.invert(e.clientY - offset.top))
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
        x2={size.width - margin.right}
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
        x2={size.width - margin.right}
        y1={yScale(triggerVoltage)}
        y2={yScale(triggerVoltage)}
      ></line>
      <text
        fill="currentColor"
        y={yScale(triggerVoltage)}
        x={size.width - margin.right}
        dy=".32em"
        dx="10"
      >
        {triggerVoltage.toFixed(2)}v
      </text>
      <line
        className="triggerPos"
        x1={xScale(triggerPos)}
        x2={xScale(triggerPos)}
        y1={size.height - margin.bottom}
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
        y1={size.height - margin.bottom}
        y2={margin.top}
      ></line>
      <text fill="currentColor" x={xScale(triggerPos)} dx="-1em" dy="1em">
        {Math.round((triggerPos / xDomain[1]) * 100)}%
      </text>
    </svg>
  )
}
