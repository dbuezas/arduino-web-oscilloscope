import MouseTrap from 'mousetrap'
import React, { useEffect } from 'react'
import { useAmplifier, voltageRanges } from '../../communication/bindings'
import { formatVoltage } from '../formatters'
import { SelectPicker } from 'rsuite'
import { useRecoilState } from 'recoil'

function Amplifier() {
  const [amplifier, setAmplifier] = useRecoilState(useAmplifier.send)

  useEffect(() => {
    MouseTrap.bind('up', () => setAmplifier(amplifier + 1))
    MouseTrap.bind('down', () => setAmplifier(amplifier - 1))
    return () => {
      MouseTrap.unbind('up')
      MouseTrap.unbind('down')
    }
  }, [amplifier, setAmplifier])

  return (
    <SelectPicker
      searchable={false}
      value={amplifier}
      cleanable={false}
      onChange={setAmplifier}
      data={voltageRanges.map((v, i) => {
        return {
          label: formatVoltage(v / 10),
          value: i
        }
      })}
      style={{ width: 224 }}
    />
  )
}

export default Amplifier
