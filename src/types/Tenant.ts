import type { LojaPublico } from './Store';

// null = modo global (domínio raiz) — GET /tenant/atual (BRK-308).
export type TenantAtual = LojaPublico | null;
