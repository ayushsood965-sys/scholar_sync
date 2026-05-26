import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThesisProvider } from './context/ThesisContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <ThesisProvider>
          <App />
        </ThesisProvider>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>,
)
