import { z } from 'zod';

export const eventoSchema = z
  .object({
    nome: z.string().min(1, 'Informe um nome'),
    descricao: z.string().optional(),
    data_inicio: z.string().min(1, 'Informe a data de início'),
    data_fim: z.string().min(1, 'Informe a data de fim'),
  })
  .refine((data) => data.data_fim >= data.data_inicio, {
    message: 'A data de fim não pode ser antes da data de início',
    path: ['data_fim'],
  });

export type EventoForm = z.infer<typeof eventoSchema>;

export const metaEventoSchema = z.object({
  pontos_necessarios: z.number().int().min(1, 'Informe quantos pontos são necessários'),
  recompensa_descricao: z.string().optional(),
  recompensa_imagem_url: z.string().optional(),
});

export type MetaEventoForm = z.infer<typeof metaEventoSchema>;

export const regraEventoSchema = z.object({
  tipo: z.enum(['VITORIA', 'DERROTA', 'EMPATE', 'PARTICIPACAO']),
  pontos: z.number(),
});

export type RegraEventoForm = z.infer<typeof regraEventoSchema>;

export const regraManualEventoSchema = z.object({
  descricao: z.string().min(1, 'Descreva a regra'),
  pontos: z.number(),
});

export type RegraManualEventoForm = z.infer<typeof regraManualEventoSchema>;

export const pontosManuaisEventoSchema = z.object({
  descricao: z.string().min(1, 'Descreva o motivo'),
  pontos: z.number(),
});

export type PontosManuaisEventoForm = z.infer<typeof pontosManuaisEventoSchema>;

export const TIPOS_REGRA_EVENTO: { value: RegraEventoForm['tipo']; label: string }[] = [
  { value: 'VITORIA', label: 'Vitória' },
  { value: 'DERROTA', label: 'Derrota' },
  { value: 'EMPATE', label: 'Empate' },
  { value: 'PARTICIPACAO', label: 'Participação' },
];

export const nomeDaRegraEvento = (tipo: string | undefined | null) =>
  TIPOS_REGRA_EVENTO.find((t) => t.value === tipo)?.label ?? tipo ?? '';
