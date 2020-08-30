import React, { useMemo } from 'react'
import {
  useIsChannelOn,
  isOversamplingState
} from '../../communication/bindings'
import { Panel, ButtonToolbar, ButtonGroup, Button, Toggle } from 'rsuite'
import { useRecoilState } from 'recoil'

const ButtonToolbarStyle = {
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

export default function Channels() {
  const [isOversampling, setIsOversampling] = useRecoilState(
    isOversamplingState
  )
  const [isChannelOn, setIsChannelOn] = useRecoilState(useIsChannelOn.send)

  return (
    <Panel header="Channels" shaded collapsible defaultExpanded>
      {useMemo(
        () => (
          <>
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
          </>
        ),
        [isChannelOn, setIsChannelOn]
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
    </Panel>
  )
}
