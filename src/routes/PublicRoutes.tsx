import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "@/hooks/authContext.hooks"

const PublicRoutes = () => {
  const { user } = useAuthContext();

  if (user) {
    return <Navigate 
            to={`${user.tipo}/dashboard`} 
            replace />;
  }

  return (
    <Outlet />
    );
}

export default PublicRoutes;
