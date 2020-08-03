import React, { useState, useEffect } from 'react'
import serial from './Serial'
import { useTriggerVoltage, useTriggerPos } from './bindings'

function TriggerVoltageInput() {
  const [adcClockTicks, setAdcClockTicks] = useState('')
  const [triggerVoltage, setTriggerVoltage] = useTriggerVoltage()
  const [triggerVoltageInput, setTriggerVoltageInput] = useState('')
  const [triggerPos, setTriggerPos] = useTriggerPos()
  const [triggerPosInput, setTriggerPosInput] = useState('')
  const [triggerDirection, setTriggerDirection] = useState(false)
  useEffect(() => {
    setTriggerVoltageInput(`${triggerVoltage}`)
  }, [triggerVoltage])
  useEffect(() => {
    setTriggerPosInput(`${triggerPos}`)
  }, [triggerPos])
  return (
    <div>
      <input
        type="text"
        value={adcClockTicks}
        placeholder="adc clock ticks"
        onChange={async (event) => {
          const val = parseFloat(event.target.value)
          const toSend = 'C' + val + '>'
          setAdcClockTicks(event.target.value)
          await serial.write(toSend)
        }}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const val = parseFloat(triggerVoltageInput)
          setTriggerVoltage(val)
        }}
      >
        <input
          type="text"
          value={triggerVoltageInput}
          placeholder="trigger voltage"
          onChange={(event) => {
            console.log('trg vlt')

            setTriggerVoltageInput(event.target.value)
          }}
        />
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const val = parseFloat(triggerPosInput)
          console.log('trg pos')
          setTriggerPos(val)
        }}
      >
        <input
          type="text"
          value={triggerPosInput}
          placeholder="trigger pos"
          onChange={(event) => {
            setTriggerPosInput(event.target.value)
          }}
        />
      </form>
      RISING
      <input
        type="checkbox"
        checked={triggerDirection}
        onChange={(event) => {
          const val = event.target.checked ? 1 : 0
          const toSend = 'D' + val + '>'
          serial.write(toSend)
          setTriggerDirection(event.target.checked)
        }}
      />
      Block Interrupts
      <input
        type="checkbox"
        onChange={(event) => {
          const val = event.target.checked ? 1 : 0
          const toSend = 'I' + val + '>'
          serial.write(toSend)
        }}
      />
    </div>
  )
}

export default TriggerVoltageInput
