import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useGenerateRound, useUpdateRodada } from '@/hooks/tournaments.hooks';
import { useComposicaoPartida, useUpdateComposicaoPartida } from '@/hooks/composicao.hooks';
import { pokemonSpriteUrl } from '@/lib/pokemon';
import type { JogadorTorneioLinkPublico, RodadaPublico, TorneioPublico } from '@/types/Tournaments';
import type { ApiErrorDetail } from '@/types/Error';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

const nomeDoLink = (link: JogadorTorneioLinkPublico | undefined) =>
  link?.apelido || (link?.jogador_id ? `Jogador #${link.jogador_id}` : 'Jogador');

type RodadasTabProps = {
  torneio: TorneioPublico | undefined;
  torneioId: string | undefined;
};

export function RodadasTab({ torneio, torneioId }: RodadasTabProps) {
  const rodadas = torneio?.rodadas ?? [];
  const numsRodada = Array.from(new Set(rodadas.map((r) => r.num_rodada))).sort((a, b) => a - b);
  const [rodadaAtivaOverride, setRodadaAtivaOverride] = useState<number | null>(null);
  const rodadaAtiva = rodadaAtivaOverride ?? numsRodada[numsRodada.length - 1] ?? null;

  const generateRoundMutation = useGenerateRound(torneioId);

  const handleGenerateRound = () => {
    generateRoundMutation.mutate(undefined, {
      onSuccess: () => toast.success('Nova rodada gerada.'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao gerar rodada.')),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {numsRodada.length === 0
            ? 'Nenhuma rodada gerada ainda.'
            : `${numsRodada.length} rodada${numsRodada.length > 1 ? 's' : ''} gerada${numsRodada.length > 1 ? 's' : ''}.`}
        </p>
        {torneio?.status === 'EM_ANDAMENTO' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleGenerateRound}
            disabled={generateRoundMutation.isPending}
          >
            <RefreshCw className="w-4 h-4" />
            {generateRoundMutation.isPending ? 'Gerando...' : 'Gerar Próxima Rodada'}
          </Button>
        )}
      </div>

      {numsRodada.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Nenhuma rodada foi gerada para este torneio ainda.
        </p>
      ) : (
        <Tabs value={String(rodadaAtiva)} onValueChange={(v) => setRodadaAtivaOverride(Number(v))}>
          <TabsList>
            {numsRodada.map((num) => (
              <TabsTrigger key={num} value={String(num)}>Rodada {num}</TabsTrigger>
            ))}
          </TabsList>

          {numsRodada.map((num) => (
            <TabsContent key={num} value={String(num)} className="space-y-4 pt-4">
              {rodadas
                .filter((r) => r.num_rodada === num)
                .sort((a, b) => (a.mesa ?? 0) - (b.mesa ?? 0))
                .map((mesa) => (
                  <MesaEditor key={mesa.id} torneio={torneio} torneioId={torneioId} mesa={mesa} />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

type MesaEditorProps = {
  torneio: TorneioPublico | undefined;
  torneioId: string | undefined;
  mesa: RodadaPublico;
};

function MesaEditor({ torneio, torneioId, mesa }: MesaEditorProps) {
  const updateRodadaMutation = useUpdateRodada(torneioId);
  const jogadores = torneio?.jogadores ?? [];

  const jogador1 = jogadores.find((j) => j.id === mesa.jogador1_id);
  const jogador2 = jogadores.find((j) => j.id === mesa.jogador2_id);

  const handleJogador1Change = (value: string) => {
    updateRodadaMutation.mutate(
      { rodadaId: mesa.id, dados: { jogador1_id: Number(value) } },
      {
        onSuccess: () => toast.success('Mesa atualizada.'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao atualizar mesa.')),
      },
    );
  };

  const handleJogador2Change = (value: string) => {
    updateRodadaMutation.mutate(
      { rodadaId: mesa.id, dados: { jogador2_id: value === 'bye' ? null : Number(value) } },
      {
        onSuccess: () => toast.success('Mesa atualizada.'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao atualizar mesa.')),
      },
    );
  };

  const handleVencedorChange = (value: string) => {
    updateRodadaMutation.mutate(
      { rodadaId: mesa.id, dados: { vencedor_id: value === 'none' ? null : Number(value) } },
      {
        onSuccess: () => toast.success('Resultado da mesa salvo.'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao salvar resultado da mesa.')),
      },
    );
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h4 className="text-base font-bold text-foreground">Mesa {mesa.mesa ?? '—'}</h4>
        {mesa.finalizada && (
          <span className="px-2 py-0.5 bg-success/15 text-success text-xs rounded-full font-bold">
            Finalizada
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1 text-muted-foreground font-medium">Jogador 1</label>
          <Select value={mesa.jogador1_id ? String(mesa.jogador1_id) : ''} onValueChange={handleJogador1Change}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {jogadores.map((j) => (
                <SelectItem key={j.id} value={String(j.id)}>{nomeDoLink(j)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs mb-1 text-muted-foreground font-medium">Jogador 2</label>
          <Select value={mesa.jogador2_id ? String(mesa.jogador2_id) : 'bye'} onValueChange={handleJogador2Change}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bye">— Bye (sem adversário) —</SelectItem>
              {jogadores.map((j) => (
                <SelectItem key={j.id} value={String(j.id)}>{nomeDoLink(j)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1 text-muted-foreground font-medium">Vencedor</label>
        <Select value={mesa.vencedor_id ? String(mesa.vencedor_id) : 'none'} onValueChange={handleVencedorChange}>
          <SelectTrigger className="w-full md:w-56" size="sm">
            <SelectValue placeholder="Vencedor da mesa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem resultado</SelectItem>
            {mesa.jogador1_id && (
              <SelectItem value={String(mesa.jogador1_id)}>{nomeDoLink(jogador1)}</SelectItem>
            )}
            {mesa.jogador2_id && (
              <SelectItem value={String(mesa.jogador2_id)}>{nomeDoLink(jogador2)}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className={`grid grid-cols-1 ${mesa.jogador2_id ? 'md:grid-cols-2' : ''} gap-3`}>
        <ComposicaoDaMesa torneio={torneio} torneioId={torneioId} mesa={mesa} link={jogador1} />
        {mesa.jogador2_id && (
          <ComposicaoDaMesa torneio={torneio} torneioId={torneioId} mesa={mesa} link={jogador2} />
        )}
      </div>
    </div>
  );
}

type ComposicaoDaMesaProps = {
  torneio: TorneioPublico | undefined;
  torneioId: string | undefined;
  mesa: RodadaPublico;
  link: JogadorTorneioLinkPublico | undefined;
};

// A composição é sempre puxada do que já foi preenchido na aba
// "Composições" (JogadorComposicaoUnidade) — nada aqui cria uma composição
// nova. Pra TCG/VGC ela é só exibida (a mesma composição vale em toda
// rodada, editar isso é responsabilidade da aba Composições); só Pokémon GO
// permite escolher, por partida, quais 3 dos 6 Pokémon do time jogam (ver
// JOGOS_COM_COMPOSICAO_POR_PARTIDA/docs/COMPOSICAO.md seção 9).
function ComposicaoDaMesa({ torneio, torneioId, mesa, link }: ComposicaoDaMesaProps) {
  const jogoEhGo = torneio?.jogo === 'POKEMON_GO';
  const jogoTemRepresentacao = torneio?.jogo === 'POKEMON';

  const { data: composicaoPartida, isLoading } = useComposicaoPartida(torneioId, mesa.id, link?.id, jogoEhGo);
  const updateComposicaoPartidaMutation = useUpdateComposicaoPartida(torneioId);

  const timeCompleto = link?.composicao_unidades ?? [];
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  // Ajusta o estado local durante a renderização quando a composição da
  // partida (buscada do backend) muda de identidade — padrão recomendado
  // pelo React pra "sincronizar estado a partir de uma prop/query" sem usar
  // useEffect (evita o cascading render de chamar setState dentro de efeito).
  const [ultimaComposicaoVista, setUltimaComposicaoVista] = useState(composicaoPartida);
  if (composicaoPartida && composicaoPartida !== ultimaComposicaoVista) {
    setUltimaComposicaoVista(composicaoPartida);
    setSelecionadas(composicaoPartida.unidades.map((u) => u.unidade_catalogo_id));
  }

  if (!link) {
    return (
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground italic">Nenhum jogador definido nesta posição.</p>
      </div>
    );
  }

  const toggleUnidade = (unidadeCatalogoId: number) => {
    setSelecionadas((atual) =>
      atual.includes(unidadeCatalogoId)
        ? atual.filter((id) => id !== unidadeCatalogoId)
        : [...atual, unidadeCatalogoId],
    );
  };

  const salvarSelecao = () => {
    if (!link.id) return;
    updateComposicaoPartidaMutation.mutate(
      {
        rodadaId: mesa.id,
        linkId: link.id,
        dados: { unidades: selecionadas.map((id) => ({ unidade_catalogo_id: id, quantidade: 1 })) },
      },
      {
        onSuccess: () => toast.success('Composição da partida salva.'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao salvar composição da partida.')),
      },
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-foreground truncate">{nomeDoLink(link)}</p>
        {jogoTemRepresentacao && link.composicao_representacao && (
          <div className="flex items-center -space-x-2 shrink-0">
            {link.composicao_representacao.unidades.map((unidade) => (
              <img
                key={unidade.id}
                src={pokemonSpriteUrl(unidade.external_id)}
                alt={unidade.nome}
                title={unidade.nome}
                className="w-6 h-6 rounded-full bg-muted object-contain border border-border"
              />
            ))}
          </div>
        )}
      </div>

      {jogoTemRepresentacao ? (
        // TCG só cobra representação — nunca mais alertar sobre composição
        // ausente aqui; o ícone (quando existe) já foi mostrado no
        // cabeçalho acima.
        !link.composicao_representacao && (
          <p className="text-xs text-warning">
            Nenhuma representação cadastrada na aba "Composições" ainda.
          </p>
        )
      ) : timeCompleto.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhuma composição cadastrada na aba "Composições" ainda.
        </p>
      ) : jogoEhGo ? (
        isLoading ? (
          <p className="text-xs text-muted-foreground">Carregando composição da partida...</p>
        ) : (
          <>
            <p className="text-[11px] text-muted-foreground">
              Escolha quais Pokémon do time jogam nesta partida:
            </p>
            <div className="flex flex-wrap gap-2">
              {timeCompleto.map((cu) => {
                const marcado = selecionadas.includes(cu.unidade_catalogo_id);
                return (
                  <button
                    key={cu.unidade_catalogo_id}
                    type="button"
                    onClick={() => toggleUnidade(cu.unidade_catalogo_id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-colors ${
                      marcado ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <img
                      src={pokemonSpriteUrl(cu.unidade.external_id)}
                      alt={cu.unidade.nome}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-[10px] text-foreground capitalize truncate max-w-[56px]">
                      {cu.unidade.nome}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={salvarSelecao}
              disabled={updateComposicaoPartidaMutation.isPending}
            >
              {updateComposicaoPartidaMutation.isPending
                ? 'Salvando...'
                : `Salvar (${selecionadas.length} selecionado${selecionadas.length === 1 ? '' : 's'})`}
            </Button>
          </>
        )
      ) : (
        <div className="flex flex-wrap gap-2">
          {timeCompleto.map((cu) => (
            <div
              key={cu.unidade_catalogo_id}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-foreground"
            >
              <img src={pokemonSpriteUrl(cu.unidade.external_id)} alt={cu.unidade.nome} className="w-4 h-4 object-contain" />
              <span className="capitalize">{cu.unidade.nome}</span>
              {cu.quantidade > 1 && <span className="text-muted-foreground">x{cu.quantidade}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
