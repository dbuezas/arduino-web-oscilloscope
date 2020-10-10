import './index.scss'

import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { RecoilRoot } from 'recoil'

if (process.env.NODE_ENV === 'production') {
  // @TODO: app looks zomed in in development
  // analysing the computed css, I can see that the
  // HTML element has zoom=0.8 in dev and zoom=1 in production
  document.documentElement.style.zoom = '0.8'
}
ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
