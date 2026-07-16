import { useContext } from 'react';
import { TenantContext } from '@/contexts/TenantContext';

export const useTenant = () => {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }

  return context;
};

// BRK-402: atalho pra quem só precisa do booleano (a maioria dos usos) sem
// desestruturar o resto do contexto.
export const useIsTenant = () => useTenant().isTenant;
