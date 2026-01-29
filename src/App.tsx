import './App.css'
import { Routes, Route } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import ProtectedRoutes from '@/layouts/ProtectedRoutes'


function App() {

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tournaments" element={<Tournaments />} />
      </Route>
    </Routes>
  )
}

export default App
