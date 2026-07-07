import { ShieldCheck, ShieldMinus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthContext } from '@/hooks/authContext.hooks';

import type { PaginatedJogadorPublico } from '@/types/Player';

type TcgOption = {
  label: string;
  value: string;
};

type Props = {
  players: PaginatedJogadorPublico[];
  tcgs: TcgOption[];
  page: number;
  isLoading: boolean;
  onLinkPlayer: (player: PaginatedJogadorPublico) => void;
  onUnlinkPlayer: (player: PaginatedJogadorPublico) => void;
  onPromoteOrganizer: (player: PaginatedJogadorPublico, tcg: string) => void;
  onDemoteOrganizer: (player: PaginatedJogadorPublico, tcg: string) => void;
};

export default function PlayersTable({
  players,
  tcgs,
  page,
  isLoading,
  onLinkPlayer,
  onUnlinkPlayer,
  onPromoteOrganizer,
  onDemoteOrganizer,
}: Props) {
  const { user } = useAuthContext();

  return (
    <Table className="w-full text-sm">
      <TableHeader className="bg-muted/40 border-b">
        <TableRow>
          <TableHead className="px-6 py-3 text-center font-bold text-muted-foreground uppercase">
            Numeração
          </TableHead>
          <TableHead className="px-6 py-3 text-center font-bold text-muted-foreground uppercase">
            Jogador
          </TableHead>
          {tcgs.map((tcg) => (
            <TableHead
              key={tcg.value}
              className="px-6 py-3 text-center font-bold text-muted-foreground uppercase"
            >
              {tcg.label}
            </TableHead>
          ))}
          <TableHead className="px-6 py-3 text-center font-bold text-muted-foreground uppercase">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="divide-y">
        {isLoading && (
          <TableRow>
            <TableCell colSpan={3 + tcgs.length} className="text-center py-6">
              Carregando...
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          players.map((player, index) => {
            const globalIndex = (page - 1) * 10 + index;
            const linkAtual = player.lojas?.find(
              (credito) => credito.loja_id === user?.id,
            );
            const isLinked = Boolean(linkAtual);

            return (
              <TableRow key={player.id}>
                <TableCell className="text-center">{globalIndex + 1}</TableCell>
                <TableCell className="text-center">{player.nome}</TableCell>

                {tcgs.map((tcg) => {
                  const game = player.tcgs?.find((g) => g.tcg === tcg.value);
                  const isOrganizerForTcg = linkAtual?.organizacoes?.some(
                    (org) => org.tcg === tcg.value,
                  );

                  return (
                    <TableCell className="text-center" key={tcg.value}>
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{game?.game_id ?? '—'}</span>

                        {isLinked && (
                          <button
                            type="button"
                            title={
                              isOrganizerForTcg
                                ? `Remover como organizador de ${tcg.label}`
                                : `Promover a organizador de ${tcg.label}`
                            }
                            onClick={() =>
                              isOrganizerForTcg
                                ? onDemoteOrganizer(player, tcg.value)
                                : onPromoteOrganizer(player, tcg.value)
                            }
                            className={`rounded p-1 transition ${
                              isOrganizerForTcg
                                ? 'text-primary hover:bg-primary/15'
                                : 'text-muted-foreground hover:bg-accent'
                            }`}
                          >
                            {isOrganizerForTcg ? (
                              <ShieldMinus className="w-4 h-4" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </TableCell>
                  );
                })}

                <TableCell className="text-center">
                  <button
                    onClick={() => {
                      if (isLinked) {
                        onUnlinkPlayer(player);
                      } else {
                        onLinkPlayer(player);
                      }
                    }}
                    className={`px-3 py-1 text-xs font-medium text-white rounded transition ${
                      isLinked
                        ? 'bg-destructive hover:bg-destructive/90'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {isLinked ? 'Desvincular' : 'Vincular'}
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
