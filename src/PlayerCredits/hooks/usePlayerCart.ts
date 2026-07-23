// hooks/usePlayerCart.ts
import { useMemo, useState } from 'react';

export type CartItem = {
  id: number;
  nome: string;
  categoria: number;
  preco: number;
  quantidade: number;
};

export function usePlayerCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantidade: cartItem.quantidade + 1,
              }
            : cartItem,
        );
      }

      return [...prev, { ...item, quantidade: 1 }];
    });
  };

  const removeItem = (itemId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantidade } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.preco * item.quantidade, 0),
    [items],
  );

  return {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
