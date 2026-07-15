import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  senha: z.string().min(1, 'Informe sua senha'),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nome: z.string().min(1, 'Informe seu nome'),
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
    senha: z.string().min(1, 'Informe uma senha'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

export type RegisterForm = z.infer<typeof registerSchema>;

// BRK-312: pré-registro de loja — mesma forma do cadastro de jogador, mas
// vira uma Loja PENDENTE de aprovação do administrador (ver POST /lojas/).
export const registerLojaSchema = z
  .object({
    nome: z.string().min(1, 'Informe o nome da loja'),
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
    senha: z.string().min(1, 'Informe uma senha'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

export type RegisterLojaForm = z.infer<typeof registerLojaSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    novaSenha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmarNovaSenha: z.string().min(1, 'Confirme sua nova senha'),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarNovaSenha'],
  });

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
