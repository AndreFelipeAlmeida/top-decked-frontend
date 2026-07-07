import { authKeys, sessionKeys } from "@/keys/auth.keys";
import { getMe } from "@/services/player.service";
import { getSession } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";

// Perfil completo do jogador logado (GET /jogadores/me) — usado onde se precisa de dados ricos (tcgs, lojas vinculadas, organizações).
export const useMe = (queryEnabled: boolean) => {
  return useQuery({
    enabled: queryEnabled,
    queryKey: authKeys.all,
    queryFn: getMe,
  });
}

// Sessão leve (GET /login/profile) — usada pelo AuthProvider para saber quem está logado e qual seu papel (jogador/loja).
export const useSession = (queryEnabled: boolean) => {
  return useQuery({
    enabled: queryEnabled,
    queryKey: sessionKeys.all,
    queryFn: getSession,
  });
}