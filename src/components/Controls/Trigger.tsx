import React from 'react'
import {
  useTriggerDirection,
  isRunningState,
  useTriggerMode,
  TriggerMode,
  didTriggerState,
  useTriggerChannel,
  TriggerDirection,
  requestData,
  useSecPerSample
} from '../../communication/bindings'
import {
  Icon,
  Panel,
  Tag,
  ButtonToolbar,
  ButtonGroup,
  Button,
  IconButton
} from 'rsuite'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import win from '../../win'

const ButtonToolbarStyle = {
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

export default function Trigger() {
  const isRunning = useRecoilValue(isRunningState)
  win.requestData = useSetRecoilState(requestData.send)
  const [triggerMode, setTriggerMode] = useRecoilState(useTriggerMode.send)
  const [triggerChannel, setTriggerChannel] = useRecoilState(
    useTriggerChannel.send
  )
  const didTrigger = useRecoilValue(didTriggerState)
  const [triggerDirection, setTriggerDirection] = useRecoilState(
    useTriggerDirection.send
  )
  const secPerSample = useRecoilValue(useSecPerSample.send)
  const tooFastForSlowMode = secPerSample < 0.0046875
  return (
    <Panel header="Trigger" shaded collapsible defaultExpanded>
      <ButtonToolbar style={ButtonToolbarStyle}>
        <ButtonGroup>
          {['A0', 'AS', 'A2', 'A3', 'A4', 'A5'].map((name, idx) => (
            <Button
              key={idx}
              appearance={triggerChannel === idx ? 'primary' : 'default'}
              disabled={
                ['A2', 'A3'].includes(
                  name
                ) /* these are connected to the diff amp and generate noise */
              }
              size="sm"
              onClick={() => setTriggerChannel(idx)}
            >
              {name}
            </Button>
          ))}
        </ButtonGroup>
      </ButtonToolbar>
      <ButtonToolbar style={ButtonToolbarStyle}>
        <ButtonGroup>
          {Object.values(TriggerMode).map((mode) => (
            <Button
              key={mode}
              appearance={triggerMode === mode ? 'primary' : 'default'}
              color={
                mode === TriggerMode.SLOW && tooFastForSlowMode
                  ? 'red'
                  : undefined
              }
              size="sm"
              onClick={() => setTriggerMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </ButtonGroup>
      </ButtonToolbar>
      <ButtonToolbar style={ButtonToolbarStyle}>
        <div>Direction:</div>
        <ButtonGroup>
          <IconButton
            size="sm"
            appearance={
              triggerDirection === TriggerDirection.FALLING
                ? 'primary'
                : 'default'
            }
            icon={<Icon icon="level-down" />}
            onClick={() => setTriggerDirection(TriggerDirection.FALLING)}
          />
          <IconButton
            size="sm"
            appearance={
              triggerDirection === TriggerDirection.RISING
                ? 'primary'
                : 'default'
            }
            icon={<Icon icon="level-up" />}
            onClick={() => setTriggerDirection(TriggerDirection.RISING)}
          />
        </ButtonGroup>
      </ButtonToolbar>
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
    </Panel>
  )
}
