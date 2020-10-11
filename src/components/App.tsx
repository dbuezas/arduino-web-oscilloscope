import React, { Suspense } from 'react'
import Plot from './Plot/Plot'

import Controls from './Controls'
import { Panel, Container, Content, Sidebar } from 'rsuite'
import About from './About'
import EnableSerialInstructions from './EnableSerialInstructions'
const AndroidSerialLoader = React.lazy(() => import('./AndroidSerialLoader'))

const isAndroid = navigator.userAgent.toLowerCase().indexOf('android') > -1

function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)
  return Number(raw ? parseInt(raw[2], 10) : false)
}
function App() {
  if (!isAndroid && getChromeVersion() < 86)
    return <p>Requires an updated version of Chrome (≥ 86.x.x)</p>
  if (!isAndroid && !navigator.serial) return <EnableSerialInstructions />
  return (
    <div className="App">
      {isAndroid && (
        <Suspense fallback={<>loading</>}>
          <AndroidSerialLoader />
        </Suspense>
      )}
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
