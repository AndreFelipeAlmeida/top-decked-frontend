import { Award } from 'lucide-react';
import type { PontuacaoExtraPublico } from '@/types/PontuacaoExtra';
import { nomeDoMotivo } from '@/schemas/pontuacaoExtra.schemas';

type PontuacaoExtraHistoricoProps = {
  itens: PontuacaoExtraPublico[] | undefined;
  isLoading?: boolean;
  // A tela de um torneio específico já sabe qual é o torneio — só a tela
  // agregada da loja (várias torneios ao mesmo tempo) precisa mostrar de
  // qual torneio cada linha do histórico veio.
  mostrarTorneio?: boolean;
};

export function PontuacaoExtraHistorico({ itens, isLoading, mostrarTorneio }: PontuacaoExtraHistoricoProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Carregando histórico...</p>;
  }

  if (!itens?.length) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 py-8">
        <Award className="w-6 h-6" />
        <span className="text-sm">Nenhuma pontuação extra registrada ainda.</span>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {itens.map((item) => (
        <div key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {item.apelido || item.game_id || `Jogador #${item.jogador_criado_id}`}
              <span className="ml-2 text-xs font-bold text-primary">{nomeDoMotivo(item.motivo)}</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {mostrarTorneio && item.torneio_nome ? `${item.torneio_nome} · ` : ''}
              {item.descricao || 'Sem descrição'}
              {' · '}
              {new Date(item.criado_em).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <span
            className={`text-sm font-bold shrink-0 ${item.pontos >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {item.pontos >= 0 ? '+' : ''}{item.pontos} pts
          </span>
        </div>
      ))}
    </div>
  );
}
