const report = {} as any
const starts = {} as any
let startT = 0
export function profileS(name: string) {
  report[name] = report[name] || { calls: 0, t: 0 }
  starts[name] = performance.now()
  startT = startT || performance.now()
}
export function profileE(name: string) {
  report[name].t += performance.now() - starts[name]
  report[name].calls++
  starts[name] = undefined
}

const win = window as any
win.startReport = () => {
  startT = performance.now()
  Object.keys(report).forEach((name) => {
    report[name] = { calls: 0, t: 0 }
  })
}
win.report = report
win.getReport = () => {
  const tab = Object.keys(report).map((name) => {
    const { calls, t } = report[name]
    return {
      name,
      calls,
      t,
      tPerCall: t / calls,
      percentage: t / (startT - performance.now())
    }
  })
  console.table(tab)
}
