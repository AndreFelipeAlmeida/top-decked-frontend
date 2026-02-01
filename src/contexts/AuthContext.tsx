import { createContext } from "react"
import { type User } from "@/types/User"


export type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  handleLogin: (token: string) => void
  handleLogout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
