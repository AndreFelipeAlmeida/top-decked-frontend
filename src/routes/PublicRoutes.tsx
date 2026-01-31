import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "@/hooks/useAuthContext"

const PublicRoutes = () => {
  const { user } = useAuthContext();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (<Outlet />);
}

export default PublicRoutes;
