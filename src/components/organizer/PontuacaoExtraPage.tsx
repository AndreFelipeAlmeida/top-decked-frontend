import { useState } from 'react';
import { Award } from 'lucide-react';
import { AppCard } from '@/components/ui/app-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useTournaments } from '@/hooks/tournaments.hooks';
import { useHistoricoPontuacaoExtra } from '@/hooks/pontuacaoExtra.hooks';
import { PontuacaoExtraForm } from './PontuacaoExtraForm';
import { PontuacaoExtraHistorico } from './PontuacaoExtraHistorico';
import { nomeDoJogo } from '@/lib/tcgGames';
import { dataExibicaoTorneio } from '@/lib/dateUtils';

export default function PontuacaoExtraPage() {
  const user = useAuthenticatedUser();
  const { selectedTcg } = useTcgSelection();
  const [torneioId, setTorneioId] = useState('');

  const { data: torneios, isLoading: isTournamentsLoading } = useTournaments(user.tipo);
  const torneiosDoJogo = (torneios ?? []).filter((t) => t.jogo === selectedTcg);

  const { data: historico, isLoading: isLoadingHistorico } = useHistoricoPontuacaoExtra(selectedTcg);

  if (isTournamentsLoading) return <Spinner />;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground">Pontuação Extra — {nomeDoJogo(selectedTcg)}</h1>
        <p className="text-muted-foreground">
          Dê pontos extras a um jogador (trouxe um novato, atuou como juiz, etc.) em qualquer torneio deste jogo.
        </p>
      </div>

      <AppCard title="Registrar Pontuação Extra" icon={<Award className="w-5 h-5" />}>
        <div className="mb-4">
          <label className="block text-sm mb-1 text-muted-foreground">Torneio</label>
          <Select value={torneioId} onValueChange={setTorneioId}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Selecione um torneio" />
            </SelectTrigger>
            <SelectContent>
              {torneiosDoJogo.map((torneio) => (
                <SelectItem key={torneio.id} value={torneio.id}>
                  {torneio.nome || 'Torneio sem nome'} · {dataExibicaoTorneio(torneio)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!torneiosDoJogo.length && (
            <p className="text-xs text-muted-foreground mt-1">
              Nenhum torneio de {nomeDoJogo(selectedTcg)} cadastrado ainda.
            </p>
          )}
        </div>

        {torneioId ? (
          <PontuacaoExtraForm torneioId={torneioId} />
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Selecione um torneio acima pra registrar uma pontuação extra.
          </p>
        )}
      </AppCard>

      <div className="mt-6">
        <AppCard title="Histórico" icon={<Award className="w-5 h-5" />}>
          <PontuacaoExtraHistorico itens={historico} isLoading={isLoadingHistorico} mostrarTorneio />
        </AppCard>
      </div>
    </div>
  );
}
