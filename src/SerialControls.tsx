import { IconButton, Icon, ButtonToolbar, Tag, ButtonGroup } from 'rsuite'
import React, { useEffect, useMemo, useState } from 'react'
import { allDataState } from './bindings'

import serial from './Serial'
import { useSetRecoilState } from 'recoil'

const serialOptions = {
  baudrate: 115200 * 2,
  buffersize: 1000000 //500 * 100
}
const ButtonToolbarStyle = {
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}
type ConnectedState = 'Connected' | 'Disconnected' | 'Connecting...' | 'Error'

function SerialControls() {
  const [serialState, setSerialState] = useState<ConnectedState>('Disconnected')
  const setAllData = useSetRecoilState(allDataState)
  useEffect(() => {
    serial.onData(setAllData)
  }, [setAllData])

  useEffect(() => {
    // let i = 0
    // setInterval(() => {
    //   i++
    //   const state = ['Connected', 'Disconnected', 'Waiting', 'Error'][i % 3]
    //   setSerialState(state)
    // }, 1000)
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
          appearance="primary"
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
