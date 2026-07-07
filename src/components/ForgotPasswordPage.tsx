import { Mail, MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/components/AuthLayout';
import { useEsqueciSenha } from '@/hooks/login.hooks';
import { forgotPasswordSchema, type ForgotPasswordForm } from '@/schemas/login.schemas';

export default function ForgotPasswordPage() {
  const { mutate, isPending, isSuccess } = useEsqueciSenha();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit((data) => {
    mutate(data.email);
  });

  return (
    <AuthLayout>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="h-1.5 bg-brand-gradient" />

        <div className="p-6">
          {isSuccess ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <MailCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Verifique seu e-mail</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Se esse e-mail estiver cadastrado na Brickei, você vai receber um link para
                redefinir sua senha. O link é válido por 1 hora.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Esqueceu sua senha?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Digite o e-mail da sua conta e enviaremos um link para redefinir sua senha.
                </p>

                <label className="block text-sm mb-2 text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite seu e-mail"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isPending && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isPending ? 'Enviando...' : 'Enviar link de redefinição'}</span>
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:text-primary">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
