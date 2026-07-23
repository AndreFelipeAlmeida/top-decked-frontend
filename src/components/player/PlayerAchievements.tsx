import { RefreshCw, Trophy, Lock } from 'lucide-react';
import { useMyAchievements, useAchievementHistory, useRecalculateAchievements } from '@/hooks/achievements.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { AppCard } from '@/components/ui/app-card';
import Spinner from '@/components/ui/spinner';
import { AchievementCard } from '@/components/player/AchievementCard';
import type { JogadorConquista } from '@/types/Achievement';

const CATEGORIA_LABEL: Record<string, string> = {
  HORAS_JOGADAS: 'Horas Jogadas',
  TORNEIOS_JOGADOS: 'Torneios Jogados',
  VITORIAS: 'Vitórias',
  DECKS_JOGADOS: 'Decks Jogados',
  SEQUENCIA_VITORIAS: 'Sequência de Vitórias',
  PODIOS: 'Pódios',
};

export default function PlayerAchievements() {
  const { data: conquistas, isLoading } = useMyAchievements();
  const { data: historico, isLoading: isHistoryLoading } = useAchievementHistory();
  const recalcular = useRecalculateAchievements();
  const { selectedTcg } = useTcgSelection();

  const conquistasDoTcg = (conquistas ?? []).filter((jc) => jc.conquista.tcg === selectedTcg);
  const historicoDoTcg = (historico ?? []).filter((item) => item.conquista_tcg === selectedTcg);

  const conquistasPorCategoria = conquistasDoTcg.reduce<Record<string, JogadorConquista[]>>((acc, jc) => {
    const categoria = jc.conquista.categoria;
    acc[categoria] = acc[categoria] ?? [];
    acc[categoria].push(jc);
    return acc;
  }, {});

  if (isLoading) return <Spinner />;

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-foreground font-bold">Conquistas</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e o que você já desbloqueou</p>
        </div>

        <button
          onClick={() => recalcular.mutate()}
          disabled={recalcular.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${recalcular.isPending ? 'animate-spin' : ''}`} />
          <span>{recalcular.isPending ? 'Atualizando...' : 'Atualizar Conquistas'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(conquistasPorCategoria).map(([categoria, itens]) => (
            <AppCard
              key={categoria}
              title={CATEGORIA_LABEL[categoria] ?? categoria}
              icon={<Trophy className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {itens.map((jc) => (
                  <AchievementCard key={jc.conquista.id} jogadorConquista={jc} />
                ))}
              </div>
            </AppCard>
          ))}

          {Object.keys(conquistasPorCategoria).length === 0 && (
            <div className="bg-card rounded-lg shadow p-10 text-center text-muted-foreground">
              Nenhuma conquista disponível ainda.
            </div>
          )}
        </div>

        <AppCard title="Histórico" icon={<Lock className="w-5 h-5" />}>
          {isHistoryLoading ? (
            <Spinner />
          ) : historicoDoTcg.length > 0 ? (
            <div className="space-y-3 max-h-[32rem] overflow-y-auto">
              {historicoDoTcg.map((item) => (
                <div key={`${item.conquista_codigo}-${item.nivel}`} className="flex items-center gap-3 text-sm">
                  <span className="text-xl">{item.conquista_icone}</span>
                  <div className="min-w-0 flex-1">
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
            <p className="text-sm text-muted-foreground">Nenhuma conquista desbloqueada ainda.</p>
          )}
        </AppCard>
      </div>
    </div>
  );
}
