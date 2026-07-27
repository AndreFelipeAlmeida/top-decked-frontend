import { api } from "@/adapters/api";
import type {
  GetPlayersResponse,
  ImpactoTrocaGameId,
  JogadorCompleto,
  JogadorLojaPublico,
  JogadorPublico,
  JogadorUpdate,
} from "@/types/Player";
import type { JogadorEstatisticas } from "@/types/Statistics";
import type { LojaPublico } from "@/types/Store";

const resource = "/jogadores";

export const getPlayers = async ({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const response = await api.get<GetPlayersResponse>(`${resource}/`, {
    params: { page, limit, search },
  });
  return response.data;
};

export const getPlayerById = async (id: number) => {
  const response = await api.get<JogadorPublico>(`${resource}/${id}`);
  return response.data;
};

export const updatePlayerGameId = async ({ tcg, gameId }: { tcg: string; gameId: string }) => {
  const response = await api.put<JogadorPublico>(`${resource}/`, {
    tcgs: [{ tcg, id: gameId }],
  } satisfies JogadorUpdate);
  return response.data;
};

export const updatePlayer = async (dados: JogadorUpdate) => {
  const response = await api.put<JogadorPublico>(`${resource}/`, dados);
  return response.data;
};

export const getStoreByUser = async (usuarioId: number) => {
  const response = await api.get<LojaPublico>(`/lojas/usuario/${usuarioId}`);
  return response.data;
};

export const getPlayerStatistics = async (tcg?: string) => {
  const response = await api.get<JogadorEstatisticas>(`${resource}/estatisticas`, {
    params: tcg ? { tcg } : undefined,
  });
  return response.data;
};

export const getPlayersByOrganizer = async () => {
  const response = await api.get<JogadorLojaPublico[]>(`${resource}/loja`);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get<JogadorCompleto>(`${resource}/me`);
  return response.data;
};

export const getImpactoTrocaGameId = async (tcg: string) => {
  const response = await api.get<ImpactoTrocaGameId>(`${resource}/impacto-troca-gameid`, {
    params: { tcg },
  });
  return response.data;
};

export const deletePlayer = async (id: number) => {
  await api.delete(`${resource}/${id}`);
};

export const uploadPlayerPhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<JogadorPublico>(`${resource}/upload_foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
