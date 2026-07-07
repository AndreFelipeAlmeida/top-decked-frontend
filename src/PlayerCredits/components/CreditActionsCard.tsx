import { MinusCircle, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useCreditActions } from '@/hooks/credits.hooks';

type Props = {
  creditId?: number;
};

export default function CreditActionsCard({ creditId }: Props) {
  const [value, setValue] = useState('');

  const { addCreditsMutation, removeCreditsMutation } = useCreditActions({
    jogadorId: creditId ?? 0,
  });

  const disabled =
    !creditId ||
    !value ||
    addCreditsMutation.isPending ||
    removeCreditsMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Valor
        </label>

        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="R$ 0,00"
          className="mb-3 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              addCreditsMutation.mutate(Number(value), {
                onSuccess: () => setValue(''),
              });
            }}
            className="flex items-center justify-center gap-2 rounded-md bg-success px-3 py-2 text-xs font-medium text-white transition hover:bg-success/90 disabled:opacity-50"
          >
            <PlusCircle className="h-4 w-4" />
            {addCreditsMutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              removeCreditsMutation.mutate(Number(value), {
                onSuccess: () => setValue(''),
              });
            }}
            className="flex items-center justify-center gap-2 rounded-md bg-destructive px-3 py-2 text-xs font-medium text-white transition hover:bg-destructive/90 disabled:opacity-50"
          >
            <MinusCircle className="h-4 w-4" />
            {removeCreditsMutation.isPending ? 'Retirando...' : 'Retirar'}
          </button>
        </div>
      </div>
    </div>
  );
}
