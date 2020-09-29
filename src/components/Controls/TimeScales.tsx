import MouseTrap from 'mousetrap'
import React, { useEffect } from 'react'
import {
  useSecPerSample,
  useSamplesPerBuffer,
  constrain
} from '../../communication/bindings'
import { formatTime } from '../formatters'
import { SelectPicker } from 'rsuite'
import { useRecoilState, useRecoilValue } from 'recoil'
const us = (n: number) => n / 1000000
const ms = (n: number) => n / 1000
const s = (n: number) => n
const offset = (list: { value: number }[], current: number, offset: number) => {
  let i = list.map(({ value }) => value).indexOf(current) + offset
  i = constrain(i, 0, list.length - 1)
  return list[i].value
}
export default function TimeScales() {
  const [secPerSample, setSecPerSample] = useRecoilState(useSecPerSample.send)
  const samples = useRecoilValue(useSamplesPerBuffer.send)
  const perSample = [
    us(100),
    us(140.8),
    us(200),
    us(500),
    us(1000),
    ms(2),
    ms(5),
    ms(10),
    ms(20),
    ms(50),
    s(0.1),
    s(0.2),
    s(0.5),
    s(1),
    s(2),
    s(5),
    s(10),
    s(20),
    s(50),
    s(100),
    s(1000)
  ].map((secPerDivision) => {
    const secPerSample = (secPerDivision * 10) / samples
    return {
      label: formatTime(secPerDivision) + ' / divison',
      value: secPerSample
    }
  })
  useEffect(() => {
    MouseTrap.bind('right', () =>
      setSecPerSample(offset(perSample, secPerSample, 1))
    )
    MouseTrap.bind('left', () =>
      setSecPerSample(offset(perSample, secPerSample, -1))
    )
    return () => {
      MouseTrap.unbind('right')
      MouseTrap.unbind('left')
    }
  }, [setSecPerSample, secPerSample, perSample])

  return (
    <SelectPicker
      searchable={true}
      value={secPerSample}
      cleanable={false}
      onChange={(n: number) => {
        setSecPerSample(n)
        console.log(n)
      }}
      data={perSample}
      style={{ width: 224, marginBottom: 10 }}
    />
  )
}
