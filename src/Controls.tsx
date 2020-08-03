import React, { useState, useEffect } from 'react'
import {
  useTriggerVoltage,
  useTriggerPos,
  useAdcClocks,
  useTriggerDirection,
  useBlockInterrupts
} from './bindings'
import {
  InputGroup,
  Icon,
  InputNumber,
  Toggle,
  Whisper,
  Tooltip,
  RadioGroup,
  Radio
} from 'rsuite'

function Controls() {
  const [blockInterrupts, setBlockInterrupts] = useBlockInterrupts()
  const [adcClockTicks, setAdcClockTicks] = useAdcClocks()
  const [triggerVoltage, setTriggerVoltage] = useTriggerVoltage()
  const [triggerPos, setTriggerPos] = useTriggerPos()
  const [triggerDirection, setTriggerDirection] = useTriggerDirection()

  const styles = {
    input: { width: 200, marginRight: 10, display: 'inline-flex' },
    radioGroupLabel: {
      padding: '8px 2px 8px 10px',
      display: 'inline-block',
      verticalAlign: 'middle'
    }
  }

  return (
    <div>
      <InputGroup style={styles.input}>
        <InputNumber
          size="lg"
          min={0}
          value={adcClockTicks}
          onChange={(v) => setAdcClockTicks(v as number)}
        />
        <InputGroup.Addon>
          <Icon icon="clock-o" />
        </InputGroup.Addon>
      </InputGroup>
      <Whisper
        placement="top"
        trigger="hover"
        speaker={<Tooltip>Trigger Voltage</Tooltip>}
      >
        <InputGroup style={styles.input}>
          <InputNumber
            size="lg"
            min={0}
            max={5}
            step={0.05}
            value={triggerVoltage}
            onChange={(v) => setTriggerVoltage(v as number)}
          />
          <InputGroup.Addon>
            <Icon icon="arrows-v" />
          </InputGroup.Addon>
        </InputGroup>
      </Whisper>
      <InputGroup style={styles.input}>
        <InputNumber
          size="lg"
          min={0}
          max={2700}
          step={10}
          value={triggerPos}
          onChange={(v) => setTriggerPos(v as number)}
        />
        <InputGroup.Addon>
          <Icon icon="arrows-h" />
        </InputGroup.Addon>
      </InputGroup>

      <RadioGroup
        inline
        value={triggerDirection}
        onChange={setTriggerDirection}
        appearance="picker"
      >
        <span style={styles.radioGroupLabel}>Trigger: </span>
        <Radio value={false}>
          <Icon icon="level-down" size="2x" />
        </Radio>
        <Radio value={true}>
          <Icon icon="level-up" size="2x" />
        </Radio>
      </RadioGroup>
      <RadioGroup
        inline
        value={blockInterrupts}
        onChange={setBlockInterrupts}
        appearance="picker"
      >
        <span style={styles.radioGroupLabel}>Block Interrupts: </span>
        <Radio value={false}>
          <Icon icon="sign-out" size="2x" />
        </Radio>
        <Radio value={true}>
          <Icon icon="hand-stop-o" size="2x" />
        </Radio>
      </RadioGroup>
    </div>
  )
}

export default Controls
