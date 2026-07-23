import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { LojaJogadorPublico } from '@/types/Credito';
import type { CartItem } from '../hooks/usePlayerCart';
import { useCheckout } from '../hooks/useCheckout';

type Props = {
  player: LojaJogadorPublico;
  items: CartItem[];
  total: number;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
};

export default function CheckoutCard({ player, items, total, removeItem, clearCart }: Props) {
  const [abaterCreditos, setAbaterCreditos] = useState(false);
  const checkoutMutation = useCheckout();

  const resumo = useMemo(() => {
    const saldo = player.creditos;
    const creditoUtilizado = abaterCreditos ? Math.min(saldo, total) : 0;
    const saldoRestante = saldo - creditoUtilizado;
    const valorPagoDinheiro = total - creditoUtilizado;
    return { creditoUtilizado, saldoRestante, valorPagoDinheiro };
  }, [abaterCreditos, total, player.creditos]);

  const handleCheckout = () => {
    checkoutMutation.mutate(
      {
        jogador_id: player.jogador_id,
        itens: items.map((item) => ({ item_id: item.id, quantidade: item.quantidade })),
        abater_creditos: abaterCreditos,
      },
      { onSuccess: () => clearCart() },
    );
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Carrinho vazio. Adicione itens na vitrine de produtos.
        </div>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{item.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantidade} x R$ {item.preco.toFixed(2)}
                </p>
              </div>

              <span className="shrink-0 font-medium text-foreground">
                R$ {(item.preco * item.quantidade).toFixed(2)}
              </span>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                title="Remover do carrinho"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-foreground">
        <span>Total</span>
        <span>R$ {total.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <label className="text-sm font-medium text-foreground">
            Abater usando Créditos
          </label>
          <p className="text-xs text-muted-foreground">
            Saldo disponível: R$ {player.creditos.toFixed(2)}
          </p>
        </div>
        <Switch checked={abaterCreditos} onCheckedChange={setAbaterCreditos} />
      </div>

      {abaterCreditos && (
        <div className="space-y-1 rounded-lg bg-muted/40 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Créditos utilizados</span>
            <span className="font-medium text-foreground">
              R$ {resumo.creditoUtilizado.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Saldo restante após a venda</span>
            <span className="font-medium text-foreground">
              R$ {resumo.saldoRestante.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg bg-brand-gradient p-3 text-white">
        <span className="text-sm font-medium">A pagar em dinheiro</span>
        <span className="text-xl font-semibold">
          R$ {resumo.valorPagoDinheiro.toFixed(2)}
        </span>
      </div>

      <Button
        className="w-full"
        disabled={items.length === 0 || checkoutMutation.isPending}
        onClick={handleCheckout}
      >
        Finalizar Venda
      </Button>
    </div>
  );
}
