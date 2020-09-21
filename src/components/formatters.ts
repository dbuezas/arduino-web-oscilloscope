const toFixed = (float: number, digits = 0) => {
  const padding = Math.pow(10, digits)
  return (Math.round(float * padding) / padding).toFixed(digits)
}
export function formatTime(s: any) {
  const ms = s * 1000
  const us = ms * 1000
  if (us < 1000) return toFixed(us, 0) + 'μs'
  if (ms < 10) return toFixed(ms, 2) + 'ms'
  if (ms < 1000) return toFixed(ms) + 'ms'
  if (s < 10) return toFixed(s, 1) + 's'
  return toFixed(s, 0) + 's'
}

export function formatFreq(hz: number) {
  if (hz > 0) {
    const khz = hz / 1000
    if (hz < 1000) return toFixed(hz) + 'Hz'
    if (khz < 10) return toFixed(khz, 2) + 'KHz'
    return toFixed(khz) + 'KHz'
  }
  return '--'
}
export function formatVoltage(v: number): string {
  if (v < 0) return '-' + formatVoltage(-v)
  const mv = v * 1000
  const uv = mv * 1000
  if (uv < 10) return toFixed(uv, 2) + 'µv'
  if (uv < 50) return toFixed(uv, 1) + 'µv'
  if (uv < 1000) return toFixed(uv, 0) + 'µv'
  if (mv < 10) return toFixed(mv, 2) + 'mv'
  if (mv < 50) return toFixed(mv, 1) + 'mv'
  if (mv < 1000) return toFixed(mv, 0) + 'mv'
  return toFixed(v, 2) + 'v'
}
