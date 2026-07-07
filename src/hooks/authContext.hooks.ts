import { useContext } from "react"
import { AuthContext } from "@/contexts/AuthContext"

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  };

  return context;
}

export function useAuthenticatedUser() {
  const context = useAuthContext()

  if (!context.user) {
    throw new Error(
      'useAuthenticatedUser deve ser usado em rotas autenticadas'
    )
  }

  return context.user
}