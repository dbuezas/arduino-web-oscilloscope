import MouseTrap from 'mousetrap'
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  useTicksPerAdcRead,
  useTriggerDirection,
  isRunningState,
  useTriggerMode,
  useAmplifier,
  TriggerMode,
  didTriggerState,
  useSamplesPerBuffer,
  useTriggerChannel,
  useIsBuffer0ON,
  useIsBuffer1ON,
  useIsBuffer2ON,
  isOversamplingState
} from './bindings'
import { formatTime, formatVoltage } from './formatters'
import {
  Icon,
  Panel,
  SelectPicker,
  Tag,
  ButtonToolbar,
  ButtonGroup,
  Button,
  IconButton,
  Toggle
} from 'rsuite'
import { useRecoilState, useRecoilValue } from 'recoil'

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
  const [amplifier, setAmplifier] = useRecoilState(useAmplifier.send)
  const [isOversampling, setIsOversampling] = useRecoilState(
    isOversamplingState
  )

  const [isRunning, setIsRunning] = useRecoilState(isRunningState)
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
  const [timeDivisions, setTimeDivisions] = useState<
    {
      label: string
      value: number
    }[]
  >([])
  useEffect(() => {
    setTimeDivisions(
      [
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
        50.055,
        100
      ].map((msPerDivision) => {
        const ticks = millisPerDivisionToTicksPerSample(msPerDivision)
        return {
          label: formatTime(msPerDivision / 1000),
          value: Math.round(ticks)
        }
      })
    )
  }, [ticksPerSampleToMSPerDivision, millisPerDivisionToTicksPerSample])

  useEffect(() => {
    MouseTrap.bind('space', () => setIsRunning((isRunning) => !isRunning))
    return () => {
      MouseTrap.unbind('space')
    }
  }, [setIsRunning])
  useEffect(() => {
    MouseTrap.bind('right', () => setTicksPerAdcRead((ticksPerAdcRead * 3) / 2))
    MouseTrap.bind('left', () => setTicksPerAdcRead((ticksPerAdcRead * 2) / 3))
    MouseTrap.bind('up', () => setAmplifier(amplifier + 1))
    MouseTrap.bind('down', () => setAmplifier(amplifier - 1))
    return () => {
      MouseTrap.unbind('right')
      MouseTrap.unbind('left')
      MouseTrap.unbind('up')
      MouseTrap.unbind('down')
    }
  }, [amplifier, setAmplifier, setTicksPerAdcRead, ticksPerAdcRead])

  return (
    <div>
      <Panel header="Scales" shaded collapsible defaultExpanded>
        {useMemo(
          () => (
            <Button
              style={{
                color: 'white',
                backgroundColor: isRunning ? 'green' : 'red',
                width: '100%',
                marginBottom: '10px'
              }}
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Run' : 'Hold'}
            </Button>
          ),
          [isRunning, setIsRunning]
        )}
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
              data={timeDivisions}
              style={{ width: 224, marginBottom: 10 }}
            />
          ),
          [ticksPerAdcRead, timeDivisions, setTicksPerAdcRead]
        )}
        {useMemo(
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
        )}
      </Panel>

      <Panel header="Trigger" shaded collapsible defaultExpanded>
        {useMemo(
          () => (
            <>
              <div>Channel:</div>
              <ButtonToolbar style={ButtonToolbarStyle}>
                <ButtonGroup>
                  {['A0', 'AS', 'A2', 'A3', 'A4', 'A5'].map((name, idx) => (
                    <Button
                      key={idx}
                      appearance={
                        triggerChannel === idx ? 'primary' : 'default'
                      }
                      size="sm"
                      onClick={() => setTriggerChannel(idx)}
                    >
                      {name}
                    </Button>
                  ))}
                </ButtonGroup>
              </ButtonToolbar>
            </>
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
            <div style={ButtonToolbarStyle}>
              Oversample
              <Toggle value={isOversampling} onChange={setIsOversampling} />
            </div>
          ),
          [isOversampling, setIsOversampling]
        )}
        {useMemo(
          () => (
            <ButtonToolbar style={ButtonToolbarStyle}>
              State:&nbsp;
              {!isRunning ? (
                <Tag color="red">Hold</Tag>
              ) : didTrigger ? (
                <Tag color="green">Triggered</Tag>
              ) : (
                <Tag color="yellow">Searching</Tag>
              )}
            </ButtonToolbar>
          ),
          [isRunning, didTrigger]
        )}
      </Panel>
    </div>
  )
}

export default Controls
