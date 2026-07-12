import { useEffect } from 'react';
import { LayoutDashboard, Trophy, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useViewMode } from '@/hooks/viewModeContext.hooks';
import { useAchievementHistory } from '@/hooks/achievements.hooks';
import { OrganizerViewSwitch } from './OrganizerViewSwitch';
import { DashboardActionButton } from '@/components/ui/dashboard-action-button';
import { ImportTournamentButton } from '@/components/organizer/ImportTournamentButton';
import Spinner from '@/components/ui/spinner';

const ULTIMA_VISITA_CONQUISTAS_KEY = 'ultima_visita_conquistas';

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const user = useAuthenticatedUser();
  const { data: jogador, isLoading } = useMe(true);
  const { viewMode } = useViewMode();
  const { data: historico } = useAchievementHistory();

  const lojasOrganizador = jogador?.lojas?.filter((loja) => loja.organizacoes.length > 0) ?? [];
  const isOrganizer = lojasOrganizador.length > 0;

  useEffect(() => {
    if (!historico || historico.length === 0) return;

    const ultimaVisitaStr = localStorage.getItem(ULTIMA_VISITA_CONQUISTAS_KEY);
    const ultimaVisita = ultimaVisitaStr ? new Date(ultimaVisitaStr) : null;

    const novasConquistas = ultimaVisita
      ? historico.filter((item) => new Date(item.conquistado_em) > ultimaVisita)
      : [];

    for (const item of novasConquistas) {
      toast.success(`🏆 ${item.conquista_nome} chegou ao nível ${item.nome_nivel}!`);
    }

    localStorage.setItem(ULTIMA_VISITA_CONQUISTAS_KEY, new Date().toISOString());
  }, [historico]);

  if (isLoading) return <Spinner />;

  const conquistasRecentes = historico?.slice(0, 3) ?? [];

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-foreground font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, {user.nome}!</p>
        </div>

        <OrganizerViewSwitch visible={isOrganizer} />
      </div>

      {viewMode === 'organizador' && isOrganizer && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardActionButton to="/jogador/criar-torneio" icon={Plus} label="Criar Torneio" variant="primary" />
          <ImportTournamentButton
            isJogadorOrganizador
            lojas={lojasOrganizador}
            onImported={(torneioId) => navigate(`/loja/torneio/${torneioId}/editar`)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
          <LayoutDashboard className="w-10 h-10 mb-3 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">Em breve</p>
          <p className="text-sm">
            Aqui vão aparecer seus próximos torneios, estatísticas e histórico de partidas.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Conquistas Recentes
            </h3>
          </div>

          {conquistasRecentes.length > 0 ? (
            <div className="space-y-3 mb-4">
              {conquistasRecentes.map((item) => (
                <div key={`${item.conquista_codigo}-${item.nivel}`} className="flex items-center gap-3 text-sm">
                  <span className="text-xl">{item.conquista_icone}</span>
                  <div className="min-w-0">
                    <p className="text-foreground font-medium truncate">
                      {item.conquista_nome} — {item.nome_nivel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.conquistado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">Nenhuma conquista desbloqueada ainda.</p>
          )}

          <Link to="/jogador/conquistas" className="text-sm font-medium text-primary hover:text-primary">
            Ver todas as conquistas →
          </Link>
        </div>
      </div>
    </div>
  );
}
