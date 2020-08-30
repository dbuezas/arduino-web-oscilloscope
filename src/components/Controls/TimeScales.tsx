import MouseTrap from 'mousetrap'
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  useTicksPerAdcRead,
  useSamplesPerBuffer
} from '../../communication/bindings'
import { formatTime } from '../formatters'
import { SelectPicker } from 'rsuite'
import { useRecoilState, useRecoilValue } from 'recoil'

const ticksPerMs = 32000000 / 1000
const msPerTick = 1000 / 32000000
const divisionsPerFrame = 10

export default function TimeScales() {
  const [ticksPerAdcRead, setTicksPerAdcRead] = useRecoilState(
    useTicksPerAdcRead.send
  )
  const samples = useRecoilValue(useSamplesPerBuffer.send)
  const ticksPerSampleToMSPerDivision = useCallback(
    (ticksPerSample: number) => {
      const msPerSample = msPerTick * ticksPerSample
      const msPerFrame = msPerSample * samples
      const msPerDivision = msPerFrame / divisionsPerFrame
      return msPerDivision
    },
    [samples]
  )
  const millisPerDivisionToTicksPerSample = useCallback(
    (msPerDivision: number) => {
      const msPerFrame = msPerDivision * divisionsPerFrame
      const msPerSample = msPerFrame / samples
      const ticksPerSample = ticksPerMs * msPerSample
      return ticksPerSample
    },
    [samples]
  )
  const [timeDivisions, setTimeDivisions] = useState<
    {
      label: string
      value: number
    }[]
  >([])
  useEffect(() => {
    setTimeDivisions(
      [
        0.1,
        ticksPerSampleToMSPerDivision(88),
        0.2,
        0.5,
        1,
        2,
        5,
        10,
        20,
        50,
        50.055,
        100
      ].map((msPerDivision) => {
        const ticks = millisPerDivisionToTicksPerSample(msPerDivision)
        return {
          label: formatTime(msPerDivision / 1000),
          value: Math.round(ticks)
        }
      })
    )
  }, [ticksPerSampleToMSPerDivision, millisPerDivisionToTicksPerSample])

  useEffect(() => {
    MouseTrap.bind('right', () => setTicksPerAdcRead((ticksPerAdcRead * 3) / 2))
    MouseTrap.bind('left', () => setTicksPerAdcRead((ticksPerAdcRead * 2) / 3))
    return () => {
      MouseTrap.unbind('right')
      MouseTrap.unbind('left')
    }
  }, [setTicksPerAdcRead, ticksPerAdcRead])

  return useMemo(
    () => (
      <SelectPicker
        searchable={true}
        value={ticksPerAdcRead}
        cleanable={false}
        onChange={(n: number) => {
          setTicksPerAdcRead(n)
          console.log(n)
        }}
        data={timeDivisions}
        style={{ width: 224, marginBottom: 10 }}
      />
    ),
    [ticksPerAdcRead, timeDivisions, setTicksPerAdcRead]
  )
}
