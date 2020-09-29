import React from 'react'

import Trigger from './Trigger'
import Channels from './Channels'
import Scales from './Scales'
import SerialControls from './SerialControls'
import Stats from './Stats'

function Controls() {
  return (
    <>
      <SerialControls />
      <Scales />
      <Channels />
      <Trigger />
      <Stats />
    </>
  )
}

export default Controls
