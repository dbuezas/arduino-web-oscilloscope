import React from 'react'

import { Panel, Tag } from 'rsuite'

export default function About() {
  return (
    <Panel header="About" shaded collapsible defaultExpanded>
      <p>David Buezas 2020</p>
      <a href="https://github.com/dbuezas/arduino-web-oscilloscope">
        https://github.com/dbuezas/arduino-web-oscilloscope
      </a>
    </Panel>
  )
}
