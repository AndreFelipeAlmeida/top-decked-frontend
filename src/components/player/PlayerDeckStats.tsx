import { Layers } from 'lucide-react';
import { pokemonSpriteUrl } from '@/lib/pokemon';
import type { DeckDoJogador } from '@/selectors/tournaments.selectors';

const QUANTIDADE_DECKS_EXIBIDOS = 3;

type PlayerDeckStatsProps = {
  decks: DeckDoJogador[];
};

export function PlayerDeckStats({ decks }: PlayerDeckStatsProps) {
  const topDecks = decks
    .slice()
    .sort((a, b) => b.vezesJogado - a.vezesJogado || b.vitorias - a.vitorias)
    .slice(0, QUANTIDADE_DECKS_EXIBIDOS);

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-primary" />
        Meus Decks Mais Jogados
      </h3>

      {topDecks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Você ainda não tem decks registrados neste jogo.
        </p>
      ) : (
        <div className="space-y-3">
          {topDecks.map((deck) => (
            <div
              key={deck.chave}
              className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                {deck.unidadesExibicao.length > 0 && (
                  <div className="flex items-center -space-x-3 shrink-0">
                    {deck.unidadesExibicao.map((unidade) => (
                      <img
                        key={unidade.id}
                        src={pokemonSpriteUrl(unidade.external_id)}
                        alt={unidade.nome}
                        title={unidade.nome}
                        className="w-10 h-10 rounded-full bg-muted object-contain border-2 border-border"
                      />
                    ))}
                  </div>
                )}
                <p className="text-sm font-medium text-foreground truncate">{deck.nome}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Usado {deck.vezesJogado}x</p>
                <p className="text-sm font-medium">
                  <span className="text-success">{deck.vitorias}</span>
                  {' / '}
                  <span className="text-destructive">{deck.derrotas}</span>
                  {' / '}
                  <span className="text-muted-foreground">{deck.empates}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
