import * as d3 from 'd3'
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react'

import './Plot.css'
import {
  Datum,
  renderData,
  renderXAxis,
  renderYAxis,
  renderTriggerVoltage,
  renderTriggerPos,
  Size
} from './plot.d3'
import { useTriggerVoltage, useTriggerPos, useAdcClocks } from './bindings'
import { ScaleLinear } from 'd3'
import { throttle } from 'lodash'
const margin = { top: 20, right: 50, bottom: 30, left: 50 }
const constrain = (n: number, min: number, max: number) =>
  n > max ? max : n < min ? min : n

type Props = {
  data: Datum[][]
}
export default function Plot(props: Props) {
  const [size, setSize] = useState({
    width: 0,
    height: 0
  })
  const [xDomain, setXDomain] = useState<[number, number]>([0, 500])
  const [yDomain] = useState<[number, number]>([0, 5])
  const nodeRef = useRef<SVGSVGElement>(null)
  const [xScale, setXScale] = useState<ScaleLinear<number, number>>()
  const [yScale, setYScale] = useState<ScaleLinear<number, number>>()
  const [adcClocks] = useAdcClocks()
  const [triggerVoltage, setTriggerVoltage] = useTriggerVoltage()
  const [triggerPosInt, , sendTriggerPosInt] = useTriggerPos()

  const samples = props.data[0].length
  const triggerPos = (triggerPosInt / samples) * xDomain[1]

  useLayoutEffect(() => {
    console.log('size')

    setSize({
      width: window.innerWidth,
      height: window.innerHeight - 200
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.innerWidth, window.innerHeight])
  useLayoutEffect(() => {
    console.log('xDomain')

    setXDomain([0, (adcClocks / 32000000) * samples])
  }, [adcClocks, samples])
  useLayoutEffect(() => {
    console.log('xScale')

    setXScale(() =>
      d3
        .scaleLinear()
        .domain(xDomain)
        .range([margin.left, size.width - margin.right])
    )
  }, [xDomain, size.width])
  useLayoutEffect(() => {
    console.log('yScale')

    setYScale(() =>
      d3
        .scaleLinear()
        .domain(yDomain)
        .rangeRound([size.height - margin.bottom, margin.top])
    )
  }, [size.height, yDomain])

  useLayoutEffect(() => {
    console.log('yAxis')
    if (!yScale) return
    const svg = d3.select(nodeRef.current!)
    renderYAxis(svg, yScale, size)
  }, [yScale, size])
  useLayoutEffect(() => {
    console.log('xAxis')
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

  // useEffect(() => {
  //   console.log('triggerPos')
  //   if (!xScale) return

  //   const svg = d3.select(nodeRef.current!)
  //   const setTriggerPos = (sec: number) => {
  //     let scaled = (sec / xDomain[1]) * samples
  //     scaled = constrain(scaled, 0, samples)
  //     sendTriggerPosInt(scaled)
  //   }
  //   renderTriggerPos(svg, triggerPos, xScale, size, setTriggerPos)
  // }, [triggerPos, xScale, samples, xDomain, sendTriggerPosInt, size])
  const throttled = useRef(
    throttle(
      (
        triggerPos: number,
        xScale: d3.ScaleLinear<number, number> | undefined,
        samples: number,
        xDomain: number[],
        sendTriggerPosInt: (arg0: number) => void,
        size: Size
      ) => {
        console.log('triggerPos')
        if (!xScale) return

        const svg = d3.select(nodeRef.current!)
        const setTriggerPos = (sec: number) => {
          let scaled = (sec / xDomain[1]) * samples
          scaled = constrain(scaled, 0, samples)
          sendTriggerPosInt(scaled)
        }
        renderTriggerPos(svg, triggerPos, xScale, size, setTriggerPos)
      },
      0,
      { leading: false, trailing: true }
    )
  )

  useEffect(
    () =>
      throttled.current(
        triggerPos,
        xScale,
        samples,
        xDomain,
        sendTriggerPosInt,
        size
      ),
    [triggerPos, xScale, samples, xDomain, sendTriggerPosInt, size]
  )

  useLayoutEffect(() => {}, [
    triggerPos,
    xScale,
    samples,
    xDomain,
    sendTriggerPosInt,
    size
  ])
  useLayoutEffect(() => {
    console.log('triggerVolt')
    if (!yScale) return
    const svg = d3.select(nodeRef.current!)

    renderTriggerVoltage(svg, triggerVoltage, yScale, size, setTriggerVoltage)
  }, [triggerVoltage, yScale, size, setTriggerVoltage])

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
