import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import App from './App'
import './styles.css'
import { I18nProvider } from './shared/i18n/i18n-provider'
import { AppQueryProvider } from './shared/query/query-provider'
import { ToastProvider } from './shared/toast/toast-provider'
import { ThemeProvider } from './theme/theme-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AppQueryProvider>
          <ToastProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ToastProvider>
        </AppQueryProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
)
