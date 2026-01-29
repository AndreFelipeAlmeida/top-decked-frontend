import { useState } from "react"
import { AuthContext, type User } from "./AuthContext"

type AuthProviderProps = {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
