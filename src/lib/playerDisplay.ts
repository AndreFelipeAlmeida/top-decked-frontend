import type { LojaJogadorPublico } from '@/types/Credito';

export function nomeExibicaoJogador(player: LojaJogadorPublico): string {
  return player.apelido || player.jogador?.nome || '--';
}
