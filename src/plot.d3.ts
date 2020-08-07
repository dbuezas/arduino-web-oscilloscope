import * as d3 from 'd3'

const margin = { top: 20, right: 50, bottom: 30, left: 50 }
export type Datum = number
export type Size = { height: number; width: number }

export function renderXAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  size: Size
) {
  svg.select<SVGGElement>('g.x.axis').call((g) =>
    g
      .attr('transform', `translate(0,${size.height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(size.width / 80)
          .tickPadding(10)
          .tickSize(-size.height + margin.top + margin.bottom)
          .tickFormat((t) => ((t as number) * 1000).toFixed(3) + 'ms')
          .tickSizeOuter(0)
      )
      .call((g) => g.select('.domain').remove())
  )
}
export function renderYAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  yScale: d3.ScaleLinear<number, number>,
  size: Size
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
          .tickSize(-size.width + margin.right + margin.left - 1)
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
