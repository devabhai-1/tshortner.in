import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import App from './App'
import './styles/global.css'
import { runCacheVersionMigration } from './utils/appCacheVersion'

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (const registration of registrations) {
        registration.unregister().then(function (success) {
          if (success) {
            console.log('✅ Service worker unregistered (dev mode)')
          }
        })
      }
    })
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope)

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New service worker available')
                if (window.confirm('New version available! Reload to update?')) {
                  window.location.reload()
                }
              }
            })
          }
        })

        setInterval(() => {
          registration.update()
        }, 600000)
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error)
      })
  })
}

async function bootstrap() {
  await runCacheVersionMigration()
  registerServiceWorker()

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
}

bootstrap()
