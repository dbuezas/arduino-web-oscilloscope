export function formatTime(s: any) {
  const ms = s * 1000
  const us = ms * 1000
  if (us < 1000) return us.toFixed(0) + 'μs'
  if (ms < 10) return ms.toFixed(2) + 'ms'
  if (ms < 1000) return ms.toFixed() + 'ms'
  if (s < 10) return s.toFixed(1) + 's'
  return s.toFixed(0) + 's'
}
export function formatFreq(hz: number) {
  if (hz > 0) {
    const khz = hz / 1000
    if (hz < 1000) return Math.round(hz) + 'Hz'
    if (khz < 10) return khz.toFixed(2) + 'KHz'
    return khz.toFixed(0) + 'KHz'
  }
  return '--'
}
export function formatVoltage(v: number): string {
  if (v < 0) return '-' + formatVoltage(-v)
  const mv = v * 1000
  const uv = mv * 1000
  if (uv < 10) return uv.toFixed(2) + 'µv'
  if (uv < 50) return uv.toFixed(1) + 'µv'
  if (uv < 1000) return uv.toFixed(0) + 'µv'
  if (mv < 10) return mv.toFixed(2) + 'mv'
  if (mv < 50) return mv.toFixed(1) + 'mv'
  if (mv < 1000) return mv.toFixed(0) + 'mv'
  return v.toFixed(2) + 'v'
}
