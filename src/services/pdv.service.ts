import { api } from '@/adapters/api';

export type CheckoutPayload = {
  jogador_id: number | null;
  itens: Array<{ item_id: number; quantidade: number }>;
  abater_creditos: boolean;
};

export type CheckoutResultado = {
  transacao_id: number;
  total: number;
  credito_utilizado: number;
  saldo_credito_restante: number;
  valor_pago_dinheiro: number;
};

export const checkoutVenda = async (
  payload: CheckoutPayload,
): Promise<CheckoutResultado> => {
  const response = await api.post<CheckoutResultado>(
    '/lojas/pdv/checkout',
    payload,
  );
  return response.data;
};
