import React from 'react'

import { Panel, Tag } from 'rsuite'

export default function About() {
  return (
    <Panel header="About" shaded collapsible defaultExpanded>
      <Tag>David Buezas 2020</Tag>
      https://github.com/dbuezas/arduino-web-oscilloscope
    </Panel>
  )
}
