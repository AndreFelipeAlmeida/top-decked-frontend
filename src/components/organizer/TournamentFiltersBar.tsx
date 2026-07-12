import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusTorneio } from '@/types/Enums';
import { datePresets, type DatePreset } from '@/hooks/useTournamentFilters';
import type { LojaPublico } from '@/types/Store';
import { nomeDoFormato } from '@/lib/pokemonFormats';

type TournamentFiltersBarProps = {
  busca: string;
  onBuscaChange: (valor: string) => void;
  // Busca por nome só faz sentido na listagem de Torneios — no Ranking
  // (agregado por jogador, não por torneio) esse campo fica sem efeito.
  showBuscaFilter?: boolean;
  statusFiltro: string;
  onStatusChange: (valor: string) => void;
  showStatusFilter?: boolean;
  formatoFiltro: string;
  onFormatoChange: (valor: string) => void;
  formatosDisponiveis: string[];
  showLojaFilter: boolean;
  lojaFiltro: string;
  onLojaChange: (valor: string) => void;
  lojasDisponiveis: LojaPublico[];
  datePreset: DatePreset;
  onSelecionarPreset: (preset: DatePreset) => void;
  usaDataCustom: boolean;
  dataInicioCustom: string;
  dataFimCustom: string;
  onDataCustomChange: (campo: 'inicio' | 'fim', valor: string) => void;
};

export function TournamentFiltersBar({
  busca,
  onBuscaChange,
  showBuscaFilter = true,
  statusFiltro,
  onStatusChange,
  showStatusFilter = true,
  formatoFiltro,
  onFormatoChange,
  formatosDisponiveis,
  showLojaFilter,
  lojaFiltro,
  onLojaChange,
  lojasDisponiveis,
  datePreset,
  onSelecionarPreset,
  usaDataCustom,
  dataInicioCustom,
  dataFimCustom,
  onDataCustomChange,
}: TournamentFiltersBarProps) {
  const colunasVisiveis = (showBuscaFilter ? 1 : 0) + (showStatusFilter ? 1 : 0) + 1 + (showLojaFilter ? 1 : 0);

  return (
    <div className="bg-card p-4 rounded-lg shadow mb-6 space-y-4">
      <div className={`grid grid-cols-1 md:grid-cols-2 ${colunasVisiveis >= 4 ? 'lg:grid-cols-4' : colunasVisiveis === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
        {showBuscaFilter && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

            <input
              type="text"
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {showStatusFilter && (
          <Select value={statusFiltro} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value={StatusTorneio.ABERTO}>Aberto</SelectItem>
              <SelectItem value={StatusTorneio.EM_ANDAMENTO}>Em Andamento</SelectItem>
              <SelectItem value={StatusTorneio.FINALIZADO}>Finalizado</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={formatoFiltro} onValueChange={onFormatoChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos os Formatos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Formatos</SelectItem>
            {formatosDisponiveis.map((formato) => (
              <SelectItem key={formato} value={formato}>{nomeDoFormato(formato)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showLojaFilter && (
          <Select value={lojaFiltro} onValueChange={onLojaChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as Lojas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Lojas</SelectItem>
              {lojasDisponiveis.map((loja) => (
                <SelectItem key={loja.id} value={String(loja.id)}>{loja.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground shrink-0">Período:</span>

        <div className="flex flex-wrap gap-2">
          {datePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={usaDataCustom}
              onClick={() => onSelecionarPreset(preset.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                datePreset === preset.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-background text-foreground border-border hover:bg-accent'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <span className="text-sm text-muted-foreground shrink-0">ou escolha as datas:</span>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dataInicioCustom}
            disabled={datePreset !== null}
            onChange={(e) => onDataCustomChange('inicio', e.target.value)}
            className="px-2 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-muted-foreground">até</span>
          <input
            type="date"
            value={dataFimCustom}
            disabled={datePreset !== null}
            onChange={(e) => onDataCustomChange('fim', e.target.value)}
            className="px-2 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
