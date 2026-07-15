import { AuthContext } from "./AuthContext"
import { useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/hooks/auth.hooks"
import { logout as logoutRequest } from "@/services/auth.service"
import { sessionKeys } from "@/keys/auth.keys"

type AuthProviderProps = {
  children: React.ReactNode
}

// BRK-309: sessão vive num cookie HttpOnly transversal (o browser manda
// sozinho em toda requisição, inclusive entre subdomínios) — não existe
// mais token pra guardar em estado/localStorage nem pra injetar
// manualmente no header Authorization (ver src/adapters/api.ts,
// withCredentials cuida disso). GET /login/profile roda sempre, pra
// visitante logado ou não: um 401 lá (ver interceptor de resposta em
// api.ts) só significa "ainda não logou", o estado normal de quem acabou
// de abrir o site.
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useSession(true)

  const isAuthenticated = !isError && !!user

  const handleLogin = () => {
    // O Set-Cookie da resposta de /login/token já deixou o browser
    // autenticado — só falta buscar quem é esse usuário agora.
    // BRK-314: invalidateQueries retorna uma Promise que só resolve quando
    // o refetch termina — devolvida pra quem chama poder aguardar antes de
    // navegar (ver LoginPage), fechando a janela em que ProtectedRoute via
    // isAuthenticated ainda da sessão anterior (deslogada) e mandava de
    // volta pro login antes da nova sessão chegar.
    return queryClient.invalidateQueries({ queryKey: sessionKeys.all })
  }

  const handleLogout = async () => {
    // Precisa do request: o cookie é HttpOnly, JS não consegue apagá-lo
    // sozinho (ver auth.service.logout).
    await logoutRequest()
    queryClient.clear()

    // BRK-313: redirecionamento imperativo — sem isso o app ficava parado
    // na mesma tela protegida após o logout (nada aqui força o React
    // Router a reavaliar a rota). window.location.href (não navigate) de
    // propósito: garante um reload completo, descartando qualquer estado
    // em memória de contexts que não dependem de query cache (ex.:
    // TcgSelectionProvider, ViewModeProvider) e que sobreviveriam a um
    // queryClient.clear() sozinho.
    window.location.href = '/login'
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
