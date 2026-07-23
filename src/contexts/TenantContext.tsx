import { createContext } from 'react';
import type { TenantAtual } from '@/types/Tenant';

export type TenantContextType = {
  tenant: TenantAtual | undefined;
  isLoading: boolean;
  isTenant: boolean;
};

export const TenantContext = createContext<TenantContextType | undefined>(undefined);
