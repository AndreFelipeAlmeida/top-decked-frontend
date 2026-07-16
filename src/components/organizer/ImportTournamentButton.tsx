import { useState } from 'react';
import { Upload } from 'lucide-react';
import { DashboardActionButton } from '@/components/ui/dashboard-action-button';
import { ImportTournamentDialog } from './ImportTournamentDialog';
import type { LojaJogadorPublico } from '@/types/Credito';

type ImportTournamentButtonProps = {
  isJogadorOrganizador?: boolean;
  lojaIdFixo?: number;
  lojas?: LojaJogadorPublico[];
  onImported: (torneioId: string) => void;
};

// Botão reaproveitável de "Importar Torneio": usado no dashboard da Loja e
// no dashboard do Organizador (visão de jogador organizador).
export function ImportTournamentButton({
  isJogadorOrganizador = false,
  lojaIdFixo,
  lojas,
  onImported,
}: ImportTournamentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DashboardActionButton icon={Upload} label="Importar Torneio" onClick={() => setOpen(true)} />
      <ImportTournamentDialog
        open={open}
        onOpenChange={setOpen}
        isJogadorOrganizador={isJogadorOrganizador}
        lojaIdFixo={lojaIdFixo}
        lojas={lojas}
        onImported={onImported}
      />
    </>
  );
}
