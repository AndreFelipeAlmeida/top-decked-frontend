import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ComposicaoPontoPublico, MetaEventoPublico, ParticipanteEventoPublico } from '@/types/Evento';

type ParticipanteCartelaProps = {
  participante: ParticipanteEventoPublico;
  metas: MetaEventoPublico[];
  onAdicionarPontos?: () => void;
};

// Acha o motivo que "preencheu" o carimbo número `n` da trilha: cada pedaço
// de `composicao_pontos` cobre um intervalo cumulativo de pontos, na mesma
// ordem em que o backend os retorna (automáticos por torneio, depois
// manuais — ver EventoService.retornar_participante_completo).
function motivoDoPonto(n: number, composicaoPontos: ComposicaoPontoPublico[]): string | undefined {
  let acumulado = 0;
  for (const pedaco of composicaoPontos) {
    acumulado += pedaco.pontos;
    if (n <= acumulado) return pedaco.motivo;
  }
  return undefined;
}

// Trilha de pontos estilo "cartela de carimbos" (pedido explícito, baseado
// numa cartela física de Play! Pokémon): uma caixa por ponto até a maior
// meta cadastrada, preenchida conforme a pontuação atual do participante.
// Nas caixas que correspondem a uma meta, um balão aparece em cima com a
// imagem da recompensa (ou o texto da descrição, se não houver imagem
// cadastrada — pedido explícito).
function TrilhaDePontos({ participante, metas }: { participante: ParticipanteEventoPublico; metas: MetaEventoPublico[] }) {
  if (metas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma meta cadastrada ainda — <span className="font-bold text-primary">{participante.pontos_total} pontos</span> acumulados.
      </p>
    );
  }

  const maxPontos = Math.max(...metas.map((m) => m.pontos_necessarios));
  const metaPorPonto = new Map(metas.map((m) => [m.pontos_necessarios, m]));
  const caixas = Array.from({ length: maxPontos }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-end gap-1 pt-10 w-max">
        {caixas.map((n) => {
          const meta = metaPorPonto.get(n);
          const preenchida = participante.pontos_total >= n;
          const motivo = preenchida ? motivoDoPonto(n, participante.composicao_pontos) : undefined;

          const caixa = (
            <div
              title={motivo ? undefined : meta ? `${n} pts — ${meta.recompensa_descricao || 'Recompensa'}` : `${n} pts`}
              className={`w-5 h-7 md:w-6 md:h-8 rounded border-2 transition-colors ${
                preenchida
                  ? 'bg-primary border-primary'
                  : meta
                    ? 'bg-card border-primary/50 border-dashed'
                    : 'bg-muted border-border'
              }`}
            />
          );

          return (
            <div key={n} className="relative flex flex-col items-center shrink-0">
              {meta && (
                <div className="absolute -top-9 flex flex-col items-center z-10">
                  <div className="rounded-lg border-2 border-primary bg-card shadow-md px-1.5 py-1 min-w-[2rem] max-w-[6rem] flex items-center justify-center">
                    {meta.recompensa_imagem_url ? (
                      <img
                        src={meta.recompensa_imagem_url}
                        alt={meta.recompensa_descricao ?? `Recompensa em ${meta.pontos_necessarios} pontos`}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="text-[9px] leading-tight text-center font-medium text-foreground whitespace-normal">
                        {meta.recompensa_descricao || `${meta.pontos_necessarios} pts`}
                      </span>
                    )}
                  </div>
                  <div className="w-2.5 h-2.5 bg-card border-r-2 border-b-2 border-primary rotate-45 -mt-[7px]" />
                </div>
              )}
              {motivo ? (
                <Tooltip>
                  <TooltipTrigger asChild>{caixa}</TooltipTrigger>
                  <TooltipContent>{`${n} pts — ${motivo}`}</TooltipContent>
                </Tooltip>
              ) : (
                caixa
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ParticipanteCartela({ participante, metas, onAdicionarPontos }: ParticipanteCartelaProps) {
  const inicial = (participante.apelido || participante.game_id || '?').charAt(0).toUpperCase();
  return (
    <div className="bg-card rounded-xl shadow p-4 md:p-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-lg font-bold text-white shrink-0 overflow-hidden">
          {participante.foto ? (
            <img
              src={`/uploads/${participante.foto}`}
              alt={participante.apelido || participante.game_id || 'Foto de perfil'}
              className="w-full h-full object-cover"
            />
          ) : (
            inicial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground truncate">
            {participante.apelido || participante.game_id || `Jogador #${participante.jogador_criado_id}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {participante.pontos_total} pontos totais
            {participante.pontos_manuais !== 0 && (
              <span> ({participante.pontos_automaticos} automáticos + {participante.pontos_manuais} manuais)</span>
            )}
          </p>
        </div>
        {onAdicionarPontos && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            title="Adicionar pontos por Outros Motivos"
            onClick={onAdicionarPontos}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      <TrilhaDePontos participante={participante} metas={metas} />
    </div>
  );
}
