import MouseTrap from 'mousetrap'
import React, { useEffect } from 'react'
import { useAmplifier, voltageRanges } from '../../communication/bindings'
import { formatVoltage } from '../formatters'
import { Icon, IconButton, SelectPicker } from 'rsuite'
import { useRecoilState } from 'recoil'
import { useActiveBtns } from './hooks'

function Amplifier() {
  const [amplifier, setAmplifier] = useRecoilState(useAmplifier.send)
  const [activeBtns, activateBtn] = useActiveBtns({ up: false, down: false })
  useEffect(() => {
    MouseTrap.bind('up', (e) => {
      e.preventDefault()
      activateBtn('up')
      setAmplifier(amplifier - 1)
    })
    MouseTrap.bind('down', (e) => {
      e.preventDefault()
      activateBtn('down')
      setAmplifier(amplifier + 1)
    })
    return () => {
      MouseTrap.unbind('up')
      MouseTrap.unbind('down')
    }
  }, [activateBtn, amplifier, setAmplifier])

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
        active={activeBtns['down']}
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
        active={activeBtns['up']}
        size="md"
        icon={<Icon icon="up" />}
        onClick={() => setAmplifier(amplifier - 1)}
      />
    </div>
  )
}

export default Amplifier
