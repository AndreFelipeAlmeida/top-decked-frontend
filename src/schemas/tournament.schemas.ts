import { z } from 'zod';

export const createOrganizerTournamentSchema =
  z.object({
    loja_id: z.number().min(1, 'Escolha a loja que quer criar o torneio'),

    nome: z.string().min(3, 'Nome muito curto'),

    jogo: z.string().min(1, 'Selecione um TCG'),

    data_planejada: z.string().min(1, 'Informe a data'),

    hora_planejada: z.string().optional(),

    vagas: z.number().min(2),

    n_rodadas: z.number().min(1),

    tempo_por_rodada: z.number().min(1),

    cidade: z.string().optional(),

    estado: z.string().optional(),

    taxa: z.number(),

    premio: z.string().optional(),

    descricao: z.string().optional(),

    regra_basica_id: z.number().min(1, 'Selecione uma regra para o torneio'),

    conta_em_eventos: z.boolean(),
  });

export type CreateOrganizerTournamentForm = z.infer<typeof createOrganizerTournamentSchema>;

export const createStoreTournamentSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),

  jogo: z.string().min(1, 'Selecione um jogo'),

  formato: z.string().min(1, 'Selecione um formato'),

  melhor_de: z.string().min(1, 'Selecione o melhor de'),

  data_planejada: z.string().min(1, 'Informe a data'),

  hora_planejada: z.string().optional(),

  n_rodadas: z.number().min(1),

  tempo_por_rodada: z.number().min(1),

  vagas: z.number().min(2),

  cidade: z.string().min(2),

  estado: z.string().length(2),

  taxa: z.number(),

  premio: z.string().optional(),

  descricao: z.string().optional(),

  regra_basica_id: z.number().min(1, 'Selecione uma regra para o torneio'),

  conta_em_eventos: z.boolean(),
});

export type CreateStoreTournamentForm = z.infer<typeof createStoreTournamentSchema>;

export const updateStoreTournamentSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto').optional(),

  data_planejada: z.string().min(1, 'Informe a data').optional(),

  hora_planejada: z.string().optional(),

  formato: z.string().optional(),

  melhor_de: z.string().optional(),

  vagas: z.number().min(2).optional(),

  taxa: z.number().optional(),

  premio: z.string().optional(),

  descricao: z.string().optional(),

  regra_basica_id: z.number().optional(),

  pontuacao_de_participacao: z.number().optional(),

  inicio_real: z.string().optional(),

  fim_real: z.string().optional(),

  conta_em_eventos: z.boolean().optional(),
});

export type UpdateStoreTournamentForm = z.infer<typeof updateStoreTournamentSchema>;