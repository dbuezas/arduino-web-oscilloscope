import * as d3 from 'd3'
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react'

import './Plot.css'
import {
  Datum,
  renderData,
  renderXAxis,
  renderYAxis,
  renderTriggerVoltage,
  renderTriggerPos
} from './plot.d3'
import { useTriggerVoltage, useTriggerPos } from './bindings'
import { ScaleLinear } from 'd3'
const margin = { top: 20, right: 50, bottom: 30, left: 50 }

type Props = {
  data: Datum[][]
}
export default function Plot(props: Props) {
  const [xDomain] = useState<[number, number]>([0, 500])
  const [yDomain] = useState<[number, number]>([0, 5])
  const nodeRef = useRef<SVGSVGElement>(null)
  const [xScale, setXScale] = useState<ScaleLinear<number, number>>()
  const [yScale, setYScale] = useState<ScaleLinear<number, number>>()
  const [triggerVoltage, setTriggerVoltage] = useTriggerVoltage()
  const [triggerPos, setTriggerPos] = useTriggerPos()
  const size = {
    width: window.innerWidth,
    height: window.innerHeight - 200
  }
  useEffect(() => {
    setXScale(() =>
      d3
        .scaleLinear()
        .domain(xDomain)
        .range([margin.left, size.width - margin.right])
    )
  }, [xDomain, size.width])
  useEffect(() => {
    setYScale(() =>
      d3
        .scaleLinear()
        .domain(yDomain)
        .rangeRound([size.height - margin.bottom, margin.top])
    )
  }, [size.height, yDomain])

  useLayoutEffect(() => {
    console.log('yScale', yScale)

    if (!yScale) return
    const svg = d3.select(nodeRef.current!)
    renderYAxis(svg, yScale, size)
  }, [yScale, size])
  useLayoutEffect(() => {
    if (!xScale) return

    const svg = d3.select(nodeRef.current!)
    renderXAxis(svg, xScale, size, xDomain)
  }, [xScale, size, xDomain])
  useLayoutEffect(() => {
    if (!xScale) return
    if (!yScale) return

    const svg = d3.select(nodeRef.current!)
    renderData(svg, props.data, xScale, yScale)
  }, [props.data, xScale, yScale])
  useLayoutEffect(() => {
    if (!xScale) return
    if (!yScale) return
    const svg = d3.select(nodeRef.current!)
    renderTriggerPos(svg, triggerPos, yScale, xScale, yDomain, setTriggerPos)
  }, [triggerPos, yScale, xScale, yDomain, setTriggerPos])
  useLayoutEffect(() => {
    if (!xScale) return
    if (!yScale) return
    const svg = d3.select(nodeRef.current!)
    renderTriggerVoltage(
      svg,
      triggerVoltage,
      yScale,
      xScale,
      xDomain,
      setTriggerVoltage
    )
  }, [triggerVoltage, yScale, xScale, xDomain, setTriggerVoltage])

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
