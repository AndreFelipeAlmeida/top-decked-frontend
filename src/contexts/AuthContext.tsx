import { createContext } from "react"
import { type User } from "@/types/User"


export type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  handleLogin: () => Promise<void>
  handleLogout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
