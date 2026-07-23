import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import Spinner from '@/components/ui/spinner';
import { useConfirmarEmail } from '@/hooks/login.hooks';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { isSuccess, isError, isLoading } = useConfirmarEmail(token);

  useEffect(() => {
    if (isSuccess) {
      toast.success('E-mail confirmado! Faça seu login.');
      navigate('/login', { replace: true });
    }
  }, [isSuccess, navigate]);

  if (token && isLoading) {
    return (
      <AuthLayout>
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="h-1.5 bg-brand-gradient" />
          <div className="p-6 flex justify-center">
            <Spinner />
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (token && isError) {
    return (
      <AuthLayout>
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="h-1.5 bg-brand-gradient" />
          <div className="p-6 border border-t-0 border-primary/20 rounded-b-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <XCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Link inválido ou expirado</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Esse link de confirmação de e-mail não é mais válido.
            </p>
            <Link
              to="/login"
              className="block w-full text-center py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Ir para o login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Sem token na URL: tela estática mostrada logo após o cadastro, pedindo
  // pra checar a caixa de entrada (ver LoginPage.tsx).
  return (
    <AuthLayout>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="h-1.5 bg-brand-gradient" />

        <div className="p-6 border border-t-0 border-primary/20 rounded-b-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              📬
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Confirme seu e-mail
            </h2>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Enviamos um e-mail de confirmação para você.
            <br />
            Acesse sua caixa de entrada e clique no link para ativar sua conta.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
