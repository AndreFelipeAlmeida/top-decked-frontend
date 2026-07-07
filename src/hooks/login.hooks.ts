import { login, register } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";

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
