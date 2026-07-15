import { createContext } from 'react';
import type { TenantAtual } from '@/types/Tenant';

export type TenantContextType = {
  // undefined = ainda carregando (GET /tenant/atual em andamento no boot
  // da SPA); null = modo global confirmado; LojaPublico = travado num
  // subdomínio de loja (BRK-308).
  tenant: TenantAtual | undefined;
  isLoading: boolean;
};

export const TenantContext = createContext<TenantContextType | undefined>(undefined);
