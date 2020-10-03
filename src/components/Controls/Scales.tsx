import MouseTrap from 'mousetrap'
import React, { useEffect } from 'react'
import { isRunningState } from '../../communication/bindings'
import { Panel, Button } from 'rsuite'
import { useRecoilState } from 'recoil'
import Amplifier from './Amplifier'
import TimeScales from './TimeScales'
import { useActiveBtns } from './hooks'

export default function Scales() {
  const [isRunning, setIsRunning] = useRecoilState(isRunningState)
  const [activeBtns, activateBtn] = useActiveBtns({ space: false })

  useEffect(() => {
    MouseTrap.bind('space', (e) => {
      e.preventDefault()
      setIsRunning((isRunning) => !isRunning)
    })
    return () => {
      MouseTrap.unbind('space')
    }
  }, [setIsRunning])

  return (
    <Panel header="Scales" shaded collapsible defaultExpanded>
      <Button
        active={activeBtns['space']}
        style={{
          color: 'white',
          backgroundColor: isRunning ? 'green' : 'red',
          width: '100%',
          marginBottom: '10px'
        }}
        size="sm"
        onClick={() => {
          setIsRunning(!isRunning)
          activateBtn('space')
        }}
      >
        {(isRunning ? 'Run' : 'Hold') + ' [space]'}
      </Button>
      <TimeScales />
      <Amplifier />
    </Panel>
  )
}
