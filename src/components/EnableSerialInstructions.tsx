import React from 'react'

import { Panel, Button, Notification, Steps } from 'rsuite'
import useCopy from '@react-hook/copy'

const chromeFlagsUrl =
  'chrome://flags/#enable-experimental-web-platform-features'
const styles = {
  width: '200px',
  display: 'inline-table',
  verticalAlign: 'top'
}
function EnableSerialInstructions() {
  const { copy } = useCopy(chromeFlagsUrl)

  return (
    <div className="App">
      <Panel
        shaded
        bordered
        style={{
          margin: '20px auto',
          overflow: 'scroll',
          height: '100%',
          zoom: 0.8
        }}
      >
        <Panel
          header={
            <>
              <p style={{ fontSize: 30 }}>
                Enable experimental web platform features to activate the Web
                Serial API{' '}
              </p>
              <br />
            </>
          }
        >
          <Steps vertical style={styles}>
            <Steps.Item
              title="Copy the chrome flags url"
              description={
                <Button
                  color="green"
                  onClick={() => {
                    copy()
                    Notification.success({
                      title: 'It is now in your clipboard',
                      description: chromeFlagsUrl
                    })
                  }}
                >
                  {chromeFlagsUrl}
                </Button>
              }
            />
            <Steps.Item
              title="Paste it in the address bar of the browser and press [enter]"
              description={
                <>
                  <img
                    alt=""
                    src={process.env.PUBLIC_URL + '/address-bar.png'}
                  ></img>
                  <p>
                    Right there. This will take you to the the page where you
                    can support for the serial port.
                  </p>
                </>
              }
            />
            <Steps.Item
              title="Enable the experimental web platform features"
              description={
                <img
                  alt=""
                  src={
                    process.env.PUBLIC_URL +
                    '/ExperimentalWebPlatformFeatures.png'
                  }
                ></img>
              }
            />
            <Steps.Item
              title="Reload this page"
              description="And you'll be ready to use the oscilloscope"
            />
            <Steps.Item
              title="Enjoy"
              description={
                <>
                  <img
                    width="500px"
                    alt=""
                    src={process.env.PUBLIC_URL + '/screenshot.png'}
                  ></img>
                  <p>
                    Do not do something stupid, the board is connected to your
                    computer so it shares Ground with it, also do not push more
                    than 5v to it.
                  </p>
                </>
              }
            />
          </Steps>
        </Panel>
      </Panel>
    </div>
  )
}

export default EnableSerialInstructions
