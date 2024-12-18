import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarSectionProvider } from './contexts/SidebarSectionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <AuthProvider>
      <SidebarSectionProvider>
        <App />
      </SidebarSectionProvider>
    </AuthProvider>



  </StrictMode>,
)
