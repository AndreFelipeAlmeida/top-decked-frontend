import { useQuery } from '@tanstack/react-query';
import { getTenantAtual } from '@/services/tenant.service';
import { TenantContext } from './TenantContext';

type TenantProviderProps = {
  children: React.ReactNode;
};

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', 'atual'],
    queryFn: getTenantAtual,
    staleTime: Infinity,
    retry: false,
  });

  return (
    <TenantContext.Provider value={{ tenant, isLoading, isTenant: Boolean(tenant) }}>
      {children}
    </TenantContext.Provider>
  );
};
