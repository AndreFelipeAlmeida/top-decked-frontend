import { z } from 'zod';

export const playerTypeSchema = z.object({
  nome: z.string().min(1, 'Informe um nome'),
  pt_vitoria: z.number(),
  pt_derrota: z.number(),
  pt_empate: z.number(),
  pt_oponente_perde: z.number().optional(),
  pt_oponente_ganha: z.number().optional(),
  pt_oponente_empate: z.number().optional(),
  tcg: z.string().min(1, 'Selecione um TCG'),
});

export type PlayerTypeForm = z.infer<typeof playerTypeSchema>;

// Campos de pontuação aceitam vírgula como separador decimal (padrão
// brasileiro, ex: "1,5") além do ponto — os inputs são type="text" (não
// type="number", que bloqueia a vírgula na digitação em vários navegadores),
// então usamos `setValueAs` no register do react-hook-form pra normalizar
// antes da validação do zod, em vez de `valueAsNumber` (que usa Number()
// puro e rejeitaria a vírgula).
export const parseNumeroComVirgula = (valor: unknown): number | undefined => {
  if (typeof valor !== 'string') return valor as number | undefined;
  const normalizado = valor.trim().replace(',', '.');
  if (normalizado === '') return undefined;
  const numero = Number(normalizado);
  return Number.isNaN(numero) ? (valor as unknown as number) : numero;
};
