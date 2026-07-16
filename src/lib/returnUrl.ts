import { ROOT_DOMAIN } from './rootDomain';

// BRK-404: valida o parâmetro ?returnUrl antes de qualquer redirecionamento
// de volta pós-login (SSO centralizado no domínio raiz) — nunca confie
// cegamente nele, é um Open Redirect clássico (o link de login pode ter
// sido compartilhado por qualquer um). A checagem certa é sempre sobre o
// HOSTNAME de verdade, via URL — nunca um endsWith() na string bruta do
// parâmetro inteiro: algo como "https://evil.com/#.brickei.com.br" TERMINA
// com a string certa, mas aponta pro host errado; só parseando a URL e
// olhando o campo hostname isso fica seguro.
export function validarReturnUrl(returnUrl: string | null | undefined): string | null {
  if (!returnUrl) return null;

  let url: URL;
  try {
    url = new URL(returnUrl);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const host = url.hostname.toLowerCase();
  const dominioRaiz = ROOT_DOMAIN.toLowerCase();
  const ehDominioRaizOuSubdominio = host === dominioRaiz || host.endsWith(`.${dominioRaiz}`);
  if (!ehDominioRaizOuSubdominio) return null;

  // BRK-405: um returnUrl apontando de volta pro próprio /login não é uma
  // "intenção de subdomínio" de verdade — é lixo (ex.: sobrou de um logout
  // que não limpou a URL direito antes desta correção). Nunca vale a pena
  // "voltar" pra uma página de login.
  const caminho = url.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  if (caminho === '/login') return null;

  return url.toString();
}
