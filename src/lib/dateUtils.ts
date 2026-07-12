import { StatusTorneio } from '@/types/Enums';

// Constrói um Date "local" a partir de uma string YYYY-MM-DD (ou o prefixo
// de uma datetime ISO) sem cair no bug clássico de `new Date("2026-08-01")`
// interpretar a string como meia-noite UTC — que em fusos horários
// negativos (ex.: Brasil, UTC-3) exibe o dia anterior ao gravado.
export const parseDataLocal = (dataISO: string): Date => {
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
};

export const formatarDataBR = (dataISO: string | null | undefined): string => {
  if (!dataISO) return '—';
  return parseDataLocal(dataISO).toLocaleDateString('pt-BR');
};

type TorneioComData = {
  status?: string;
  data_planejada: string;
  inicio_real?: string | null;
};

// Momento efetivo de um torneio pra ordenar/filtrar/agrupar: enquanto ele
// não termina, só existe a data planejada (o que vai acontecer); depois de
// FINALIZADO, o que de fato aconteceu (início real) é que vale — nunca mais
// a planejada, que pode ter sido só uma estimativa inicial. `inicio_real`
// já vem como datetime ISO com offset, então o parse nativo (sem o bug de
// `parseDataLocal`, que só afeta strings de data pura) já é seguro.
export const momentoEfetivoTorneio = (torneio: TorneioComData): Date => {
  if (torneio.status === StatusTorneio.FINALIZADO && torneio.inicio_real) {
    return new Date(torneio.inicio_real);
  }
  return parseDataLocal(torneio.data_planejada);
};

// Só a data a exibir num card/detalhe de torneio — mesma regra de
// momentoEfetivoTorneio, formatada.
export const dataExibicaoTorneio = (torneio: TorneioComData): string =>
  momentoEfetivoTorneio(torneio).toLocaleDateString('pt-BR');
