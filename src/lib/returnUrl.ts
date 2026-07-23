import { ROOT_DOMAIN } from './rootDomain';

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

  const caminho = url.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  if (caminho === '/login') return null;

  return url.toString();
}
