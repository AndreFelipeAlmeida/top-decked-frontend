import { createContext } from 'react';
import type { TenantAtual } from '@/types/Tenant';

export type TenantContextType = {
  // undefined = ainda carregando (GET /tenant/atual em andamento no boot
  // da SPA); null = modo global confirmado; LojaPublico = travado num
  // subdomínio de loja (BRK-308).
  tenant: TenantAtual | undefined;
  isLoading: boolean;
  // BRK-402: atalho pra "estamos travados num subdomínio de loja" — false
  // tanto no modo global quanto enquanto isLoading. Fonte única de verdade
  // pra qualquer regra de "isso só existe dentro de um tenant" (ver
  // useIsTenant()/useOrganizadorDoTenantAtual()).
  isTenant: boolean;
};

export const TenantContext = createContext<TenantContextType | undefined>(undefined);
