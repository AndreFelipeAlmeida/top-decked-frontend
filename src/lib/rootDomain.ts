export const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'brickei.com.br';

// Nenhum dos domínios de teste local tem certificado HTTPS válido — só
// brickei.com.br (produção, atrás de TLS de verdade) usa https.
export const ROOT_DOMAIN_PROTOCOLO =
  ROOT_DOMAIN.startsWith('localhost') ||
  ROOT_DOMAIN.startsWith('127.0.0.1') ||
  ROOT_DOMAIN === 'localtest.me'
    ? 'http'
    : 'https';
