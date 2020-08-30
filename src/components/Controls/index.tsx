import React from 'react'

import Trigger from './Trigger'
import Channels from './Channels'
import Scales from './Scales'
import SerialControls from './SerialControls'
import Voltages from './Voltages'

function Controls() {
  return (
    <>
      <SerialControls />
      <Scales />
      <Channels />
      <Trigger />
      <Voltages />
    </>
  )
}

export default Controls
