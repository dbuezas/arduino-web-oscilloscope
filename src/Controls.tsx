import React, { useMemo } from 'react'
import { useAdcClocks, useTriggerDirection, useSynchMode } from './bindings'
import {
  InputGroup,
  Icon,
  InputNumber,
  RadioGroup,
  Radio,
  Slider
} from 'rsuite'
const styles = {
  input: { width: 200, marginRight: 10, display: 'inline-flex' },
  radioGroupLabel: {
    padding: '8px 2px 8px 10px',
    display: 'inline-block',
    verticalAlign: 'middle'
  }
}
function Controls() {
  const [synchMode, setSynchMode] = useSynchMode()
  const [adcClockTicks, setAdcClockTicks] = useAdcClocks()
  const [triggerDirection, setTriggerDirection] = useTriggerDirection()

  return (
    <div>
      {useMemo(
        () => (
          <Slider
            style={{ width: 500 }}
            progress
            min={79}
            max={1000}
            // graduated
            // step={79}
            value={adcClockTicks}
            onChange={setAdcClockTicks}
          />
        ),
        [adcClockTicks, setAdcClockTicks]
      )}
      {/* {useMemo(
        () => (
          <InputGroup style={styles.input}>
            <InputNumber
              size="lg"
              min={0}
              value={adcClockTicks}
              onChange={setAdcClockTicks as any}
            />
            <InputGroup.Addon>
              <Icon icon="clock-o" />
            </InputGroup.Addon>
          </InputGroup>
        ),
        [adcClockTicks, setAdcClockTicks]
      )} */}

      {useMemo(
        () => (
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
        ),
        [setTriggerDirection, triggerDirection]
      )}
      {useMemo(
        () => (
          <RadioGroup
            inline
            value={synchMode}
            onChange={setSynchMode as any}
            appearance="picker"
          >
            <span style={styles.radioGroupLabel}>SynchMode: </span>
            <Radio value={false}>
              <Icon icon="blind" size="2x" />
            </Radio>
            <Radio value={true}>
              <Icon icon="handshake-o" size="2x" />
            </Radio>
          </RadioGroup>
        ),
        [synchMode, setSynchMode]
      )}
    </div>
  )
}

export default Controls
