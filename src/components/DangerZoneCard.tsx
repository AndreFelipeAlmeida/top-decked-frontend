import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PALAVRA_CONFIRMACAO = 'EXCLUIR';

type DangerZoneCardProps = {
  descricao: string;
  itensPerdidos: string[];
  /** Nome próprio que também serve como confirmação (ex.: o nome da loja) —
   * quando ausente, só a palavra EXCLUIR é aceita. */
  nomeParaConfirmar?: string;
  onConfirmar: () => void;
  isExcluindo: boolean;
};

export function DangerZoneCard({
  descricao,
  itensPerdidos,
  nomeParaConfirmar,
  onConfirmar,
  isExcluindo,
}: DangerZoneCardProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [textoDigitado, setTextoDigitado] = useState('');

  const fecharModal = (open: boolean) => {
    setModalAberto(open);
    if (!open) setTextoDigitado('');
  };

  const confirmacaoValida =
    textoDigitado.trim() === PALAVRA_CONFIRMACAO ||
    (!!nomeParaConfirmar && textoDigitado.trim() === nomeParaConfirmar);

  return (
    <div className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-6">
      <div className="flex items-center gap-2 mb-2 text-destructive">
        <AlertTriangle className="w-5 h-5" />
        <h3 className="text-lg font-bold">Zona de Perigo</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{descricao}</p>
      <ul className="list-disc list-inside text-sm text-muted-foreground mb-4 space-y-1">
        {itensPerdidos.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Button type="button" variant="destructive" onClick={() => setModalAberto(true)}>
        Excluir Conta Permanentemente
      </Button>

      <Dialog open={modalAberto} onOpenChange={fecharModal}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Essa ação não pode ser desfeita</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              {descricao}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm text-foreground">
              Digite{' '}
              {nomeParaConfirmar ? (
                <>
                  <strong>{nomeParaConfirmar}</strong> ou <strong>{PALAVRA_CONFIRMACAO}</strong>
                </>
              ) : (
                <strong>{PALAVRA_CONFIRMACAO}</strong>
              )}{' '}
              para confirmar:
            </label>
            <input
              type="text"
              value={textoDigitado}
              onChange={(e) => setTextoDigitado(e.target.value)}
              className="w-full px-4 py-2 border border-destructive/40 rounded-lg outline-none focus:ring-2 focus:ring-destructive"
              autoFocus
            />
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => fecharModal(false)} disabled={isExcluindo}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmar}
              disabled={!confirmacaoValida || isExcluindo}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isExcluindo ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
