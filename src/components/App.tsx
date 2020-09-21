import React from 'react'
import Plot from './Plot/Plot'
import 'rsuite/dist/styles/rsuite-default.css'

import './App.css'

import Controls from './Controls'
import { Panel, Container, Content, Sidebar } from 'rsuite'
import About from './About'

function App() {
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
