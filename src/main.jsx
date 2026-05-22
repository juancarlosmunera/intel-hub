import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { getInitialTheme, applyTheme } from './hooks/useTheme'

// Apply the saved theme before first paint to avoid a flash.
applyTheme(getInitialTheme())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
