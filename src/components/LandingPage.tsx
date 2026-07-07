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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl text-foreground">Brickei</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleNavigate('jogador')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Jogador
            </button>
            <button 
              onClick={() => handleNavigate('loja')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Loja
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 text-foreground">
            Eleve o nível da sua loja de card games
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A plataforma amiga que empodera os organizadores de torneios e alegra os jogadores.
            Faça torneios profissionais de TCG com pareamento automático, rankings ao vivo e gerenciamento integrado de créditos.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => handleNavigate('loja')}
              className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors text-lg flex items-center space-x-2"
            >
              <span>Comece</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary/10 transition-colors text-lg">
              Assista a Demo
            </button>
          </div>
        </div>

        {/* Screenshot Placeholder */}
        <div className="mt-16 bg-card rounded-xl shadow-2xl p-4">
          <div className="aspect-video bg-gradient-to-br from-primary/15 to-info/15 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Dashboard de Torneios</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition - For Stores */}
      <section className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl mb-4 text-foreground">Para Lojas</h3>
            <p className="text-xl text-muted-foreground">Tudo que você precisa para gerenciar torneios profissionalmente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl mb-2 text-foreground">Pareamento automático</h4>
              <p className="text-muted-foreground">
                Emparceiramentos suíços instantâneos, gerenciamento de chaves e atualizações em tempo real da classificação. Nada de controle manual.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl mb-2 text-foreground">Gerenciamento de Estoque</h4>
              <p className="text-muted-foreground">
                Controle produtos selados, singles e itens de conveniência em um só lugar. Alertas de estoque baixo ajudam a manter tudo abastecido.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl mb-2 text-foreground">Créditos para Jogadores & PDV</h4>
              <p className="text-muted-foreground">
                Ofereça créditos da loja como premiação, gerencie pagamentos híbridos e aumente a fidelização dos clientes com facilidade.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl mb-2 text-foreground">Rankings Profissionais</h4>
              <p className="text-muted-foreground">
                Exiba rankings ao vivo, resultados de torneios e estatísticas de jogadores para construir comunidades competitivas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition - For Players */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl mb-4 text-foreground">Para Jogadores</h3>
            <p className="text-xl text-muted-foreground">Acompanhe sua jornada, controle seus créditos, jogue com o seu melhor</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-xl mb-2 text-foreground">Acompanhamento de estatísticas gerais</h4>
              <p className="text-muted-foreground">
                Acompanhe sua performace através de todos os torneios e lojas. Observer win rates, histórico de partidas e rankings.
              </p>
            </div>
              <div className="bg-card p-6 rounded-lg shadow-lg">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-xl mb-2 text-foreground">Carteira Multi-Loja</h4>
              <p className="text-muted-foreground">
                  Gerencie créditos de lojas em todas as suas lojas de jogos favoritas.
                  Veja saldos e histórico de transações instantaneamente.
              </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-lg">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-xl mb-2 text-foreground">Resultados Instantâneos</h4>
              <p className="text-muted-foreground">
                  Receba em tempo real os emparceiramentos, resultados das partidas
                  e classificações do torneio. Nada de ficar esperando.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-brand-gradient py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Organizers Card */}
            <div 
              onClick={() => handleNavigate('loja')}
              className="bg-card rounded-xl p-8 cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/15 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl text-foreground">Para Lojas</h4>
              </div>
                <p className="text-muted-foreground mb-6">
                Comece a organizar torneios profissionais com emparceiramentos automáticos,
                gerenciamento de inventário e sistemas de crédito integrados. Transforme hoje
                a experiência de torneios da sua loja.
                </p>

                <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2 text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Teste grátis por 30 dias — sem necessidade de cartão de crédito</span>
                </li>
                <li className="flex items-start space-x-2 text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Torneios e jogadores ilimitados</span>
                </li>
                <li className="flex items-start space-x-2 text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Integração completa com inventário e PDV (POS)</span>
                </li>
                </ul>
              <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2">
                <span>Cadastre a sua loja</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* For Players Card */}
            <div 
              onClick={() => handleNavigate('jogador')}
              className="bg-card rounded-xl p-8 cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-info/15 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-info" />
                </div>
                <h4 className="text-2xl text-foreground">Para Jogadores</h4>
              </div>
                <p className="text-muted-foreground mb-6">
                Acompanhe suas estatísticas em todos os torneios e lojas. Gerencie seus
                créditos de premiação, visualize o histórico de partidas e mantenha-se
                conectado à sua cena competitiva local.
                </p>

                <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2 text-muted-foreground">
                    <span className="text-info mt-1">✓</span>
                    <span>Grátis para sempre — sem assinaturas</span>
                </li>
                <li className="flex items-start space-x-2 text-muted-foreground">
                    <span className="text-info mt-1">✓</span>
                    <span>Acompanhe estatísticas em várias lojas</span>
                </li>
                <li className="flex items-start space-x-2 text-muted-foreground">
                    <span className="text-info mt-1">✓</span>
                    <span>Gerencie créditos de premiação e carteiras</span>
                </li>
                </ul>
              <button className="w-full bg-info text-white py-3 rounded-lg hover:bg-info/90 transition-colors flex items-center justify-center space-x-2">
                <span>Login</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6" />
                <span className="text-xl">Brickei</span>
              </div>
              <p className="text-muted-foreground text-sm">
                A plataforma perfeita para o gerenciamento de torneios TCG.
              </p>
            </div>
            <div>
              <h5 className="text-lg mb-3">Produto</h5>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-white">Funções</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Demos</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg mb-3">Suporte</h5>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Centro de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contate-nos</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg mb-3">Legal</h5>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos de Serviço</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            © 2026 Brickei. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;