import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/keys/admin.keys";
import {
  aprovarLoja,
  atualizarRegistroEntidade,
  criarRegistroEntidade,
  deletarRegistroEntidade,
  getColunasEntidade,
  getEntidades,
  getLojasPendentes,
  getRegistrosEntidade,
  rejeitarLoja,
} from "@/services/admin.service";
import type { RegistroEntidade } from "@/types/Admin";

export const useLojasPendentes = () => {
  return useQuery({
    queryKey: adminKeys.lojasPendentes(),
    queryFn: getLojasPendentes,
  });
};

export const useAprovarLoja = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lojaId: number) => aprovarLoja(lojaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.lojasPendentes() }),
  });
};

export const useRejeitarLoja = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lojaId: number) => rejeitarLoja(lojaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.lojasPendentes() }),
  });
};

export const useEntidades = () => {
  return useQuery({
    queryKey: adminKeys.entidades(),
    queryFn: getEntidades,
  });
};

export const useColunasEntidade = (nome: string | undefined) => {
  return useQuery({
    queryKey: adminKeys.colunasEntidade(nome ?? ""),
    queryFn: () => getColunasEntidade(nome!),
    enabled: !!nome,
  });
};

export const useRegistrosEntidade = (nome: string | undefined) => {
  return useQuery({
    queryKey: adminKeys.registrosEntidade(nome ?? ""),
    queryFn: () => getRegistrosEntidade(nome!),
    enabled: !!nome,
  });
};

export const useCriarRegistroEntidade = (nome: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: RegistroEntidade) => criarRegistroEntidade(nome!, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.registrosEntidade(nome ?? "") }),
  });
};

export const useAtualizarRegistroEntidade = (nome: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registroId, dados }: { registroId: string | number; dados: RegistroEntidade }) =>
      atualizarRegistroEntidade(nome!, registroId, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.registrosEntidade(nome ?? "") }),
  });
};

export const useDeletarRegistroEntidade = (nome: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registroId: string | number) => deletarRegistroEntidade(nome!, registroId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.registrosEntidade(nome ?? "") }),
  });
};
