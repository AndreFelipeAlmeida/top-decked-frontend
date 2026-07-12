import { useState } from 'react';
import { Upload } from 'lucide-react';
import { DashboardActionButton } from '@/components/ui/dashboard-action-button';
import { ImportTournamentDialog } from './ImportTournamentDialog';
import type { LojaJogadorPublico } from '@/types/Credito';

type ImportTournamentButtonProps = {
  isJogadorOrganizador?: boolean;
  lojas?: LojaJogadorPublico[];
  onImported: (torneioId: string) => void;
};

// Botão reaproveitável de "Importar Torneio": usado no dashboard da Loja e
// no dashboard do Organizador (visão de jogador organizador).
export function ImportTournamentButton({
  isJogadorOrganizador = false,
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
        lojas={lojas}
        onImported={onImported}
      />
    </>
  );
}
