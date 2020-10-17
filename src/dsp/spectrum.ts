import ft from 'fourier-transform'
import { PlotDatum } from '../communication/bindings'

const average = (arr: number[]) =>
  arr.reduce((acc, n) => acc + n, 0) / arr.length
export function getFFT(data: PlotDatum[]) {
  let signal = data.map(({ v }) => v)
  if (signal.length === 0) return []
  if (signal.length < 2) {
    console.log('fix me')
    return []
  }
  const length = data.length
  const dt = data[length - 1].t - data[length - 2].t

  const mid = average(signal)
  signal = signal.map((v) => v - mid)
  // const nextPowerOf2 = Math.ceil(Math.log2(signal.length))
  const nextPowerOf2 = Math.ceil(Math.log2(512))
  const padding = Math.pow(2, nextPowerOf2) - signal.length
  let paddedSignal = signal
  if (padding > 0) {
    paddedSignal = [...signal, ...Array(padding).fill(0)]
  }
  if (padding < 0) {
    paddedSignal = signal.slice(0, 512)
  }
  const fft = ft(paddedSignal)
  // https://www.dsprelated.com/showthread/comp.dsp/87526-1.php
  const normalized = fft.map((v) => (512 * v) / signal.length)
  // const normalized = fft.map((v) => v * 2)
  return normalized.map((v, i) => ({ v, t: dt * i }))
}

export function getFrequencyCount(data: PlotDatum[]) {
  if (data.length < 2) return 0
  const signal = data.map(({ v }) => v)
  const max = Math.max(...signal)
  const min = Math.min(...signal)

  const lowThird = (max + min * 2) / 3
  const mid = (max + min) / 2
  let firstCross = -1
  let lastCross = 0
  let count = 0
  let locked = true
  for (let i = 1; i < data.length; i++) {
    if (data[i].v < lowThird) locked = false
    const risingCross = !locked && data[i - 1].v < mid && data[i].v >= mid
    if (risingCross) {
      locked = true
      count++
      if (firstCross < 0) firstCross = data[i].t
      lastCross = data[i].t
    }
  }
  const result = (count - 1) / (lastCross - firstCross)
  if (count > 1 && Number.isFinite(result)) return result
  return Number.NaN
}

export function oversample(
  factor: number,
  newBuffer: PlotDatum[],
  oldBuffer: PlotDatum[]
) {
  return newBuffer.map(({ v, t }, j) => ({
    t,
    v: (oldBuffer[j]?.v || 0) * factor + v * (1 - factor)
  }))
}
