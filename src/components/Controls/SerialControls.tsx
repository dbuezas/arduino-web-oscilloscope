import {
  IconButton,
  Icon,
  ButtonToolbar,
  Tag,
  ButtonGroup,
  Panel
} from 'rsuite'
import React, { useEffect, useState } from 'react'
import { allDataState } from '../../communication/bindings'
import serial from '../../communication/Serial'
import { useSetRecoilState } from 'recoil'
import Uploader from './Uploader'

const serialOptions = {
  baudrate: 115200 * 1,
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
  const [serialState, setSerialState] = useState<ConnectedState>('Disconnected')
  const setAllData = useSetRecoilState(allDataState)
  useEffect(() => {
    return serial.onData((data) => {
      setAllData(data)
    })
  }, [setAllData])
  useEffect(() => {
    setSerialState('Connecting...')
    serial
      .connectWithPaired(serialOptions)
      .then(() => setSerialState('Connected'))
      .catch(() => setSerialState('Disconnected'))
  }, [])
  return (
    <Panel shaded header="Serial">
      <ButtonGroup style={ButtonToolbarStyle}>
        <IconButton
          style={{ flex: 1 }}
          appearance={serialState === 'Connected' ? 'primary' : undefined}
          size="md"
          onClick={async () => {
            serial
              .connect(serialOptions)
              .then(() => setSerialState('Connected'))
              .catch(() => setSerialState('Error'))
          }}
          icon={<Icon icon="arrow-right" style={{ width: ' 100%' }} />}
          placement="right"
        />
        <IconButton
          style={{ flex: 1 }}
          size="md"
          appearance={serialState !== 'Connected' ? 'primary' : undefined}
          onClick={async () => {
            serial
              .close()
              .then(() => setSerialState('Disconnected'))
              .catch(() => setSerialState('Error'))
          }}
          icon={<Icon icon="stop" style={{ width: ' 100%' }} />}
          placement="right"
        />

        <IconButton
          style={{ flex: 1 }}
          size="md"
          onClick={async () => {
            setSerialState('Connecting...')

            await serial
              .connectWithPaired(serialOptions)
              .catch(() => serial.connect(serialOptions))
              .then(() => setSerialState('Connected'))
              .catch(() => setSerialState('Error'))
          }}
          icon={<Icon icon="recycle" style={{ width: ' 100%' }} />}
          placement="right"
        />
      </ButtonGroup>

      <ButtonToolbar style={ButtonToolbarStyle}>
        State:&nbsp;
        {(() => {
          const color = {
            Connected: 'green',
            'Connecting...': 'yellow',
            Error: 'red',
            Disconnected: undefined
          }[serialState]

          return <Tag color={color}>{serialState}</Tag>
        })()}
      </ButtonToolbar>
      {serialState == 'Disconnected' && <Uploader />}
    </Panel>
  )
}

export default SerialControls
