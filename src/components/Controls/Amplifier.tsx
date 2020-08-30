import MouseTrap from 'mousetrap'
import React, { useMemo, useEffect } from 'react'
import { useAmplifier } from '../../communication/bindings'
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

  return useMemo(
    () => (
      <SelectPicker
        searchable={false}
        value={amplifier}
        cleanable={false}
        onChange={setAmplifier}
        data={[
          2.5,
          0.625,
          0.5,
          0.3125,
          0.15625,
          0.078125,
          0.078125,
          0.0625,
          0.0390625,
          0.03125,
          0.01953125,
          0.015625
        ].map((perDiv, i) => {
          return {
            label: formatVoltage(perDiv),
            value: i
          }
        })}
        style={{ width: 224 }}
      />
    ),
    [amplifier, setAmplifier]
  )
}

export default Amplifier
