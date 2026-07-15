import { createContext } from "react"
import { type User } from "@/types/User"


export type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  // BRK-309: sem argumento — a sessão já foi estabelecida via cookie pelo
  // Set-Cookie da resposta de login, isso só dispara o refetch de "quem
  // está logado agora". BRK-314: retorna Promise (resolve só quando o
  // refetch termina) — quem chama precisa aguardar antes de navegar, senão
  // ProtectedRoute pode renderizar com o isAuthenticated ainda da sessão
  // anterior (deslogada) e chutar de volta pro login.
  handleLogin: () => Promise<void>
  handleLogout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
