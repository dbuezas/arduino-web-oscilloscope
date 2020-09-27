import MouseTrap from 'mousetrap'
import React, { useMemo, useState, useEffect } from 'react'
import {
  useSecPerSample,
  useSamplesPerBuffer
} from '../../communication/bindings'
import { formatTime } from '../formatters'
import { SelectPicker } from 'rsuite'
import { useRecoilState, useRecoilValue } from 'recoil'
import win from '../../win'
const us = (n: number) => n / 1000000
const ms = (n: number) => n / 1000

export default function TimeScales() {
  const [secPerSample, setSecPerSample] = useRecoilState(useSecPerSample.send)
  win.secPerSample = secPerSample
  win.setSecPerSample = setSecPerSample
  const samples = useRecoilValue(useSamplesPerBuffer.send)

  const [timeDivisions, setTimeDivisions] = useState<
    {
      label: string
      value: number
    }[]
  >([])
  useEffect(() => {
    setTimeDivisions(
      [
        us(110),
        us(140.8),
        us(200),
        us(500),
        us(1000),
        ms(2),
        ms(5),
        ms(10),
        ms(20),
        ms(50),
        0.1,
        0.2,
        0.5,
        1,
        2,
        5,
        10
      ].map((secPerDivision) => {
        const secPerSample = (secPerDivision * 10) / samples
        return {
          label: formatTime(secPerDivision),
          value: secPerSample
        }
      })
    )
  }, [samples])

  useEffect(() => {
    MouseTrap.bind('right', () => setSecPerSample((secPerSample * 3) / 2))
    MouseTrap.bind('left', () => setSecPerSample((secPerSample * 2) / 3))
    return () => {
      MouseTrap.unbind('right')
      MouseTrap.unbind('left')
    }
  }, [setSecPerSample, secPerSample])

  return useMemo(
    () => (
      <SelectPicker
        searchable={true}
        value={secPerSample}
        cleanable={false}
        onChange={(n: number) => {
          setSecPerSample(n)
          console.log(n)
        }}
        data={timeDivisions}
        style={{ width: 224, marginBottom: 10 }}
      />
    ),
    [secPerSample, timeDivisions, setSecPerSample]
  )
}
