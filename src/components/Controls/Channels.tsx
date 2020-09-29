import React from 'react'
import {
  useIsChannelOn,
  oversamplingFactorState
} from '../../communication/bindings'
import { Panel, ButtonToolbar, ButtonGroup, Button, Slider } from 'rsuite'
import { useRecoilState } from 'recoil'

const ButtonToolbarStyle = {
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

export default function Channels() {
  const [oversamplingFactor, setOversamplingFactor] = useRecoilState(
    oversamplingFactorState
  )
  const [isChannelOn, setIsChannelOn] = useRecoilState(useIsChannelOn.send)

  return (
    <Panel header="Channels" shaded collapsible defaultExpanded>
      <ButtonToolbar style={ButtonToolbarStyle}>
        <ButtonGroup>
          {['A0', 'AS', 'A2', 'A3', 'A4', 'A5'].map((name, i) => (
            <Button
              key={i}
              appearance={isChannelOn[i] ? 'primary' : 'default'}
              size="sm"
              onClick={() => {
                const buffer = isChannelOn.slice()
                buffer[i] = !buffer[i]
                setIsChannelOn(buffer)
              }}
            >
              {name}
            </Button>
          ))}
        </ButtonGroup>
      </ButtonToolbar>
      <div style={ButtonToolbarStyle}>
        Oversample
        <Slider
          style={{ width: '50%' }}
          value={oversamplingFactor}
          onChange={setOversamplingFactor}
          max={0.99}
          min={0}
          step={0.01}
        />
      </div>
    </Panel>
  )
}
