import * as d3 from 'd3'

import './Plot.css'
import {
  useSecPerSample,
  dataState,
  useSamplesPerBuffer,
  voltageRangeState
} from '../../communication/bindings'
import { selector, atom } from 'recoil'
import { memoSelector } from '../../communication/bindingsHelper'
export const margin = { top: 20, right: 50, bottom: 30, left: 50 }

export const xDomainSelector = selector({
  key: 'xDomain',
  get: ({ get }) => {
    const xMax = get(useSecPerSample.send) * get(useSamplesPerBuffer.send)
    return [0, xMax] as [number, number]
  }
})

export const plotWidthSelector = memoSelector(
  atom({
    key: 'plot-width',
    default: 0
  })
)
export const plotHeightSelector = memoSelector(
  atom({
    key: 'plot-height',
    default: 0
  })
)
export const xScaleSelector = selector({
  key: 'xScale',
  get: ({ get }) => {
    const xDomain = get(xDomainSelector)
    const width = get(plotWidthSelector)
    return d3
      .scaleLinear()
      .domain(xDomain)
      .range([margin.left, width - margin.right])
  }
})
export const yScaleSelector = selector({
  key: 'yScale',
  get: ({ get }) => {
    const yDomain = get(voltageRangeState)
    const height = get(plotHeightSelector)
    return d3
      .scaleLinear()
      .domain(yDomain)
      .rangeRound([height - margin.bottom, margin.top])
  }
})
export const lineSelector = selector({
  key: 'line',
  get: ({ get }) => {
    const xScale = get(xScaleSelector)
    const yScale = get(yScaleSelector)
    const samples = get(useSamplesPerBuffer.send)
    const xDomain = get(xDomainSelector)

    return d3
      .line<number>()
      .x((d, i) => xScale(((i + 0.5) / samples) * xDomain[1]))
      .y((d) => yScale(d))
  }
})
export const XYLineSelector = selector({
  key: 'xy-line',
  get: ({ get }) => {
    const yScale = get(yScaleSelector)

    return d3
      .line<[number, number]>()
      .x((d) => yScale(d[0]))
      .y((d) => yScale(d[1]))
  }
})
export const plotDataSelector = selector({
  key: 'plot-data',
  get: ({ get }) => {
    const data = get(dataState)
    const line = get(lineSelector)
    return data.map((data) => line(data) || undefined)
  }
})
