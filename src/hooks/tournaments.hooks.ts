import { tournamentsKeys } from "@/keys/tournaments.keys";
import {
  createOrganizerTournamentSchema,
  createStoreTournamentSchema,
  type CreateOrganizerTournamentForm,
  type CreateStoreTournamentForm,
} from "@/schemas/tournament.schemas";
import {
  adicionarJuiz,
  createOrganizerTournament,
  createTournament,
  deleteRodada,
  deleteTournament,
  desinscreverJogador,
  generateRound,
  getOrganizadoresDisponiveisParaJuiz,
  getTournamentById,
  getTournaments,
  getTournamentsByStore,
  importOrganizerTournament,
  importTournament,
  importTournamentResults,
  inscreverJogador,
  recalculateTournamentScore,
  removerJuiz,
  updatePlayerRule,
  updatePlayerScore,
  updateRodada,
  updateTournament,
} from "@/services/tournament.service";
import type { TorneioAtualizar } from "@/types/Tournaments";
import type { UserRole } from "@/types/User";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export const useTournaments = (type: UserRole) => {
  return useQuery({
    queryKey: tournamentsKeys.list(type),
    queryFn: () => {
      if (type === "jogador") {
        return getTournaments()
      } else {
        return getTournamentsByStore()
      }
    },
  });
}

export const useCreateOrganizerTournamentForm = () => {
  return useForm<CreateOrganizerTournamentForm>({
    resolver: zodResolver(
      createOrganizerTournamentSchema
    ),
    defaultValues: {
      nome: '',
      jogo: '',
      data_planejada: '',
      hora_planejada: '',
      vagas: 32,
      taxa: 0,
      premio: '',
      descricao: '',
      n_rodadas: 5,
      tempo_por_rodada: 30,
      cidade: '',
      estado: '',
      conta_em_eventos: true,
    },
  });
};

export const useCreateOrganizerTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganizerTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          tournamentsKeys.all,
      });
    },
  });
};

export const useImportOrganizerTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lojaId, file }: { lojaId: number; file: File }) =>
      importOrganizerTournament(lojaId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
};

export const useImportTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importTournament(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
};

export const useCreateStoreTournamentForm = () => {
  return useForm<CreateStoreTournamentForm>({
    resolver: zodResolver(createStoreTournamentSchema),
    defaultValues: {
      nome: '',
      jogo: 'POKEMON',
      formato: 'PADRAO',
      melhor_de: 'MD1',
      data_planejada: '',
      hora_planejada: '',
      n_rodadas: 5,
      tempo_por_rodada: 30,
      vagas: 32,
      cidade: '',
      estado: '',
      taxa: 0,
      premio: '',
      descricao: '',
      conta_em_eventos: true,
    },
  });
};

export const useCreateStoreTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
};

export const useTournamentById = (id: string | undefined) => {
  return useQuery({
    queryKey: tournamentsKeys.detail(id),
    queryFn: () => getTournamentById(id!),
    enabled: !!id,
  });
};

export const useUpdateTournament = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: TorneioAtualizar) => updateTournament(id!, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
    },
  });
};

export const useImportTournamentResults = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importTournamentResults(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
    },
  });
};

export const useUpdatePlayerScore = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, dados }: { linkId: number; dados: { pontuacao: number; pontuacao_com_regras: number } }) =>
      updatePlayerScore(id!, linkId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
    },
  });
};

export const useUpdatePlayerRule = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, regraExtraId }: { linkId: number; regraExtraId: number | null }) =>
      updatePlayerRule(id!, linkId, regraExtraId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
    },
  });
};

export const useRecalculateTournamentScore = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ regraBasicaId, pontuacaoDeParticipacao }: { regraBasicaId?: number; pontuacaoDeParticipacao?: number }) =>
      recalculateTournamentScore(id!, regraBasicaId, pontuacaoDeParticipacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
    },
  });
};

export const useInscreverJogador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (torneioId: string) => inscreverJogador(torneioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (torneioId: string) => deleteTournament(torneioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
};

export const useDesinscreverJogador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (torneioId: string) => desinscreverJogador(torneioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
};

export const useOrganizadoresDisponiveisParaJuiz = (id: string | undefined) => {
  return useQuery({
    queryKey: tournamentsKeys.organizadoresDisponiveisJuiz(id),
    queryFn: () => getOrganizadoresDisponiveisParaJuiz(id!),
    enabled: !!id,
  });
};

export const useAdicionarJuiz = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jogadorCriadoId: number) => adicionarJuiz(id!, jogadorCriadoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.organizadoresDisponiveisJuiz(id) });
    },
  });
};

export const useRemoverJuiz = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: number) => removerJuiz(id!, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.organizadoresDisponiveisJuiz(id) });
    },
  });
};

export const useGenerateRound = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateRound(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
    },
  });
};

export const useDeleteRodada = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (numRodada: number) => deleteRodada(id!, numRodada),
    onSuccess: (torneioAtualizado) => {
      queryClient.setQueryData(tournamentsKeys.detail(id), torneioAtualizado);
    },
  });
};

export const useUpdateRodada = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rodadaId,
      dados,
    }: {
      rodadaId: number;
      dados: {
        jogador1_id?: number | null;
        jogador2_id?: number | null;
        vencedor_id?: number | null;
      };
    }) => updateRodada(id!, rodadaId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(id) });
    },
  });
};