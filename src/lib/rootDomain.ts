// BRK-307/308: mesmo valor de app.core.config.settings.ROOT_DOMAIN no
// backend — usado só pra montar a URL de redirect pós-login
// (window.location.href = `${PROTOCOLO}://{slug}.${ROOT_DOMAIN}/...`). A
// extração do slug a partir do Host em si é sempre feita pelo backend
// (TenantHostMiddleware); o frontend nunca duplica essa lógica via regex.
//
// Configurável via VITE_ROOT_DOMAIN (.env) pra testar multi-tenancy por
// subdomínio localmente, ex.: VITE_ROOT_DOMAIN=localtest.me — nesse caso
// evolutiongames.localtest.me funciona como subdomínio de verdade
// (localtest.me é um domínio público real cujos subdomínios resolvem todos
// pra 127.0.0.1, sem precisar editar /etc/hosts). Não usar "localhost" aqui:
// browsers Chromium não compartilham o cookie de sessão entre subdomínios
// de ".localhost" (não tem uma registrable domain de verdade por trás), o
// login numa loja em {slug}.localhost nunca ficaria autenticado. Ver
// docs/tcc/MULTI_TENANCY.md.
export const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'brickei.com.br';

// Nenhum dos domínios de teste local tem certificado HTTPS válido — só
// brickei.com.br (produção, atrás de TLS de verdade) usa https.
export const ROOT_DOMAIN_PROTOCOLO =
  ROOT_DOMAIN.startsWith('localhost') ||
  ROOT_DOMAIN.startsWith('127.0.0.1') ||
  ROOT_DOMAIN === 'localtest.me'
    ? 'http'
    : 'https';
