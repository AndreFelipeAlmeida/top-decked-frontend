import { useAuthContext } from '@/hooks/authContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useTenant } from '@/hooks/tenantContext.hooks';

type OrganizadorDoTenantAtual = {
  // BRK-402 "Regra de Ouro": o papel de Organizador só existe dentro do
  // subdomínio da própria loja organizada — nunca no domínio raiz, e nunca
  // no subdomínio de OUTRA loja que o jogador não organiza (ele pode ser
  // organizador da Loja A e ao mesmo tempo só um cliente comum da Loja B;
  // navegar em b.brickei.com.br não pode vazar permissões de organizador
  // da Loja A). Por isso a checagem sempre cruza o tenant atual com os
  // vínculos do próprio jogador, nunca "organiza em algum lugar" sozinho.
  isOrganizador: boolean;
  // TCGs que o jogador organiza especificamente NESTA loja (tenant atual)
  // — vazio sempre que isOrganizador for false.
  tcgs: string[];
  // Id da loja do tenant atual, já convertido pro tipo que os formulários
  // esperam (loja_id) — undefined fora de um tenant. Substitui os selects
  // de "Escolha a loja" nos formulários quando dentro de um subdomínio
  // (BRK-401): a loja já está implícita no Host, não precisa perguntar.
  lojaId: number | undefined;
};

// BRK-402: fonte única de verdade pra "esse jogador pode agir como
// organizador AQUI" — combina o tenant atual (Host resolvido pelo backend,
// via TenantHostMiddleware/GET tenant/atual) com os vínculos reais do
// jogador (GET /jogadores/me). Não existe um "é organizador" genérico e
// independente de loja: é sempre relativo à loja do subdomínio atual.
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
