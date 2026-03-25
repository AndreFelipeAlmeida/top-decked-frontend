import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import type { JogadorPublico } from "@/types/Player";

type TcgOption = {
    label: string;
    value: string;
};

type Props = {
    players: JogadorPublico[];
    tcgs: TcgOption[];
    page: number;
    isLoading: boolean;
    onLinkPlayer: (player: JogadorPublico) => void;
};

export default function PlayersTable({
    players,
    tcgs,
    page,
    isLoading,
    onLinkPlayer,
}: Props) {
  return (
      <Table className="w-full text-sm">
          <TableHeader className="bg-gray-50 border-b">
              <TableRow>
                  <TableHead className="px-6 py-3 text-center font-bold text-gray-500 uppercase">
                      Numeração
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center font-bold text-gray-500 uppercase">
                      Jogador
                  </TableHead>
                  {tcgs.map((tcg) => (
                      <TableHead
                          key={tcg.value}
                          className="px-6 py-3 text-center font-bold text-gray-500 uppercase"
                      >
                          {tcg.label}
                      </TableHead>
                  ))}
                  <TableHead className="px-6 py-3 text-center font-bold text-gray-500 uppercase">
                      Ações
                  </TableHead>
              </TableRow>
          </TableHeader>

          <TableBody className="divide-y">
              {isLoading && (
                  <TableRow>
                      <TableCell
                          colSpan={3 + tcgs.length}
                          className="text-center py-6"
                      >
                          Carregando...
                      </TableCell>
                  </TableRow>
              )}

              {!isLoading &&
                  players.map((player, index) => {
                      const globalIndex = (page - 1) * 10 + index;

                      return (
                          <TableRow key={player.id}>
                              <TableCell className="text-center">
                                  {globalIndex + 1}
                              </TableCell>
                              <TableCell className="text-center">
                                  {player.nome}
                              </TableCell>

                              {tcgs.map((tcg) => {
                                  const game = player.tcgs?.find(
                                      (g) => g.tcg === tcg.value,
                                  );

                                  return (
                                      <TableCell
                                          className="text-center"
                                          key={tcg.value}
                                      >
                                          {game?.id ?? "—"}
                                      </TableCell>
                                  );
                              })}

                              <TableCell className="text-center">
                                  <button
                                      onClick={() => onLinkPlayer(player)}
                                      className="px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700"
                                  >
                                      Vincular
                                  </button>
                              </TableCell>
                          </TableRow>
                      );
                  })}
          </TableBody>
      </Table>
  );
}
