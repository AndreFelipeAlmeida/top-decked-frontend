import { AuthContext } from "./AuthContext"
import { useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/hooks/auth.hooks"
import { logout as logoutRequest } from "@/services/auth.service"
import { sessionKeys } from "@/keys/auth.keys"
import { ROOT_DOMAIN, ROOT_DOMAIN_PROTOCOLO } from "@/lib/rootDomain"

type AuthProviderProps = {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useSession(true)

  const isAuthenticated = !isError && !!user

  const handleLogin = () => {
    return queryClient.invalidateQueries({ queryKey: sessionKeys.all })
  }

  const handleLogout = async () => {
    // Precisa do request: o cookie é HttpOnly, JS não consegue apagá-lo
    // sozinho (ver auth.service.logout).
    await logoutRequest()
    queryClient.clear()

    const porta = window.location.port ? `:${window.location.port}` : ''
    window.location.href = `${ROOT_DOMAIN_PROTOCOLO}://${ROOT_DOMAIN}${porta}/login`
  }

  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
