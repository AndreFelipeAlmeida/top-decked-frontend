import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

import { useState } from 'react';
import type { CreditoPublico } from '@/types/Credito';


type Props = {
  value: number | null;
  players: CreditoPublico[];
  search: string;
  onSearchChange: (value: string) => void;
  onChange: (playerId: number | null) => void;
};

export default function PlayerSelect({
  value,
  players,
  search,
  onSearchChange,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Command>
        <CommandInput
          disabled={!!value}
          placeholder="Buscar jogador..."
          value={search}
          onValueChange={(val) => {
            onSearchChange(val);
            setOpen(true);
          }}
          onFocus={() => {
            if (!value) {
              setOpen(true);
            }
          }}
        />

        {open && (
          <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
            <CommandEmpty className="p-2 text-sm text-gray-500">
              Nenhum jogador encontrado.
            </CommandEmpty>

            <CommandGroup className="max-h-60 overflow-y-auto">
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  onSelect={() => {
                    onChange(player.id);
                    setOpen(false);
                  }}
                  className="flex justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {player.jogador?.nome ?? '--'}
                    </span>

                    <span className="text-xs text-gray-500">
                      {player.apelido ?? '--'}
                    </span>
                  </div>

                  <span className="text-xs text-gray-400">
                    {player.game_id ?? '--'}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        )}
      </Command>
    </div>
  );
}