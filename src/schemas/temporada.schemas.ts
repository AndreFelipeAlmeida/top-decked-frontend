import { z } from 'zod';

export const temporadaSchema = z
  .object({
    nome: z.string().optional(),
    mes_inicio: z.number().int().min(1, 'Selecione o mês').max(12),
    ano_inicio: z.number().int().min(2000, 'Ano inválido').max(2100, 'Ano inválido'),
    mes_fim: z.number().int().min(1, 'Selecione o mês').max(12),
    ano_fim: z.number().int().min(2000, 'Ano inválido').max(2100, 'Ano inválido'),
  })
  .refine(
    (data) => data.ano_fim > data.ano_inicio || (data.ano_fim === data.ano_inicio && data.mes_fim >= data.mes_inicio),
    {
      message: 'O fim da temporada não pode ser antes do início',
      path: ['mes_fim'],
    },
  );

export type TemporadaForm = z.infer<typeof temporadaSchema>;

export const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export const nomeDoMes = (mes: number) => MESES.find((m) => m.value === mes)?.label ?? String(mes);
