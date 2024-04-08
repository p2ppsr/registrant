import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Prompt from '@babbage/react-prompt'

ReactDOM.render(
  // <Prompt
  //   appName='Registrant'
  //   appIcon='/favicon.ico'
  //   author='Project Babbage'
  //   authorUrl='https://projectbabbage.com'
  //   description='Registry operator services dashboard.'
  // >
  <App />,
  // </Prompt>,
  document.getElementById('root')
)
