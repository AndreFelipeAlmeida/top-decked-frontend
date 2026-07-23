import { useMemo, useState } from 'react';
import { ExternalLink, MapPin, Search, ShieldCheck, Store, Trophy } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { useStores } from '@/hooks/store.hooks';
import { ROOT_DOMAIN, ROOT_DOMAIN_PROTOCOLO } from '@/lib/rootDomain';
import { nomeDoJogo } from '@/lib/tcgGames';

const urlDaLoja = (slug: string) => {
  const porta = window.location.port ? `:${window.location.port}` : '';
  return `${ROOT_DOMAIN_PROTOCOLO}://${slug}.${ROOT_DOMAIN}${porta}`;
};

export default function StoresDirectory() {
  const { data: lojas, isLoading } = useStores();
  const [busca, setBusca] = useState('');

  const lojasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return lojas ?? [];
    return (lojas ?? []).filter((loja) => loja.nome.toLowerCase().includes(termo));
  }, [lojas, busca]);

  if (isLoading) return <Spinner />;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground font-bold">Lojas</h1>
        <p className="text-muted-foreground">
          Sites das lojas. Se quiser observar apenas as coisas daquela loja, você, além de poder
          filtrar, pode acessar a página dela diretamente!
        </p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Filtrar por nome da loja"
          className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {lojasFiltradas.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhuma loja encontrada com os filtros selecionados.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lojasFiltradas.map((loja) => {
            const souOrganizador = loja.tcgs_organizados.length > 0;

            return (
              <div
                key={loja.id}
                className={`bg-card rounded-lg shadow p-5 flex flex-col gap-3 border-2 ${
                  souOrganizador ? 'border-primary/50' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Store className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="text-lg font-bold text-foreground truncate">{loja.nome}</h3>
                  </div>
                  {souOrganizador && (
                    <Badge className="shrink-0 gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Organizador
                    </Badge>
                  )}
                </div>

                {loja.endereco && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{loja.endereco}</span>
                  </p>
                )}

                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="w-4 h-4 shrink-0" />
                  {loja.n_torneios} {loja.n_torneios === 1 ? 'torneio finalizado' : 'torneios finalizados'}
                </p>

                {souOrganizador && (
                  <p className="text-xs text-primary">
                    Você é organizador nessa loja em tais jogos:{' '}
                    {loja.tcgs_organizados.map((tcg) => nomeDoJogo(tcg)).join(', ')}
                  </p>
                )}

                <a
                  href={urlDaLoja(loja.slug)}
                  className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary/90"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ir para o site
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
