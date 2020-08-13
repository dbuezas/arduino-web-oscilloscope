import React, { useMemo, useState } from 'react'
import {
  useAdcClocks,
  useTriggerDirection,
  synchMode,
  triggerModeState,
  TriggerMode,
  freeMemoryState,
  didTriggerState
} from './bindings'
import { formatTime } from './formatters'
import {
  Icon,
  Panel,
  SelectPicker,
  Tag,
  ButtonToolbar,
  ButtonGroup,
  Button,
  IconButton
} from 'rsuite'
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil'

const samples = 500
const ButtonToolbarStyle = {
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const ticksPerMs = 32000000 / 1000
const millisToADCClocks = (msPerFrame: number) => {
  const msPerSample = msPerFrame / samples
  return msPerSample * ticksPerMs
}
const ADCClocksToMillis = (clocks: number) => {
  const msPerSample = clocks / ticksPerMs
  const msPerFrame = msPerSample * samples
  return msPerFrame
}

function Controls() {
  const [voltage, setVoltage] = useState(5)
  const [adcClockTicks, setAdcClockTicks] = useRecoilState(useAdcClocks.send)
  const [triggerMode, setTriggerMode] = useRecoilState(triggerModeState)
  const freeMemory = useRecoilValue(freeMemoryState)
  const didTrigger = useRecoilValue(didTriggerState)
  const [triggerDirection, setTriggerDirection] = useRecoilState(
    useTriggerDirection.send
  )
  const setSynchMode = useSetRecoilState(synchMode)
  return (
    <div>
      <Panel header="Scales" shaded collapsible defaultExpanded>
        {useMemo(
          () => (
            <SelectPicker
              searchable={true}
              value={adcClockTicks}
              cleanable={false}
              onChange={(n: number) => {
                console.log(n)
                setSynchMode(false)
                // setSynchMode(n < millisToADCClocks(20))
                setAdcClockTicks(n)
              }}
              data={[
                ADCClocksToMillis(79),
                2,
                5,
                10,
                20,
                50,
                100,
                200,
                500,
                1000
              ].map((ms) => {
                const clocks = millisToADCClocks(ms)
                const msPerDivision = ms / 10
                return {
                  label: formatTime(msPerDivision / 1000),
                  value: clocks
                }
              })}
              style={{ width: 224, marginBottom: 10 }}
            />
          ),
          [adcClockTicks, setAdcClockTicks, setSynchMode]
        )}
        {useMemo(
          () => (
            <SelectPicker
              searchable={false}
              value={voltage}
              cleanable={false}
              onChange={setVoltage}
              data={[5, 4, 2, 1, 4 / 8, 2 / 8, 1 / 8, 1 / 16, 1 / 32].map(
                (peakToPeak) => {
                  return {
                    label: peakToPeak / 10 + 'v (not implemented)',
                    value: peakToPeak
                  }
                }
              )}
              style={{ width: 224 }}
            />
          ),
          [voltage, setVoltage]
        )}
      </Panel>

      <Panel header="Trigger" shaded collapsible defaultExpanded>
        {useMemo(
          () => (
            <ButtonToolbar style={ButtonToolbarStyle}>
              <div>Mode:</div>

              <ButtonGroup>
                {Object.values(TriggerMode).map((mode) => (
                  <Button
                    key={mode}
                    appearance={triggerMode === mode ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => setTriggerMode(mode)}
                  >
                    {mode}
                  </Button>
                ))}
              </ButtonGroup>
            </ButtonToolbar>
          ),
          [setTriggerMode, triggerMode]
        )}
        {useMemo(
          () => (
            <ButtonToolbar style={ButtonToolbarStyle}>
              <div>Direction:</div>
              <ButtonGroup>
                <IconButton
                  size="sm"
                  appearance={triggerDirection ? 'primary' : 'default'}
                  icon={<Icon icon="level-down" />}
                  onClick={() => setTriggerDirection(true)}
                />
                <IconButton
                  size="sm"
                  appearance={!triggerDirection ? 'primary' : 'default'}
                  icon={<Icon icon="level-up" />}
                  onClick={() => setTriggerDirection(false)}
                />
              </ButtonGroup>
            </ButtonToolbar>
          ),
          [setTriggerDirection, triggerDirection]
        )}
        {useMemo(
          () => (
            <ButtonToolbar style={ButtonToolbarStyle}>
              State:&nbsp;
              {didTrigger ? (
                <Tag color="green">Triggered</Tag>
              ) : (
                <Tag color="yellow">Searching</Tag>
              )}
            </ButtonToolbar>
          ),
          [didTrigger]
        )}
      </Panel>
      <Panel header="Board" shaded collapsible defaultExpanded>
        <Tag>Free mem: {freeMemory}bytes</Tag>
      </Panel>
    </div>
  )
}

export default Controls
