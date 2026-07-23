import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
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
import { useImportOrganizerTournament, useImportTournament } from '@/hooks/tournaments.hooks';
import type { ApiErrorDetail } from '@/types/Error';
import type { LojaJogadorPublico } from '@/types/Credito';

type ImportTournamentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Loja usa o próprio token (POST /lojas/torneios/importar, sem loja_id);
  // jogador organizador precisa informar em nome de qual loja está
  // importando (POST /lojas/torneios/importar-organizador, loja_id
  // obrigatório) — mesmo padrão de QuickCreateRuleDialog/QuickCreateSeasonDialog.
  isJogadorOrganizador: boolean;
  lojaIdFixo?: number;
  lojas?: LojaJogadorPublico[];
  onImported: (torneioId: string) => void;
};

export function ImportTournamentDialog({
  open,
  onOpenChange,
  isJogadorOrganizador,
  lojaIdFixo,
  lojas = [],
  onImported,
}: ImportTournamentDialogProps) {
  const [lojaIdSelecionada, setLojaIdSelecionada] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lojaId = lojaIdFixo ? String(lojaIdFixo) : lojaIdSelecionada;

  const importOrganizadorMutation = useImportOrganizerTournament();
  const importLojaMutation = useImportTournament();
  const isPending = isJogadorOrganizador ? importOrganizadorMutation.isPending : importLojaMutation.isPending;

  const podeSelecionarArquivo = !isJogadorOrganizador || Boolean(lojaId);
  const podeImportar = Boolean(selectedFile) && (!isJogadorOrganizador || Boolean(lojaId));

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

  const resetState = () => {
    setSelectedFile(null);
    setLojaIdSelecionada('');
  };

  const handleImport = () => {
    if (!selectedFile) return;

    const handleSuccess = (torneio: { id: string }) => {
      toast.success('Torneio importado com sucesso!');
      resetState();
      onOpenChange(false);
      onImported(torneio.id);
    };
    const handleError = (error: unknown) => {
      const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
      toast.error(typeof detail === 'string' ? detail : 'Erro ao importar torneio.');
    };

    if (isJogadorOrganizador) {
      if (!lojaId) return;
      importOrganizadorMutation.mutate(
        { lojaId: Number(lojaId), file: selectedFile },
        { onSuccess: handleSuccess, onError: handleError },
      );
    } else {
      importLojaMutation.mutate(selectedFile, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetState();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Torneio</DialogTitle>
          <DialogDescription>
            {isJogadorOrganizador && !lojaIdFixo
              ? 'Selecione a loja e o arquivo .tdf exportado do software de torneios.'
              : 'Selecione o arquivo .tdf exportado do software de torneios.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isJogadorOrganizador && !lojaIdFixo && (
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Loja</label>
              <Select value={lojaIdSelecionada} onValueChange={setLojaIdSelecionada}>
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
          )}

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
              disabled={!podeSelecionarArquivo}
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
          <Button type="button" disabled={!podeImportar || isPending} onClick={handleImport}>
            {isPending ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
