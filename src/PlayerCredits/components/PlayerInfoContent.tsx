import type { LojaJogadorPublico } from '@/types/Credito';

type Props = {
  player: LojaJogadorPublico | null;
};

export default function PlayerInfoCardContent({ player }: Props) {
  if (!player) {
    return (
      <div className="text-xs text-muted-foreground">
        Selecione um jogador para visualizar os detalhes.
      </div>
    );
  }

  const nome = player.apelido ?? 'Jogador';
  const apelido = player.apelido ?? '--';
  const gameId = player.game_id ?? '--';
  const tcg = player.tcg ?? '--';
  const creditos = player.creditos ?? 0;

  return (
    <div className="space-y-4">
      {/* Header com avatar */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {nome.charAt(0)}
        </div>

        {/* Info principal */}
        <div>
          <h2 className="text-base font-semibold text-foreground">{nome}</h2>

          <p className="text-xs text-muted-foreground">Apelido: {apelido}</p>
        </div>
      </div>

      {/* Informações extras */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/40 p-2 rounded-md">
          <p className="text-[10px] text-muted-foreground">Game ID</p>
          <p className="text-sm font-medium">{gameId}</p>
        </div>

        <div className="bg-muted/40 p-2 rounded-md">
          <p className="text-[10px] text-muted-foreground">TCG</p>
          <p className="text-sm font-medium">{tcg}</p>
        </div>
      </div>

      {/* Créditos */}
      <div className="bg-brand-gradient rounded-md shadow p-3 text-white">
        <h3 className="text-sm mb-2 font-medium">Créditos</h3>

        <p className="text-3xl font-semibold leading-none mb-1">
          R$ {creditos.toFixed(2)}
        </p>

        <p className="text-[11px] text-primary-foreground">Disponível nesta loja</p>
      </div>
    </div>
  );
}
