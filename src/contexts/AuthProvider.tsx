import { useState, useEffect } from "react"
import { AuthContext } from "./AuthContext"
import { type User } from "@/types/User"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { profile } from "@/services/loginService"
import { api } from "@/adapters/api"

type AuthProviderProps = {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("accessToken")
    return storedToken ? JSON.parse(storedToken) : null
  })
  const queryClient = useQueryClient(); 

  const isAuthenticated = !!token

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common.Authorization
    }
  }, [token])

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["profile"],
    queryFn: profile,
    enabled: !!token,
  })

  const handleLogin = (token: string) => {
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("accessToken", JSON.stringify(token))

    setToken(token)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    queryClient.clear()
    setToken(null)
  }

  if (isLoading && token) {
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
