import type { ReactNode } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  children: ReactNode;
};

// Shell compartilhado por todas as telas públicas de autenticação (login,
// cadastro, confirmar e-mail, esqueci/redefinir senha) — extraído pra não
// duplicar o cabeçalho (logo + wordmark) em cada uma conforme a família
// cresceu de 2 pra 4 páginas.
export default function AuthLayout({ children }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center space-x-2 text-primary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Início</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient shadow-lg shadow-primary/20 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-primary">Brickei</h1>
          <p className="text-muted-foreground">A plataforma amiga de gerenciamento de torneios.</p>
        </div>

        {children}
      </div>
    </div>
  );
}
