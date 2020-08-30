import ft from 'fourier-transform'
export function getFFT(signal: number[]) {
  if (signal.length === 0) return []
  const nextPowerOf2 = Math.ceil(Math.log2(signal.length))
  const padding = Math.pow(2, nextPowerOf2) - signal.length
  let paddedSignal = signal
  if (padding > 0) {
    const max = Math.max(...signal)
    const min = Math.min(...signal)
    const mid = (max - min) / 2
    paddedSignal = [...signal, ...Array(padding).fill(mid)]
  }
  return ft(paddedSignal)
}

export function average(signal: number[]) {
  // exponential averaging is used to remove wrong frequency readings due to noise
  let last = signal[0]
  return signal.map((n) => {
    last = last * 0.5 + n * 0.5
    return last
  })
}
export function getFrequencyCount(signal: number[], windowTimeWidth: number) {
  signal = average(signal)
  const max = Math.max(...signal)
  const min = Math.min(...signal)
  const mid = (max - min) / 2
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
