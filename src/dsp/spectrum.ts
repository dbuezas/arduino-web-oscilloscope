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

  const mid = average(signal)
  signal = signal.map((v) => v - mid)
  // const nextPowerOf2 = Math.ceil(Math.log2(signal.length))
  const nextPowerOf2 = Math.ceil(Math.log2(512))
  const padding = Math.pow(2, nextPowerOf2) - signal.length
  let paddedSignal = signal
  if (padding > 0) {
    paddedSignal = [...signal, ...Array(padding).fill(0)]
  }
  const fft = ft(paddedSignal)
  // https://www.dsprelated.com/showthread/comp.dsp/87526-1.php
  const normalized = fft.map((v) => (512 * v) / signal.length)
  // const normalized = fft.map((v) => v * 2)
  return normalized.map((v, i) => ({ v, t: data[i].t }))
}

export function rollingAverage(signal: number[]) {
  // exponential averaging is used to remove wrong frequency readings due to noise
  let last = signal[0]
  return signal.map((n) => {
    last = last * 0.5 + n * 0.5
    return last
  })
}
export function getFrequencyCount(data: PlotDatum[], windowTimeWidth: number) {
  const signal = rollingAverage(data.map(({ v }) => v))
  const max = Math.max(...signal)
  const min = Math.min(...signal)
  const mid = (max + min) / 2
  let firstCross = -1
  let lastCross = 0
  let count = 0
  for (let i = 1; i < signal.length; i++) {
    const risingCross = signal[i - 1] < mid && signal[i] >= mid
    if (risingCross) {
      count++
      if (firstCross < 0) firstCross = i
      lastCross = i
    }
  }

  const sFirstToLast =
    ((lastCross - firstCross) / signal.length) * windowTimeWidth
  const dominantFreq = (count - 1) / sFirstToLast
  return dominantFreq
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
