import { useQuery } from '@tanstack/react-query';
import { getTenantAtual } from '@/services/tenant.service';
import { TenantContext } from './TenantContext';

type TenantProviderProps = {
  children: React.ReactNode;
};

// BRK-308: consulta GET /tenant/atual uma vez no boot da SPA pra saber se o
// subdomínio atual está travado numa loja — o backend (TenantHostMiddleware)
// é a única fonte de verdade da resolução de Host, o frontend só consome o
// resultado.
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
