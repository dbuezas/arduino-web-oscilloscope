import MouseTrap from 'mousetrap'
import React, { useEffect } from 'react'
import {
  useSecPerSample,
  useSamplesPerBuffer,
  constrain
} from '../../communication/bindings'
import { formatTime } from '../formatters'
import { Icon, IconButton, SelectPicker } from 'rsuite'
import { useRecoilState, useRecoilValue } from 'recoil'
import win from '../../win'
import { useActiveBtns } from './hooks'
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
  const [isLeftActive, tapLeft] = useActiveBtns()
  const [isRightActive, tapRight] = useActiveBtns()

  const perSample = [
    us(60.8), // as fast as it goes
    us(73.6), // matching fastest adc
    us(100.8), // as fast as it went before
    us(140.8), // in synch with adc clock
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
      label: formatTime(secPerDivision) + ' / div',
      value: secPerSample
    }
  })
  useEffect(() => {
    MouseTrap.bind('right', (e) => {
      e.preventDefault()
      tapRight()
      setSecPerSample(offset(perSample, secPerSample, 1))
    })
    MouseTrap.bind('left', (e) => {
      e.preventDefault()
      tapLeft()
      setSecPerSample(offset(perSample, secPerSample, -1))
    })
    return () => {
      MouseTrap.unbind('right')
      MouseTrap.unbind('left')
    }
  }, [setSecPerSample, secPerSample, perSample, tapRight, tapLeft])
  win.setSecPerSample = setSecPerSample

  return (
    <div
      style={{
        width: ' 100%',
        display: ' flex',
        justifyContent: ' space-between',
        marginBottom: 5
      }}
    >
      <IconButton
        active={isLeftActive}
        size="md"
        icon={<Icon icon="left" />}
        onClick={() => setSecPerSample(offset(perSample, secPerSample, -1))}
      />
      <SelectPicker
        searchable={true}
        value={secPerSample}
        cleanable={false}
        onChange={(n: number) => {
          setSecPerSample(n)
        }}
        data={perSample}
        style={{ flex: 1, marginLeft: 5, marginRight: 5 }}
      />
      <IconButton
        active={isRightActive}
        size="md"
        icon={<Icon icon="right" />}
        onClick={() => setSecPerSample(offset(perSample, secPerSample, 1))}
      />
    </div>
  )
}
