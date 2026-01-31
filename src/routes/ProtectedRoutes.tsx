import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "@/hooks/useAuthContext"
import { type UserRole } from "@/types/User"
import { useLocation } from "react-router-dom"
import AppLayout from "@/components/AppLayout"


type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthContext()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.tipo)) {
    return <Navigate to={`${user.tipo}/dashboard` }replace />
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>);
}

export default ProtectedRoute
