import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {  QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthProvider.tsx'


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <App />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
