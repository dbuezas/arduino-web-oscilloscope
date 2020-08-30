import MouseTrap from 'mousetrap'
import React, { useMemo, useEffect } from 'react'
import { isRunningState } from '../../communication/bindings'
import { Panel, Button } from 'rsuite'
import { useRecoilState } from 'recoil'
import Amplifier from './Amplifier'
import TimeScales from './TimeScales'

export default function Scales() {
  const [isRunning, setIsRunning] = useRecoilState(isRunningState)

  useEffect(() => {
    MouseTrap.bind('space', () => setIsRunning((isRunning) => !isRunning))
    return () => {
      MouseTrap.unbind('space')
    }
  }, [setIsRunning])

  return (
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
      <TimeScales />
      <Amplifier />
    </Panel>
  )
}
