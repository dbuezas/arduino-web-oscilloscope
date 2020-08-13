export function formatTime(s: any) {
  const ms = s * 1000
  const us = ms * 1000
  if (us < 1000) return us.toFixed(0) + 'μs'
  if (ms < 10) return ms.toFixed(2) + 'ms'
  if (ms < 1000) return ms.toFixed() + 'ms'
  if (s < 10) return s.toFixed(1) + 's'
  return s.toFixed(0) + 's'
}
