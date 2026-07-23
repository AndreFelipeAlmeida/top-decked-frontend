import type { TemporadaPublico } from '@/types/Temporada';
import { parseDataLocal } from './dateUtils';

export const dataEstaNaTemporada = (data: Date, temporada: TemporadaPublico) => {
  const chave = data.getFullYear() * 12 + data.getMonth();
  const inicio = temporada.ano_inicio * 12 + (temporada.mes_inicio - 1);
  const fim = temporada.ano_fim * 12 + (temporada.mes_fim - 1);
  return chave >= inicio && chave <= fim;
};

export const encontrarTemporadaDaData = (dataISO: string | undefined, temporadas: TemporadaPublico[] | undefined) => {
  if (!dataISO) return undefined;
  const data = parseDataLocal(dataISO);
  return (temporadas ?? []).find((temporada) => dataEstaNaTemporada(data, temporada));
};
