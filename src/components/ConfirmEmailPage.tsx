import AuthLayout from '@/components/AuthLayout';

export default function ConfirmEmailPage() {
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
