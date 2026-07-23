import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthContext } from "@/hooks/authContext.hooks"
import { useTenant } from "@/hooks/tenantContext.hooks"

const PublicRoutes = () => {
  const { user } = useAuthContext();
  const { isTenant, isLoading: isTenantLoading } = useTenant();
  const location = useLocation();

  if (user) {
    return <Navigate
            to={`${user.tipo}/dashboard`}
            replace />;
  }

  if (!isTenantLoading && isTenant && location.pathname === "/") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Outlet />
    );
}

export default PublicRoutes;
