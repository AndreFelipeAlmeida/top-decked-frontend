import { login, register, esqueciSenha, validarTokenRedefinicao, redefinirSenha } from "@/services/auth.service";
import { resetPasswordKeys } from "@/keys/auth.keys";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};

export const useEsqueciSenha = () => {
  return useMutation({
    mutationFn: esqueciSenha,
  });
};

// Validado assim que a página de redefinir senha carrega, pra decidir entre
// mostrar o formulário de nova senha ou um estado de "link inválido/expirado"
// — não faz sentido deixar o usuário preencher os campos pra só então
// descobrir, no submit, que o link já não vale mais.
export const useValidarTokenRedefinicao = (token: string | null) => {
  return useQuery({
    queryKey: resetPasswordKeys.validarToken(token),
    queryFn: () => validarTokenRedefinicao(token!),
    enabled: !!token,
    retry: false,
  });
};

export const useRedefinirSenha = () => {
  return useMutation({
    mutationFn: ({ token, novaSenha }: { token: string; novaSenha: string }) =>
      redefinirSenha(token, novaSenha),
  });
};
