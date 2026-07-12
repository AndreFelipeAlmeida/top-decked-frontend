import { z } from 'zod';
import { parseNumeroComVirgula } from './playerType.schemas';

export const pontuacaoExtraSchema = z.object({
  jogador_criado_id: z.number().min(1, 'Selecione um jogador'),
  motivo: z.enum(['NOVATO', 'JUIZ', 'OUTROS']),
  descricao: z.string().optional(),
  pontos: z.number(),
});

export type PontuacaoExtraForm = z.infer<typeof pontuacaoExtraSchema>;

export { parseNumeroComVirgula };

export const MOTIVOS_PONTUACAO_EXTRA: { value: PontuacaoExtraForm['motivo']; label: string }[] = [
  { value: 'NOVATO', label: 'Trouxe um Novato' },
  { value: 'JUIZ', label: 'Juíz' },
  { value: 'OUTROS', label: 'Outros' },
];

export const nomeDoMotivo = (motivo: string | undefined | null) =>
  MOTIVOS_PONTUACAO_EXTRA.find((m) => m.value === motivo)?.label ?? motivo ?? '';
