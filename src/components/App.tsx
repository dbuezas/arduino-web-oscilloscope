import React from 'react'
import Plot from './Plot/Plot'

import Controls from './Controls'
import { Panel, Container, Content, Sidebar } from 'rsuite'
import About from './About'
import EnableSerialInstructions from './EnableSerialInstructions'

function App() {
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
