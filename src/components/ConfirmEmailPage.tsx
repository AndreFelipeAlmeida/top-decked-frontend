import { ArrowLeft, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();

  const handleBack = () => navigate("/")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Início</span>
          </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2 text-gray-900">TopDecked</h1>
          <p className="text-gray-600">A plataforma amiga de gerenciamento de torneios.</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              📬
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Confirme seu e-mail
            </h2>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">
            Enviamos um e-mail de confirmação para você.
            <br />
            Acesse sua caixa de entrada e clique no link para ativar sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}