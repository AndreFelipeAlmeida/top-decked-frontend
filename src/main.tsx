import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {  QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthProvider.tsx'
import { TcgSelectionProvider } from './contexts/TcgSelectionProvider.tsx'
import { ViewModeProvider } from './contexts/ViewModeProvider.tsx'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Erro 4xx (400-499) é do cliente/da requisição em si — tentar de novo
      // sem mudar nada não vai virar sucesso (ex.: 404 de lista vazia).
      // Só vale insistir em erro de rede/servidor (5xx).
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TcgSelectionProvider>
          <ViewModeProvider>
            <Router>
              <App />
            </Router>
          </ViewModeProvider>
        </TcgSelectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
