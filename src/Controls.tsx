import React, { useMemo, useState, useCallback } from 'react'
import {
  useTicksPerAdcRead,
  useTriggerDirection,
  synchMode,
  useTriggerMode,
  TriggerMode,
  freeMemoryState,
  didTriggerState,
  useSamplesPerBuffer
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

const ButtonToolbarStyle = {
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const ticksPerMs = 32000000 / 1000

function Controls() {
  const [voltage, setVoltage] = useState(5)
  const [ticksPerAdcRead, setTicksPerAdcRead] = useRecoilState(
    useTicksPerAdcRead.send
  )
  const [triggerMode, setTriggerMode] = useRecoilState(useTriggerMode.send)
  const freeMemory = useRecoilValue(freeMemoryState)
  const didTrigger = useRecoilValue(didTriggerState)
  const [triggerDirection, setTriggerDirection] = useRecoilState(
    useTriggerDirection.send
  )
  const setSynchMode = useSetRecoilState(synchMode)
  const samples = useRecoilValue(useSamplesPerBuffer.send)
  const ADCClocksToMillis = useCallback(
    (clocks: number) => {
      const msPerSample = clocks / ticksPerMs
      const msPerFrame = msPerSample * samples
      return msPerFrame
    },
    [samples]
  )
  const millisToADCClocks = useCallback(
    (msPerFrame: number) => {
      const msPerSample = msPerFrame / samples
      return msPerSample * ticksPerMs
    },
    [samples]
  )

  return (
    <div>
      <Panel header="Scales" shaded collapsible defaultExpanded>
        {useMemo(
          () => (
            <SelectPicker
              searchable={true}
              value={ticksPerAdcRead}
              cleanable={false}
              onChange={(n: number) => {
                console.log(n)
                // setSynchMode(false)
                // setSynchMode(n < millisToADCClocks(20))
                setTicksPerAdcRead(n)
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
          [ticksPerAdcRead, setTicksPerAdcRead, setSynchMode]
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
