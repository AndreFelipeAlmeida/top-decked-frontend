import { z } from 'zod';

export const updateStoreSchema = z.object({
  nome: z.string().min(1, 'Informe o nome da loja'),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  site: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

export type UpdateStoreForm = z.infer<typeof updateStoreSchema>;
