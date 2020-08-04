import * as d3 from 'd3'

const margin = { top: 20, right: 50, bottom: 30, left: 50 }
export type Datum = number
type Size = { height: number; width: number }
export default (
  node: SVGSVGElement,
  triggerVoltage: number,
  setTriggerVoltage: (v: number) => void,
  triggerPos: number,
  setTriggerPos: (v: number) => void,
  xDomain: [number, number],
  data: Datum[][],
  size: Size
) => {
  // console.log(i++)
  const yDomain = [0, 5] as [number, number]
  const xScale = d3
    .scaleLinear()
    .domain(xDomain)
    .range([margin.left, size.width - margin.right])
  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .rangeRound([size.height - margin.bottom, margin.top])
  const svg = d3.select(node)
  renderYAxis(svg, yScale, size)
  renderXAxis(svg, xScale, size, xDomain)

  renderData(svg, data, xScale, yScale)

  /* trigger voltage */
  renderTriggerPos(svg, triggerPos, yScale, xScale, yDomain, setTriggerPos)
  renderTriggerVoltage(
    svg,
    triggerVoltage,
    yScale,
    xScale,
    xDomain,
    setTriggerVoltage
  )
}

function renderData(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: Datum[][],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
) {
  const line = d3
    .line<Datum>()
    // .curve(d3.curveCatmullRom) // REMOVE
    .x((d, i) => xScale(i))
    .y((d) => yScale(d))

  svg.select<SVGGElement>('path.plot-area').datum(data[0]).attr('d', line)
  for (let i = 1; i < data.length; i++)
    svg
      .select<SVGGElement>('path.plot-area-d' + (i + 1))
      .datum(data[i])
      .attr('d', line)
}
function renderXAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  size: Size,
  xDomain: [number, number]
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
          .tickFormat(
            (t) =>
              (((t as number) / (xDomain[1] - xDomain[0])) * 2.75).toFixed(3) +
              'ms'
          )
          .tickSizeOuter(0)
      )
      .call((g) => g.select('.domain').remove())
  )
}
function renderYAxis(
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
function renderTriggerVoltage(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  triggerVoltage: number,
  yScale: d3.ScaleLinear<number, number>,
  xScale: d3.ScaleLinear<number, number>,
  xDomain: [number, number],
  setTriggerVoltage: (v: number) => void
) {
  const line = svg
    .selectAll<SVGLineElement, number>('line.triggerVoltage')
    .data([triggerVoltage])
  const newLine = line.enter().append('line').classed('triggerVoltage', true)
  line
    .merge(newLine)
    .attr('x1', xScale(xDomain[0]))
    .attr('x2', xScale(xDomain[1]))
    .attr('y1', yScale(triggerVoltage))
    .attr('y2', yScale(triggerVoltage))
  const handle = svg
    .selectAll<SVGLineElement, number>('line.triggerVoltageHandle')
    .data([triggerVoltage])
  const newHandle = handle
    .enter()
    .append('line')
    .classed('triggerVoltageHandle', true)
  handle
    .merge(newHandle)
    .attr('x1', xScale(xDomain[0]))
    .attr('x2', xScale(xDomain[1]))
    .attr('y1', yScale(triggerVoltage))
    .attr('y2', yScale(triggerVoltage))
  handle.call(
    d3
      .drag<SVGLineElement, number>()
      .on('start', function () {
        d3.select(this).classed('active', true)
      })
      .on('drag', function dragged() {
        setTriggerVoltage(yScale.invert(d3.event.y))
      })
      .on('end', function () {
        d3.select(this).classed('active', false)
      })
  )
}

function renderTriggerPos(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  triggerPos: number,
  yScale: d3.ScaleLinear<number, number>,
  xScale: d3.ScaleLinear<number, number>,
  yDomain: [number, number],
  setTriggerVoltage: (v: number) => void
) {
  const line = svg
    .selectAll<SVGLineElement, number>('line.triggerPos')
    .data([triggerPos])
  const newLine = line.enter().append('line').classed('triggerPos', true)
  line
    .merge(newLine)
    .attr('x1', xScale(triggerPos))
    .attr('x2', xScale(triggerPos))
    .attr('y1', yScale(yDomain[0]))
    .attr('y2', yScale(yDomain[1]))

  const handle = svg
    .selectAll<SVGLineElement, number>('line.triggerPosHandle')
    .data([triggerPos])
  const newhandle = line
    .enter()
    .append('line')
    .classed('triggerPosHandle', true)
  handle
    .merge(newhandle)
    .attr('x1', xScale(triggerPos))
    .attr('x2', xScale(triggerPos))
    .attr('y1', yScale(yDomain[0]))
    .attr('y2', yScale(yDomain[1]))
  handle.call(
    d3
      .drag<SVGLineElement, number>()
      .on('start', function () {
        d3.select(this).classed('active', true)
      })
      .on('drag', function dragged() {
        setTriggerVoltage(xScale.invert(d3.event.x))
      })
      .on('end', function () {
        d3.select(this).classed('active', false)
      })
  )
}
