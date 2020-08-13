import * as d3 from 'd3'
import { formatTime } from './formatters'
const margin = { top: 20, right: 50, bottom: 30, left: 50 }
export type Datum = number
export type Size = { height: number; width: number }

export function renderXAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  height: number
) {
  const xTicks = d3.ticks(xScale.domain()[0], xScale.domain()[1], 10)

  svg.select<SVGGElement>('g.x.axis').call((g) =>
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
}
export function renderYAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  yScale: d3.ScaleLinear<number, number>,
  width: number
) {
  const yTicks = d3.ticks(yScale.domain()[0], yScale.domain()[1], 10)
  svg
    .select<SVGGElement>('g.y.axis')
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
        (d, _, path) =>
          // close path so the domain has a right border
          d3.select(path[0]).attr('d') + 'z'
      )
    )
}
