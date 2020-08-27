import { IconButton, Icon, ButtonToolbar, Tag, ButtonGroup } from 'rsuite'
import React, { useEffect, useMemo, useState } from 'react'
import { allDataState, synchMode } from './bindings'

import serial from './Serial'
import { useSetRecoilState } from 'recoil'

const serialOptions = {
  baudrate: 115200 * 2,
  buffersize: 20000
}
const ButtonToolbarStyle = {
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}
type ConnectedState = 'Connected' | 'Disconnected' | 'Connecting...' | 'Error'
function SerialControls() {
  const [frameCount, setFrameCount] = useState(0)
  const [serialState, setSerialState] = useState<ConnectedState>('Disconnected')
  const setSynchMode = useSetRecoilState(synchMode)
  const setAllData = useSetRecoilState(allDataState)
  useEffect(() => {
    serial.onData((data) => {
      setAllData(data)
      setFrameCount((frameCount) => {
        setSynchMode(frameCount < 5)
        return frameCount + 1
      })
    })
  }, [setAllData, setSynchMode])
  useEffect(() => {
    setFrameCount(0)
  }, [serialState])
  useEffect(() => {
    setSerialState('Connecting...')
    serial
      .connectWithPaired(serialOptions)
      .then(() => setSerialState('Connected'))
      .catch(() => setSerialState('Error'))
  }, [])
  return (
    <>
      <ButtonGroup>
        <IconButton
          appearance={serialState == 'Connected' ? 'primary' : undefined}
          size="lg"
          onClick={async () => {
            serial
              .connect(serialOptions)
              .then(() => setSerialState('Connected'))
              .catch(() => setSerialState('Error'))
          }}
          icon={<Icon icon="arrow-right" />}
          placement="right"
        />
        <IconButton
          size="lg"
          appearance={serialState != 'Connected' ? 'primary' : undefined}
          onClick={async () => {
            serial
              .close()
              .then(() => setSerialState('Disconnected'))
              .catch(() => setSerialState('Error'))
          }}
          icon={<Icon icon="stop" />}
          placement="right"
        />

        <IconButton
          size="lg"
          onClick={async () => {
            setSerialState('Connecting...')

            await serial
              .connectWithPaired(serialOptions)
              .catch(() => serial.connect(serialOptions))
              .then(() => setSerialState('Connected'))
              .catch(() => setSerialState('Error'))
          }}
          icon={<Icon icon="recycle" />}
          placement="right"
        />
      </ButtonGroup>

      {useMemo(
        () => (
          <ButtonToolbar style={ButtonToolbarStyle}>
            State:&nbsp;
            {(() => {
              const color = {
                Connected: 'green',
                'Connecting...': 'yellow',
                Error: 'red',
                Disconnected: 'grey'
              }[serialState]

              return <Tag color={color}>{serialState}</Tag>
            })()}
          </ButtonToolbar>
        ),
        [serialState]
      )}
    </>
  )
}

export default SerialControls
