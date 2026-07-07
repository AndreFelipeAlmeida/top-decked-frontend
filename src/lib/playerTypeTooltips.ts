// Textos explicativos dos campos de bônus de oponente, compartilhados entre
// o modal de criação rápida (QuickCreateRuleDialog) e a página de Regras de
// Jogos (PlayerRules) — mesma regra de pontuação, mesma explicação.
export const oponenteGanhaTooltip =
  'Pontos que o adversário ganha (pode ser negativo, para penalizar) quando ele VENCE um jogador que usa esta regra.';

export const oponenteEmpataTooltip =
  'Pontos que o adversário ganha (pode ser negativo) quando EMPATA com um jogador que usa esta regra.';

export const oponentePerdeTooltip =
  'Pontos que o adversário ganha (pode ser negativo, para penalizar) quando PERDE para um jogador que usa esta regra. Ex.: para o jogador desta regra ganhar 1 ponto extra por vitória e o adversário perder 1 ponto extra por essa derrota, defina Vitória = 4 (era 3) e Oponente Perde = -1.';
