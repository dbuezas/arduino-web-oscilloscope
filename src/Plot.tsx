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
import { useTriggerVoltage, useTriggerPos, useAdcClocks } from './bindings'
import { ScaleLinear } from 'd3'
const margin = { top: 20, right: 50, bottom: 30, left: 50 }
const constrain = (n: number, min: number, max: number) =>
  n > max ? max : n < min ? min : n

type Props = {
  data: Datum[][]
}
export default function Plot(props: Props) {
  const [xDomain, setXDomain] = useState<[number, number]>([0, 500])
  const [yDomain] = useState<[number, number]>([0, 5])
  const nodeRef = useRef<SVGSVGElement>(null)
  const [xScale, setXScale] = useState<ScaleLinear<number, number>>()
  const [yScale, setYScale] = useState<ScaleLinear<number, number>>()
  const [adcClocks] = useAdcClocks()
  const [triggerVoltage, setTriggerVoltage] = useTriggerVoltage()
  const [triggerPosInt, setTriggerPosInt] = useTriggerPos()

  const size = {
    width: window.innerWidth,
    height: window.innerHeight - 200
  }
  const samples = props.data[0].length
  const triggerPos = (triggerPosInt / samples) * xDomain[1]

  useEffect(() => {
    setXDomain([0, (adcClocks / 32000000) * samples])
  }, [adcClocks, samples])
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
    renderXAxis(svg, xScale, size)
  }, [xScale, size])
  useLayoutEffect(() => {
    if (!xScale) return
    if (!yScale) return

    const svg = d3.select(nodeRef.current!)
    renderData(svg, props.data, xScale, yScale, xDomain)
  }, [props.data, xScale, yScale, xDomain])
  useLayoutEffect(() => {
    if (!xScale) return
    if (!yScale) return
    const svg = d3.select(nodeRef.current!)
    const setTriggerPos = (sec: number) => {
      let scaled = (sec / xDomain[1]) * samples
      scaled = constrain(scaled, 0, samples)
      setTriggerPosInt(scaled)
    }
    renderTriggerPos(svg, triggerPos, yScale, xScale, yDomain, setTriggerPos)
  }, [triggerPos, yScale, xScale, yDomain, samples, setTriggerPosInt, xDomain])
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
