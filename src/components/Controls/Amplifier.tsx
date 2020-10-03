import MouseTrap from 'mousetrap'
import React, { useEffect } from 'react'
import { useAmplifier, voltageRanges } from '../../communication/bindings'
import { formatVoltage } from '../formatters'
import { Icon, IconButton, SelectPicker } from 'rsuite'
import { useRecoilState } from 'recoil'
import { useActiveBtns } from './hooks'

function Amplifier() {
  const [amplifier, setAmplifier] = useRecoilState(useAmplifier.send)
  const [isUpActive, tapUp] = useActiveBtns()
  const [isDownActive, tapDown] = useActiveBtns()
  useEffect(() => {
    MouseTrap.bind('up', (e) => {
      e.preventDefault()
      tapUp()
      setAmplifier(amplifier - 1)
    })
    MouseTrap.bind('down', (e) => {
      e.preventDefault()
      tapDown()
      setAmplifier(amplifier + 1)
    })
    return () => {
      MouseTrap.unbind('up')
      MouseTrap.unbind('down')
    }
  }, [amplifier, setAmplifier, tapDown, tapUp])

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
        active={isDownActive}
        size="md"
        icon={<Icon icon="down" />}
        onClick={() => setAmplifier(amplifier + 1)}
      />
      <SelectPicker
        searchable={false}
        value={amplifier}
        cleanable={false}
        onChange={setAmplifier}
        data={voltageRanges.map((v, i) => {
          return {
            label: formatVoltage(v / 10) + ' / div',
            value: i
          }
        })}
        style={{ flex: 1, marginLeft: 5, marginRight: 5 }}
      />
      <IconButton
        active={isUpActive}
        size="md"
        icon={<Icon icon="up" />}
        onClick={() => setAmplifier(amplifier - 1)}
      />
    </div>
  )
}

export default Amplifier
