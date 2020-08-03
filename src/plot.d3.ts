import * as d3 from 'd3'

const margin = { top: 20, right: 50, bottom: 30, left: 50 }
export type Datum = { v: number; t: number }

const last: any = {} // TODO: remove this hack and do good memoization

export default (
  node: SVGSVGElement,
  triggerVoltage: number,
  setTriggerVoltage: (v: number) => any,
  triggerPos: number,
  setTriggerPos: (v: number) => any,
  data: Datum[],
  dataD2: Datum[],
  dataD3: Datum[],
  dataD4: Datum[],
  dataD5: Datum[],
  dataD6: Datum[],
  dataD7: Datum[],
  size: { height: number; width: number }
) => {
  // console.log(i++)
  const xDomain = d3.extent(data, (d) => d.t) as [number, number]
  const yDomain = [0, 5] as [number, number]
  const xScale = d3
    .scaleLinear()
    .domain(xDomain)
    .range([margin.left, size.width - margin.right])
  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .rangeRound([size.height - margin.bottom, margin.top])
  const line = d3
    .line<Datum>()
    // .curve(d3.curveCatmullRom) // REMOVE
    .x((d) => xScale(d.t))
    .y((d) => yScale(d.v))
  const svg = d3.select(node)
  const yTicks = d3.ticks(yScale.domain()[0], yScale.domain()[1], 10)
  if (last.domainx != xDomain[1]) {
    last.domainx = xDomain[1]
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

    svg.select<SVGGElement>('g.x.axis').call((g) =>
      g
        .attr('transform', `translate(0,${size.height - margin.bottom})`)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(size.width / 80)
            .tickPadding(10)
            .tickSize(-size.height + margin.top + margin.bottom)
            .tickFormat((t) => (((t as number) / 500) * 2.75).toFixed(3) + 'ms')
            .tickSizeOuter(0)
        )
        .call((g) => g.select('.domain').remove())
    )
  }

  // svg.select<SVGGElement>('path.plot-area').datum(data).attr('d', line)
  // svg.select<SVGGElement>('path.plot-area-d2').datum(dataD2).attr('d', line)
  // svg.select<SVGGElement>('path.plot-area-d3').datum(dataD3).attr('d', line)
  // svg.select<SVGGElement>('path.plot-area-d4').datum(dataD4).attr('d', line)
  // svg.select<SVGGElement>('path.plot-area-d5').datum(dataD5).attr('d', line)
  // svg.select<SVGGElement>('path.plot-area-d6').datum(dataD6).attr('d', line)
  // svg.select<SVGGElement>('path.plot-area-d7').datum(dataD7).attr('d', line)
  if (data != last.data) {
    svg.select<SVGGElement>('path.plot-area').datum(data).attr('d', line)
    last.data = data
  }
  if (dataD2 != last.dataD2) {
    svg.select<SVGGElement>('path.plot-area-d2').datum(dataD2).attr('d', line)
    last.dataD2 = dataD2
  }
  if (dataD3 != last.dataD3) {
    svg.select<SVGGElement>('path.plot-area-d3').datum(dataD3).attr('d', line)
    last.dataD3 = dataD3
  }
  if (dataD4 != last.dataD4) {
    svg.select<SVGGElement>('path.plot-area-d4').datum(dataD4).attr('d', line)
    last.dataD4 = dataD4
  }
  if (dataD5 != last.dataD5) {
    svg.select<SVGGElement>('path.plot-area-d5').datum(dataD5).attr('d', line)
    last.dataD5 = dataD5
  }
  if (dataD6 != last.dataD6) {
    svg.select<SVGGElement>('path.plot-area-d6').datum(dataD6).attr('d', line)
    last.dataD6 = dataD6
  }
  if (dataD7 != last.dataD7) {
    svg.select<SVGGElement>('path.plot-area-d7').datum(dataD7).attr('d', line)
    last.dataD7 = dataD7
  }

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
  // if (triggerVoltage != last.triggerVoltage) {
  //   last.triggerVoltage = triggerVoltage
  //   renderTriggerVoltage(
  //     svg,
  //     triggerVoltage,
  //     yScale,
  //     xScale,
  //     xDomain,
  //     setTriggerVoltage
  //   )
  // }
  // if (triggerPos != last.triggerPos) {
  //   last.triggerPos = triggerPos
  //   renderTriggerPos(svg, triggerPos, yScale, xScale, yDomain, setTriggerPos)
  // }
}

function renderTriggerVoltage(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  triggerVoltage: number,
  yScale: d3.ScaleLinear<number, number>,
  xScale: d3.ScaleLinear<number, number>,
  xDomain: [number, number],
  setTriggerVoltage: (v: number) => any
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
      .on('start', function (d) {
        d3.select(this).classed('active', true)
      })
      .on('drag', function dragged(d) {
        setTriggerVoltage(yScale.invert(d3.event.y))
      })
      .on('end', function (d) {
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
  setTriggerVoltage: (v: number) => any
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
      .on('start', function (d) {
        d3.select(this).classed('active', true)
      })
      .on('drag', function dragged(d) {
        setTriggerVoltage(xScale.invert(d3.event.x))
      })
      .on('end', function (d) {
        d3.select(this).classed('active', false)
      })
  )
}
