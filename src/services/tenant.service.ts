import { api } from '@/adapters/api';
import type { TenantAtual } from '@/types/Tenant';

export const getTenantAtual = async (): Promise<TenantAtual> => {
  const response = await api.get<TenantAtual>('/tenant/atual');
  return response.data;
};
