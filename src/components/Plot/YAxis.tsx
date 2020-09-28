import * as d3 from 'd3'
import React, { useRef, useLayoutEffect } from 'react'

import { useRecoilValue } from 'recoil'
import { margin, plotWidthSelector, yScaleSelector } from './hooks'

export default function YAxis() {
  const nodeRef = useRef<SVGSVGElement>(null)
  const width = useRecoilValue(plotWidthSelector)
  const yScale = useRecoilValue(yScaleSelector)
  const gEl = nodeRef.current

  useLayoutEffect(() => {
    if (!gEl) return
    const yTicks = d3.ticks(yScale.domain()[0], yScale.domain()[1], 10)
    d3.select(gEl)
      .call((g) =>
        g.attr('transform', `translate(${margin.left},0)`).call(
          d3
            .axisLeft(yScale)
            .tickValues(yTicks)
            .tickPadding(10)
            .tickSize(-width + margin.right + margin.left - 1)
            .tickFormat((v) => v + 'v')
        )
      )
      .call((g) =>
        g.select('.domain').attr(
          'd',
          (_d, _, path) =>
            // close path so the domain has a right border
            d3.select(path[0]).attr('d') + 'z'
        )
      )
  }, [gEl, yScale, width])

  return <g className="y axis" ref={nodeRef} />
}
