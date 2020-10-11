import React from 'react'
import Plot from './Plot/Plot'

import Controls from './Controls'
import { Panel, Container, Content, Sidebar } from 'rsuite'
import About from './About'
import EnableSerialInstructions from './EnableSerialInstructions'

function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)
  return Number(raw ? parseInt(raw[2], 10) : false)
}
function App() {
  if (getChromeVersion() < 86)
    return <p>Requires an updated version of Chrome (≥ 86.x.x)</p>
  if (!navigator.serial) return <EnableSerialInstructions />
  return (
    <div className="App">
      <Container>
        <Content>
          <Panel shaded>
            <Plot />
          </Panel>
        </Content>
        <Sidebar width={261}>
          <Controls />
          <About />
        </Sidebar>
      </Container>
    </div>
  )
}

export default App
