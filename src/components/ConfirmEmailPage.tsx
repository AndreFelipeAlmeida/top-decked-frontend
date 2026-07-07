import { ArrowLeft, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();

  const handleBack = () => navigate("/")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center space-x-2 text-primary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Início</span>
          </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2 text-foreground">Brickei</h1>
          <p className="text-muted-foreground">A plataforma amiga de gerenciamento de torneios.</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden p-6 border border-primary/20">
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
    </div>
  );
}