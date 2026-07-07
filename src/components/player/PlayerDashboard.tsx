import { useEffect, useRef, useState } from 'react';
import { Plus, LayoutDashboard, Trophy, Upload, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useViewMode } from '@/hooks/viewModeContext.hooks';
import { useAchievementHistory } from '@/hooks/achievements.hooks';
import { useImportOrganizerTournament } from '@/hooks/tournaments.hooks';
import { OrganizerViewSwitch } from './OrganizerViewSwitch';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ApiErrorDetail } from '@/types/Error';
import type { LojaJogadorPublico } from '@/types/Credito';

const ULTIMA_VISITA_CONQUISTAS_KEY = 'ultima_visita_conquistas';

type ImportTournamentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lojas: LojaJogadorPublico[];
  onImported: (torneioId: string) => void;
};

function ImportTournamentDialog({ open, onOpenChange, lojas, onImported }: ImportTournamentDialogProps) {
  const [lojaId, setLojaId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportOrganizerTournament();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.tdf')) {
      toast.error('Selecione um arquivo .tdf exportado do software de torneios.');
      return;
    }

    setSelectedFile(file);
  };

  const handleImport = () => {
    if (!selectedFile || !lojaId) return;

    importMutation.mutate(
      { lojaId: Number(lojaId), file: selectedFile },
      {
        onSuccess: (torneio) => {
          toast.success('Torneio importado com sucesso!');
          setSelectedFile(null);
          onOpenChange(false);
          onImported(torneio.id);
        },
        onError: (error) => {
          const detail = axios.isAxiosError<ApiErrorDetail>(error)
            ? error.response?.data?.detail
            : undefined;
          toast.error(typeof detail === 'string' ? detail : 'Erro ao importar torneio.');
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setSelectedFile(null);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Torneio</DialogTitle>
          <DialogDescription>
            Selecione a loja e o arquivo .tdf exportado do software de torneios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Loja</label>
            <Select value={lojaId} onValueChange={setLojaId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma loja" />
              </SelectTrigger>
              <SelectContent>
                {lojas.map((loja) => (
                  <SelectItem key={loja.loja.id} value={String(loja.loja.id)}>
                    {loja.loja.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".tdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {selectedFile ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="truncate text-foreground">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                title="Remover arquivo selecionado"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!lojaId}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Selecionar arquivo .tdf
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!lojaId || !selectedFile || importMutation.isPending}
            onClick={handleImport}
          >
            {importMutation.isPending ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const user = useAuthenticatedUser();
  const { data: jogador, isLoading } = useMe(true);
  const { viewMode } = useViewMode();
  const { data: historico } = useAchievementHistory();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const lojasOrganizador = jogador?.lojas?.filter((loja) => loja.organizacoes.length > 0) ?? [];
  const isOrganizer = lojasOrganizador.length > 0;

  useEffect(() => {
    if (!historico || historico.length === 0) return;

    const ultimaVisitaStr = localStorage.getItem(ULTIMA_VISITA_CONQUISTAS_KEY);
    const ultimaVisita = ultimaVisitaStr ? new Date(ultimaVisitaStr) : null;

    const novasConquistas = ultimaVisita
      ? historico.filter((item) => new Date(item.conquistado_em) > ultimaVisita)
      : [];

    for (const item of novasConquistas) {
      toast.success(`🏆 ${item.conquista_nome} chegou ao nível ${item.nome_nivel}!`);
    }

    localStorage.setItem(ULTIMA_VISITA_CONQUISTAS_KEY, new Date().toISOString());
  }, [historico]);

  if (isLoading) return <Spinner />;

  const conquistasRecentes = historico?.slice(0, 3) ?? [];

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-foreground font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, {user.nome}!</p>
        </div>

        <OrganizerViewSwitch visible={isOrganizer} />
      </div>

      {viewMode === 'organizador' && isOrganizer && (
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            to="/jogador/criar-torneio"
            className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Torneio</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            <span>Importar Torneio</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
          <LayoutDashboard className="w-10 h-10 mb-3 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">Em breve</p>
          <p className="text-sm">
            Aqui vão aparecer seus próximos torneios, estatísticas e histórico de partidas.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Conquistas Recentes
            </h3>
          </div>

          {conquistasRecentes.length > 0 ? (
            <div className="space-y-3 mb-4">
              {conquistasRecentes.map((item) => (
                <div key={`${item.conquista_codigo}-${item.nivel}`} className="flex items-center gap-3 text-sm">
                  <span className="text-xl">{item.conquista_icone}</span>
                  <div className="min-w-0">
                    <p className="text-foreground font-medium truncate">
                      {item.conquista_nome} — {item.nome_nivel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.conquistado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">Nenhuma conquista desbloqueada ainda.</p>
          )}

          <Link to="/jogador/conquistas" className="text-sm font-medium text-primary hover:text-primary">
            Ver todas as conquistas →
          </Link>
        </div>
      </div>

      {isOrganizer && (
        <ImportTournamentDialog
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
          lojas={lojasOrganizador}
          onImported={(torneioId) => navigate(`/loja/torneio/${torneioId}/editar`)}
        />
      )}
    </div>
  );
}
