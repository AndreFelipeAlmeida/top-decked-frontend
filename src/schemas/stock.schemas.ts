import { z } from 'zod';

export const categorySchema = z.object({
  nome: z.string().min(1, 'Informe o nome da categoria'),
});

export type CategoryForm = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  categoria: z.number().min(1, 'Selecione uma categoria'),
  quantidade: z.number().min(0),
  min_quantidade: z.number().min(0),
  preco: z.number().min(0),
});

export type ProductForm = z.infer<typeof productSchema>;
