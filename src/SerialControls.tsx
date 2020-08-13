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

function SerialControls() {
  const [serialState, setSerialState] = useState('Connected')
  const setAllData = useSetRecoilState(allDataState)
  useEffect(() => {
    serial.onData(setAllData)
  }, [setAllData])

  useEffect(() => {
    let i = 0
    setInterval(() => {
      i++
      const state = ['Connected', 'Disconnected', 'Waiting'][i % 3]
      setSerialState(state)
    }, 1000)
    serial.connectWithPaired(serialOptions).catch(() => {})
  }, [])
  return (
    <>
      <ButtonGroup>
        <IconButton
          appearance="primary"
          size="lg"
          onClick={async () => {
            await serial.connect(serialOptions)
            console.log('connected')
          }}
          icon={<Icon icon="arrow-right" />}
          placement="right"
        />
        <IconButton
          size="lg"
          onClick={async () => {
            await serial.close()
            console.log('closed')
          }}
          icon={<Icon icon="stop" />}
          placement="right"
        />

        <IconButton
          size="lg"
          onClick={async () => {
            try {
              await serial.connectWithPaired(serialOptions)
            } catch (e) {
              await serial.connect(serialOptions)
            }
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
              console.log(serialState)
              switch (serialState) {
                case 'Connected':
                  return <Tag color="green">Connected</Tag>
                case 'Disconnected':
                  return <Tag color="red">Disconnected</Tag>
                case 'Waiting':
                  return <Tag color="yellow">No activity</Tag>
              }
              return <Tag>WAT</Tag>
            })()}
          </ButtonToolbar>
        ),
        [serialState]
      )}
    </>
  )
}

export default SerialControls
