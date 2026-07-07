import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/components/AuthLayout';
import Spinner from '@/components/ui/spinner';
import { useValidarTokenRedefinicao, useRedefinirSenha } from '@/hooks/login.hooks';
import { resetPasswordSchema, type ResetPasswordForm } from '@/schemas/login.schemas';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data, isLoading, isError } = useValidarTokenRedefinicao(token);
  const { mutate, isPending, isSuccess } = useRedefinirSenha();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = handleSubmit((formData) => {
    if (!token) return;
    mutate({ token, novaSenha: formData.novaSenha });
  });

  const linkInvalido = !token || isError || (data && !data.valido);

  return (
    <AuthLayout>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="h-1.5 bg-brand-gradient" />

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : isSuccess ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Senha redefinida!</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Sua senha foi alterada com sucesso. Já pode fazer login com a nova senha.
              </p>
              <Link
                to="/login"
                className="block w-full text-center py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Ir para o login
              </Link>
            </div>
          ) : linkInvalido ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <XCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Link inválido ou expirado</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Esse link de redefinição de senha não é mais válido. Solicite um novo para
                continuar.
              </p>
              <Link
                to="/esqueci-senha"
                className="block w-full text-center py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-1">Digite sua nova senha</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha uma nova senha para a sua conta.
              </p>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('novaSenha')}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.novaSenha && (
                  <p className="text-destructive text-xs mt-1">{errors.novaSenha.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Confirme sua Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmarNovaSenha')}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua nova senha novamente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmarNovaSenha && (
                  <p className="text-destructive text-xs mt-1">{errors.confirmarNovaSenha.message}</p>
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
                <span>{isPending ? 'Salvando...' : 'Confirmar'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
