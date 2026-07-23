import {
  Save,
  Calendar,
  Award,
  Settings,
  Store,
  Plus,
} from 'lucide-react';

import { Navigate, useNavigate } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

import Spinner from '@/components/ui/spinner';
import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTenant } from '@/hooks/tenantContext.hooks';
import { useOrganizadorDoTenantAtual } from '@/hooks/organizadorTenant.hooks';
import {
  useCreateOrganizerTournament,
  useCreateOrganizerTournamentForm,
} from '@/hooks/tournaments.hooks';
import { usePlayerTypesByOrganizer } from '@/hooks/playerTypes.hooks';
import { QuickCreateRuleDialog } from '@/components/organizer/QuickCreateRuleDialog';
import type { CreateOrganizerTournamentForm } from '@/schemas/tournament.schemas';
import type { ApiErrorDetail } from '@/types/Error';

export default function CreateOrganizerTournament() {
  const navigate = useNavigate();
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  const { tenant, isLoading: isTenantLoading } = useTenant();
  const { isOrganizador, tcgs: tcgsOrganizados, lojaId: tenantLojaId } = useOrganizadorDoTenantAtual();
  const mutation = useCreateOrganizerTournament();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useCreateOrganizerTournamentForm();

  const selectedTcg = watch('jogo');
  const hasSelectedStore = Boolean(tenantLojaId);

  const { data: regras, isLoading: isRegrasLoading } = usePlayerTypesByOrganizer(tenantLojaId);

  useEffect(() => {
    if (tenantLojaId) {
      setValue('loja_id', tenantLojaId, { shouldValidate: true });
    }
  }, [tenantLojaId, setValue]);

  if (isTenantLoading) {
    return <Spinner />;
  }

  if (!isOrganizador) {
    return <Navigate to="/jogador/dashboard" replace />;
  }

  const onSubmit = (data: CreateOrganizerTournamentForm) => {
    mutation.mutate(data, {
      onSuccess: (torneio) => {
        navigate(
          `/loja/torneio/${torneio.id}/editar`
        );
      },
      onError: (error) => {
        const detail = axios.isAxiosError<ApiErrorDetail>(error)
          ? error.response?.data?.detail
          : undefined;
        toast.error(typeof detail === 'string' ? detail : 'Erro ao criar torneio.');
      },
    });
  };

  const isRegrasCarregando = isRegrasLoading && hasSelectedStore;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Criar Torneio
        </h1>

        <p className="text-muted-foreground">
          Crie torneios como organizador
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <AppCard title="Loja" icon={<Store className="w-5 h-5" />}>
            <p className="text-sm text-foreground font-medium">{tenant?.nome}</p>
            {errors.loja_id && (
              <p className="text-destructive text-sm mt-1">{errors.loja_id.message}</p>
            )}
          </AppCard>

          {hasSelectedStore && (
            <>
              {/* Informações básicas */}
              <AppCard title="Informações Básicas" icon={<Settings className="w-5 h-5" />}>
                <div className="space-y-4">
                  <div>
                    <input
                      {...register('nome')}
                      placeholder="Nome do torneio"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    {errors.nome && (
                      <p className="text-destructive text-sm mt-1">{errors.nome.message}</p>
                    )}
                  </div>

                  <div>
                    <Controller
                      name="jogo"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um TCG" />
                          </SelectTrigger>
                          <SelectContent>
                            {tcgsOrganizados.map((tcg) => (
                              <SelectItem key={tcg} value={tcg}>
                                {tcg}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.jogo && (
                      <p className="text-destructive text-sm mt-1">{errors.jogo.message}</p>
                    )}
                  </div>
                </div>
              </AppCard>

              {/* Agendamento */}
              <AppCard title="Agendamento" icon={<Calendar className="w-5 h-5" />}>
                <div className="space-y-4">
                  <div>
                    <input
                      type="date"
                      {...register(
                        'data_planejada'
                      )}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    {errors.data_planejada && (
                      <p className="text-destructive text-sm mt-1">{errors.data_planejada.message}</p>
                    )}
                  </div>

                  <input
                    type="time"
                    {...register('hora_planejada')}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </AppCard>
            </>
          )}
        </div>

        {/* Sidebar */}
        {hasSelectedStore && (
          <div className="space-y-6">
            {/* Regras */}
            <AppCard
              title="Regra Básica"
              icon={<Award className="w-5 h-5" />}
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRuleModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Nova Regra
                </Button>
              }
            >
              <Controller
                name="regra_basica_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={isRegrasCarregando}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={isRegrasCarregando ? 'Carregando regras...' : 'Selecione uma regra'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {regras?.map((regra) => (
                        <SelectItem key={regra.id} value={String(regra.id)}>
                          {regra.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {!isRegrasCarregando && !regras?.length && (
                <p className="text-xs text-warning mt-2">
                  Esta loja ainda não tem regras de pontuação cadastradas.
                </p>
              )}

              {errors.regra_basica_id && (
                <p className="text-destructive text-sm mt-1">{errors.regra_basica_id.message}</p>
              )}

              <label className="flex items-center gap-2 text-sm text-foreground font-medium mt-4">
                <input type="checkbox" {...register('conta_em_eventos')} className="rounded border-border" />
                Conta pontos nos Eventos ativos do período
              </label>
            </AppCard>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                mutation.isPending
              }
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />

              <span>
                {mutation.isPending
                  ? 'Criando...'
                  : 'Criar Torneio'}
              </span>
            </button>
          </div>
        )}
      </form>

      {hasSelectedStore && tenantLojaId && (
        <QuickCreateRuleDialog
          open={isRuleModalOpen}
          onOpenChange={setIsRuleModalOpen}
          isJogadorOrganizador
          lojaId={tenantLojaId}
          defaultTcg={selectedTcg}
          onCreated={(regraId) => setValue('regra_basica_id', regraId, { shouldValidate: true })}
        />
      )}
    </div>
  );
}
