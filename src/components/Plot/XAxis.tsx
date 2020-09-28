import * as d3 from 'd3'
import React, { useRef, useLayoutEffect } from 'react'

import { useRecoilValue } from 'recoil'
import { margin, plotHeightSelector, xScaleSelector } from './hooks'
import { formatTime } from '../formatters'

export default function XAxis() {
  const nodeRef = useRef<SVGSVGElement>(null)
  const height = useRecoilValue(plotHeightSelector)
  const xScale = useRecoilValue(xScaleSelector)
  const gEl = nodeRef.current
  useLayoutEffect(() => {
    if (!gEl) return
    const xTicks = d3.ticks(xScale.domain()[0], xScale.domain()[1], 10)
    d3.select(gEl).call((g) =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickValues(xTicks)
            .tickPadding(10)
            .tickSize(-height + margin.top + margin.bottom)
            .tickFormat(formatTime)
            .tickSizeOuter(0)
        )
        .call((g) => g.select('.domain').remove())
    )
  }, [gEl, xScale, height])

  return <g className="x axis" ref={nodeRef} />
}
