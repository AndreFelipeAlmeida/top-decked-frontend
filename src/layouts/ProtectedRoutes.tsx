import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "@/hooks/useAuthContext"
import Navbar from "@/components/Navbar";

const AuthLayout = () => {
  const { user, logout } = useAuthContext();

  if (!user) {
    <Navigate
      to="/login"
      replace
      state={{ from: location }}
    />
  }

  return (
    <>
      <Navbar currentUser={user} onLogout={logout}/>
      <Outlet />
    </>
  );
}

export default AuthLayout;
