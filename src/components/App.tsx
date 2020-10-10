import React from 'react'
import Plot from './Plot/Plot'
import 'rsuite/dist/styles/rsuite-default.css'

import './App.css'

import Controls from './Controls'
import { Panel, Container, Content, Sidebar } from 'rsuite'
import About from './About'

function App() {
  if (!navigator.serial) {
    return (
      <>
        Enable experimental web platform features to activate the Web Serial API
        <br />
        paste this url in your browser and
        <br />
        <img
          alt=""
          src={process.env.PUBLIC_URL + '/ExperimentalWebPlatformFeatures.png'}
        ></img>
        chrome://flags/#enable-experimental-web-platform-features
      </>
    )
  }
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
