import React from 'react'
import Plot from './Plot'
import 'rsuite/dist/styles/rsuite-default.css'

import './App.css'

import Controls from './Controls'
import SerialControls from './SerialControls'
import { Panel, Container, Content, Sidebar } from 'rsuite'
import AnalysisControls from './AnalysisControls'

function App() {
  return (
    <div className="App">
      <Container>
        <Content>
          <Panel shaded>
            <Plot />
          </Panel>
        </Content>
        <Sidebar>
          <SerialControls />
          <Controls />
          <AnalysisControls />
        </Sidebar>
      </Container>
    </div>
  )
}

export default App
