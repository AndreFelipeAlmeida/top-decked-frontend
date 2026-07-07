// Sessão leve (GET /login/profile) usada pelo AuthProvider para saber quem está logado e seu papel (jogador/loja).
export const sessionKeys = {
  all: ["session"],
};

// Perfil completo de jogador (GET /jogadores/me), usado onde se precisa de dados ricos (tcgs, lojas vinculadas).
export const authKeys = {
  all: ["me"],
};