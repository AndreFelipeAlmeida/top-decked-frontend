import { ArrowRight, Trophy, Users, DollarSign, BarChart3, Zap, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type UserRole } from '@/types/User';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (userType: UserRole) => {
    navigate("/login", {
      state: { userType },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl text-gray-900">TopDecked</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleNavigate('jogador')}
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Jogador
            </button>
            <button 
              onClick={() => handleNavigate('loja')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Loja
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-2xl mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 text-gray-900">
            Eleve o nível da sua loja de card games
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A plataforma amiga que empodera os organizadores de torneios e alegra os jogadores.
            Faça torneios profissionais de TCG com pareamento automático, rankings ao vivo e gerenciamento integrado de créditos.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => handleNavigate('loja')}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors text-lg flex items-center space-x-2"
            >
              <span>Comece</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg hover:bg-purple-50 transition-colors text-lg">
              Assista a Demo
            </button>
          </div>
        </div>

        {/* Screenshot Placeholder */}
        <div className="mt-16 bg-white rounded-xl shadow-2xl p-4">
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Dashboard de Torneios</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition - For Stores */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl mb-4 text-gray-900">Para Lojas</h3>
            <p className="text-xl text-gray-600">Tudo que você precisa para gerenciar torneios profissionalmente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl mb-2 text-gray-900">Pareamento automático</h4>
              <p className="text-gray-600">
                Emparceiramentos suíços instantâneos, gerenciamento de chaves e atualizações em tempo real da classificação. Nada de controle manual.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl mb-2 text-gray-900">Gerenciamento de Estoque</h4>
              <p className="text-gray-600">
                Controle produtos selados, singles e itens de conveniência em um só lugar. Alertas de estoque baixo ajudam a manter tudo abastecido.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl mb-2 text-gray-900">Créditos para Jogadores & PDV</h4>
              <p className="text-gray-600">
                Ofereça créditos da loja como premiação, gerencie pagamentos híbridos e aumente a fidelização dos clientes com facilidade.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl mb-2 text-gray-900">Rankings Profissionais</h4>
              <p className="text-gray-600">
                Exiba rankings ao vivo, resultados de torneios e estatísticas de jogadores para construir comunidades competitivas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition - For Players */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl mb-4 text-gray-900">Para Jogadores</h3>
            <p className="text-xl text-gray-600">Acompanhe sua jornada, controle seus créditos, jogue com o seu melhor</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="text-xl mb-2 text-gray-900">Acompanhamento de estatísticas gerais</h4>
              <p className="text-gray-600">
                Acompanhe sua performace através de todos os torneios e lojas. Observer win rates, histórico de partidas e rankings.
              </p>
            </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
              <Shield className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="text-xl mb-2 text-gray-900">Carteira Multi-Loja</h4>
              <p className="text-gray-600">
                  Gerencie créditos de lojas em todas as suas lojas de jogos favoritas.
                  Veja saldos e histórico de transações instantaneamente.
              </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
              <Users className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="text-xl mb-2 text-gray-900">Resultados Instantâneos</h4>
              <p className="text-gray-600">
                  Receba em tempo real os emparceiramentos, resultados das partidas
                  e classificações do torneio. Nada de ficar esperando.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Organizers Card */}
            <div 
              onClick={() => handleNavigate('loja')}
              className="bg-white rounded-xl p-8 cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="text-2xl text-gray-900">Para Lojas</h4>
              </div>
                <p className="text-gray-600 mb-6">
                Comece a organizar torneios profissionais com emparceiramentos automáticos,
                gerenciamento de inventário e sistemas de crédito integrados. Transforme hoje
                a experiência de torneios da sua loja.
                </p>

                <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2 text-gray-700">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>Teste grátis por 30 dias — sem necessidade de cartão de crédito</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>Torneios e jogadores ilimitados</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>Integração completa com inventário e PDV (POS)</span>
                </li>
                </ul>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                <span>Cadastre a sua loja</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* For Players Card */}
            <div 
              onClick={() => handleNavigate('jogador')}
              className="bg-white rounded-xl p-8 cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
                <h4 className="text-2xl text-gray-900">Para Jogadores</h4>
              </div>
                <p className="text-gray-600 mb-6">
                Acompanhe suas estatísticas em todos os torneios e lojas. Gerencie seus
                créditos de premiação, visualize o histórico de partidas e mantenha-se
                conectado à sua cena competitiva local.
                </p>

                <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2 text-gray-700">
                    <span className="text-pink-600 mt-1">✓</span>
                    <span>Grátis para sempre — sem assinaturas</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                    <span className="text-pink-600 mt-1">✓</span>
                    <span>Acompanhe estatísticas em várias lojas</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                    <span className="text-pink-600 mt-1">✓</span>
                    <span>Gerencie créditos de premiação e carteiras</span>
                </li>
                </ul>
              <button className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2">
                <span>Login</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6" />
                <span className="text-xl">TopDecked</span>
              </div>
              <p className="text-gray-400 text-sm">
                A plataforma perfeita para o gerenciamento de torneios TCG.
              </p>
            </div>
            <div>
              <h5 className="text-lg mb-3">Produto</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Funções</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Demos</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg mb-3">Suporte</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Centro de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contate-nos</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg mb-3">Legal</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos de Serviço</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2026 TopDecked. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;