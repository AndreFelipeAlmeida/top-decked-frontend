import { useAuthContext } from '@/hooks/authContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useTenant } from '@/hooks/tenantContext.hooks';

type OrganizadorDoTenantAtual = {
  isOrganizador: boolean;
  // TCGs que o jogador organiza especificamente NESTA loja (tenant atual)
  // — vazio sempre que isOrganizador for false.
  tcgs: string[];
  lojaId: number | undefined;
};

export function useOrganizadorDoTenantAtual(): OrganizadorDoTenantAtual {
  const { user } = useAuthContext();
  const { tenant, isTenant } = useTenant();
  const isJogador = user?.tipo === 'jogador';
  const { data: jogador } = useMe(isJogador);

  if (!isTenant || !tenant || !isJogador || !jogador) {
    return { isOrganizador: false, tcgs: [], lojaId: undefined };
  }

  const vinculo = jogador.lojas?.find((loja) => loja.loja.id === tenant.id);
  const tcgs = vinculo?.organizacoes?.map((org) => org.tcg) ?? [];

  return { isOrganizador: tcgs.length > 0, tcgs, lojaId: tenant.id };
}
