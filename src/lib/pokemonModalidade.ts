// Só o TCG de Pokémon tem "representação de deck" (o ícone de arquétipo, 2
// unidades) — não existe esse conceito em VGC/GO, que são sempre a
// composição completa (o time de 6 Pokémon). A UI de cada modalidade deve
// exibir só a opção que faz sentido pra ela, nunca as duas ao mesmo tempo.
export const jogoTemRepresentacaoDeck = (jogo: string | undefined | null) => jogo === 'POKEMON';
