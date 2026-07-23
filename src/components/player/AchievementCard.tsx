import type { ConquistaNivel, JogadorConquista } from '@/types/Achievement';
import { nomeDoJogo } from '@/lib/tcgGames';

const POKEBOLA_POR_NIVEL: Record<number, string> = {
  0: '/conquistas/vazio.svg',
  1: '/conquistas/nestball.svg',
  2: '/conquistas/pokeball.svg',
  3: '/conquistas/greatball.svg',
  4: '/conquistas/ultraball.svg',
  5: '/conquistas/masterball.svg',
};

// Qualquer variante da família Pokémon (TCG clássico, VGC, GO) ganha o
// card temático — cada uma tem o próprio catálogo de conquistas (ver
// ConquistaService, o seed roda "for tcg in TCG"), não só o TCG "POKEMON"
// literal.
const ehTemaPokemon = (tcg: string | null | undefined) => Boolean(tcg?.startsWith('POKEMON'));

type AchievementCardProps = {
  jogadorConquista: JogadorConquista;
};

export function AchievementCard({ jogadorConquista }: AchievementCardProps) {
  const { conquista, progresso_atual, nivel_atual } = jogadorConquista;
  const niveis = [...conquista.niveis].sort((a, b) => a.nivel - b.nivel);
  const nivelAtualDef = niveis.find((n) => n.nivel === nivel_atual);
  const proximoNivel = niveis.find((n) => n.nivel === nivel_atual + 1);

  const progressoPercentual = proximoNivel
    ? Math.min(100, (progresso_atual / proximoNivel.meta) * 100)
    : 100;

  if (ehTemaPokemon(conquista.tcg)) {
    return (
      <PokebolaAchievementCard
        jogadorConquista={jogadorConquista}
        nivelAtualDef={nivelAtualDef}
        proximoNivel={proximoNivel}
        progressoPercentual={progressoPercentual}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{conquista.icone}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{conquista.nome}</h3>
            {conquista.tcg && (
              <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-bold uppercase">
                {nomeDoJogo(conquista.tcg ?? undefined)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{conquista.descricao}</p>
        </div>
        <span
          className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold ${
            nivel_atual > 0 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          {nivelAtualDef ? nivelAtualDef.nome_nivel : 'Bloqueada'}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-2">
        {niveis.map((nivel) => (
          <div
            key={nivel.nivel}
            className={`h-1.5 flex-1 rounded-full ${
              nivel.nivel <= nivel_atual ? 'bg-primary' : 'bg-muted'
            }`}
            title={`${nivel.nome_nivel} — ${nivel.meta}`}
          />
        ))}
      </div>

      {proximoNivel ? (
        <div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressoPercentual}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progresso_atual} / {proximoNivel.meta} para {proximoNivel.nome_nivel}
          </p>
        </div>
      ) : (
        <p className="text-xs text-primary font-medium">Nível máximo alcançado 🎉</p>
      )}
    </div>
  );
}

type PokebolaAchievementCardProps = {
  jogadorConquista: JogadorConquista;
  nivelAtualDef: ConquistaNivel | undefined;
  proximoNivel: ConquistaNivel | undefined;
  progressoPercentual: number;
};

function PokebolaAchievementCard({
  jogadorConquista,
  nivelAtualDef,
  proximoNivel,
  progressoPercentual,
}: PokebolaAchievementCardProps) {
  const { conquista, progresso_atual, nivel_atual } = jogadorConquista;
  const imagemPokebola = POKEBOLA_POR_NIVEL[nivel_atual] ?? POKEBOLA_POR_NIVEL[0];
  return (
    <div
      className="relative w-full max-w-[250px] mx-auto aspect-square rounded-2xl overflow-hidden shadow-md bg-cover bg-center"
      style={{ backgroundImage: `url(${imagemPokebola})` }}
      title={`${conquista.nome} — ${nivelAtualDef ? nivelAtualDef.nome_nivel : 'Bloqueada'}`}
    >
      {/* Topo (faixa colorida da Pokébola): ícone + selo do TCG */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <span className="text-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{conquista.icone}</span>
        <span className="px-1.5 py-0.5 rounded bg-black/30 text-white text-[10px] font-bold uppercase drop-shadow">
          {nomeDoJogo(conquista.tcg ?? undefined)}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-2">
        <h3 className="text-center font-bold text-foreground text-sm line-clamp-2 mb-1">
          {conquista.nome}
        </h3>
        <p className="text-center text-xs font-bold text-foreground mb-1">
          {nivelAtualDef ? nivelAtualDef.nome_nivel : 'Bloqueada'}
        </p>

        {proximoNivel ? (
          <div>
            <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressoPercentual}%` }}
              />
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1">
              {progresso_atual} / {proximoNivel.meta} para {proximoNivel.nome_nivel}
            </p>
          </div>
        ) : (
          <p className="text-center text-[10px] text-primary font-medium">Nível máximo 🎉</p>
        )}
      </div>
    </div>
  );
}
