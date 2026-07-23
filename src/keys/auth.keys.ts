// Sessão leve (GET /login/profile) usada pelo AuthProvider para saber quem está logado e seu papel (jogador/loja).
export const sessionKeys = {
  all: ["session"],
};

// Perfil completo de jogador (GET /jogadores/me), usado onde se precisa de dados ricos (tcgs, lojas vinculadas).
export const authKeys = {
  all: ["me"],
};

// Validação do token de "esqueci minha senha" (GET /login/validar-token-redefinicao).
export const resetPasswordKeys = {
  all: ["reset-password"],
  validarToken: (token: string | null) => [...resetPasswordKeys.all, "validar-token", token],
};

// Confirmação de e-mail via token da URL (GET /login/confirmar-email).
export const confirmEmailKeys = {
  all: ["confirm-email"],
  confirmar: (token: string | null) => [...confirmEmailKeys.all, "confirmar", token],
};