import React, { useMemo, useState, useCallback } from 'react'
import {
  useTicksPerAdcRead,
  useTriggerDirection,
  synchMode,
  useTriggerMode,
  TriggerMode,
  freeMemoryState,
  didTriggerState,
  useSamplesPerBuffer,
  useTriggerChannel,
  useIsBuffer0ON,
  useIsBuffer1ON,
  useIsBuffer2ON
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
const msPerTick = 1000 / 32000000
const divisionsPerFrame = 10

function Controls() {
  const [voltage, setVoltage] = useState(5)
  const [ticksPerAdcRead, setTicksPerAdcRead] = useRecoilState(
    useTicksPerAdcRead.send
  )
  const [triggerMode, setTriggerMode] = useRecoilState(useTriggerMode.send)
  const [triggerChannel, setTriggerChannel] = useRecoilState(
    useTriggerChannel.send
  )
  const [isBuffer0ON, setIsBuffer0ON] = useRecoilState(useIsBuffer0ON.send)
  const [isBuffer1ON, setIsBuffer1ON] = useRecoilState(useIsBuffer1ON.send)
  const [isBuffer2ON, setIsBuffer2ON] = useRecoilState(useIsBuffer2ON.send)
  const freeMemory = useRecoilValue(freeMemoryState)
  const didTrigger = useRecoilValue(didTriggerState)
  const [triggerDirection, setTriggerDirection] = useRecoilState(
    useTriggerDirection.send
  )
  const samples = useRecoilValue(useSamplesPerBuffer.send)
  const ticksPerSampleToMSPerDivision = useCallback(
    (ticksPerSample: number) => {
      const msPerSample = msPerTick * ticksPerSample
      const msPerFrame = msPerSample * samples
      const msPerDivision = msPerFrame / divisionsPerFrame
      return msPerDivision
    },
    [samples]
  )
  const millisPerDivisionToTicksPerSample = useCallback(
    (msPerDivision: number) => {
      const msPerFrame = msPerDivision * divisionsPerFrame
      const msPerSample = msPerFrame / samples
      const ticksPerSample = ticksPerMs * msPerSample
      return ticksPerSample
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
                setTicksPerAdcRead(n)
                console.log(n)
              }}
              data={[
                0.1,
                ticksPerSampleToMSPerDivision(88),
                0.2,
                0.5,
                1,
                2,
                5,
                10,
                20,
                50,
                100
              ].map((msPerDivision) => {
                const ticks = millisPerDivisionToTicksPerSample(msPerDivision)
                return {
                  label: formatTime(msPerDivision / 1000),
                  value: Math.round(ticks)
                }
              })}
              style={{ width: 224, marginBottom: 10 }}
            />
          ),
          [
            ticksPerAdcRead,
            ticksPerSampleToMSPerDivision,
            setTicksPerAdcRead,
            millisPerDivisionToTicksPerSample
          ]
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
              <div>Channel:</div>

              <ButtonGroup>
                {['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map((name, idx) => (
                  <Button
                    key={idx}
                    appearance={triggerChannel === idx ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => setTriggerChannel(idx)}
                  >
                    {name}-{idx}
                  </Button>
                ))}
              </ButtonGroup>
            </ButtonToolbar>
          ),
          [setTriggerChannel, triggerChannel]
        )}
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
              <div>Channels:</div>
              <ButtonGroup>
                <Button
                  size="sm"
                  appearance={isBuffer0ON ? 'primary' : 'default'}
                  onClick={() => setIsBuffer0ON(isBuffer0ON ? 0 : 1)}
                >
                  0
                </Button>
                <Button
                  size="sm"
                  appearance={isBuffer1ON ? 'primary' : 'default'}
                  onClick={() => setIsBuffer1ON(isBuffer1ON ? 0 : 1)}
                >
                  1
                </Button>
                <Button
                  size="sm"
                  appearance={isBuffer2ON ? 'primary' : 'default'}
                  onClick={() => setIsBuffer2ON(isBuffer2ON ? 0 : 1)}
                >
                  2
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          ),
          [
            isBuffer0ON,
            isBuffer1ON,
            isBuffer2ON,
            setIsBuffer0ON,
            setIsBuffer1ON,
            setIsBuffer2ON
          ]
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
