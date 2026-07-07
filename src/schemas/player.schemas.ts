import { z } from 'zod';

export const updatePlayerProfileSchema = z.object({
  nome: z.string().min(1, 'Informe seu nome'),
  telefone: z.string().optional().or(z.literal('')),
  data_nascimento: z.string().optional().or(z.literal('')),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

export type UpdatePlayerProfileForm = z.infer<typeof updatePlayerProfileSchema>;

export const updateGameIdSchema = z.object({
  game_id: z.string().min(1, 'Informe seu ID de jogador'),
});

export type UpdateGameIdForm = z.infer<typeof updateGameIdSchema>;
