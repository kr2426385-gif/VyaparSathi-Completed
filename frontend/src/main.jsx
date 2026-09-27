import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n.js'
import { EnterpriseProfileProvider } from './context/EnterpriseProfileContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <EnterpriseProfileProvider>
        <App />
      </EnterpriseProfileProvider>
    </BrowserRouter>
  </StrictMode>,
)

