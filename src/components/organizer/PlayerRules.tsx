import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  usePlayerTypes,
  useCreatePlayerType,
  useUpdatePlayerType,
  useDeletePlayerType,
} from '@/hooks/playerTypes.hooks';
import { playerTypeSchema, parseNumeroComVirgula, type PlayerTypeForm } from '@/schemas/playerType.schemas';
import type { TipoJogadorPublico } from '@/types/Player';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import {
  oponenteGanhaTooltip,
  oponenteEmpataTooltip,
  oponentePerdeTooltip,
} from '@/lib/playerTypeTooltips';

const emptyRule: PlayerTypeForm = {
  nome: '',
  pt_vitoria: 3,
  pt_derrota: 0,
  pt_empate: 1,
  pt_oponente_perde: 0,
  pt_oponente_ganha: 0,
  pt_oponente_empate: 0,
  tcg: 'POKEMON',
};

export default function PlayerRules() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset } = useForm<PlayerTypeForm>({
    resolver: zodResolver(playerTypeSchema),
    defaultValues: emptyRule,
  });

  const { data: ruleSets, isLoading } = usePlayerTypes();

  const createMutation = useCreatePlayerType();
  const updateMutation = useUpdatePlayerType();
  const deleteMutation = useDeletePlayerType();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleEdit = (rule: TipoJogadorPublico) => {
    reset({
      nome: rule.nome,
      pt_vitoria: rule.pt_vitoria,
      pt_derrota: rule.pt_derrota,
      pt_empate: rule.pt_empate,
      pt_oponente_perde: rule.pt_oponente_perde || 0,
      pt_oponente_ganha: rule.pt_oponente_ganha || 0,
      pt_oponente_empate: rule.pt_oponente_empate || 0,
      tcg: rule.tcg,
    });
    setEditingId(rule.id);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    reset(emptyRule);
  };

  const onSubmit = (data: PlayerTypeForm) => {
    const mutation = editingId
      ? updateMutation.mutateAsync({ id: editingId, dados: data })
      : createMutation.mutateAsync(data);

    mutation.then(handleCancel);
  };

  return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 text-foreground">Regras de Jogador e Pontuação</h1>
            <p className="text-muted-foreground">Defina sistemas de pontuação personalizados para seus torneios</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Conjunto de Regras</span>
          </button>
        </div>

        {(isCreating || editingId) && (
          <div className="bg-card rounded-lg shadow-lg p-6 mb-8 border-2 border-primary">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-foreground font-bold">
                {isCreating ? 'Novo Conjunto de Regras' : 'Editar Regras'}
              </h2>
              <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Nome do Conjunto de Regras</label>
                <input
                  type="text"
                  {...register('nome')}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Liga Commander, Evento Mensal"
                />
              </div>

              <div>
                <h3 className="text-lg mb-3 text-foreground font-bold">Valores de Pontuação</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Vitória</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register('pt_vitoria', { setValueAs: parseNumeroComVirgula })}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Derrota</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register('pt_derrota', { setValueAs: parseNumeroComVirgula })}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Empate</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register('pt_empate', { setValueAs: parseNumeroComVirgula })}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg mb-3 text-foreground font-bold">Bônus de Oponente (Especial)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1 text-sm mb-2 text-muted-foreground">
                      Oponente Ganha
                      <InfoTooltip text={oponenteGanhaTooltip} />
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register('pt_oponente_ganha', { setValueAs: parseNumeroComVirgula })}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-sm mb-2 text-muted-foreground">
                      Oponente Perde
                      <InfoTooltip text={oponentePerdeTooltip} />
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register('pt_oponente_perde', { setValueAs: parseNumeroComVirgula })}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-sm mb-2 text-muted-foreground">
                      Oponente Empata
                      <InfoTooltip text={oponenteEmpataTooltip} />
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register('pt_oponente_empate', { setValueAs: parseNumeroComVirgula })}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-primary/40"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Conjunto de Regras'}</span>
                </button>
                <button type="button" onClick={handleCancel} className="px-6 py-2 border border-border rounded-lg text-muted-foreground hover:bg-accent">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            {[0, 1].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow p-6 border-l-4 border-border h-40" />
            ))}
          </div>
        )}

        {!isLoading && !ruleSets?.length && (
          <div className="bg-card rounded-lg shadow p-8 text-center text-muted-foreground">
            Nenhum conjunto de regras cadastrado ainda. Crie o primeiro clicando em "Criar Conjunto de Regras".
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ruleSets?.map((ruleSet) => (
            <div key={ruleSet.id} className="bg-card rounded-lg shadow p-6 border-l-4 border-primary">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl text-foreground font-bold">{ruleSet.nome}</h3>
                  <p className="text-xs text-primary font-semibold">{ruleSet.tcg}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEdit(ruleSet)} className="text-primary hover:text-primary">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => confirm('Excluir esta regra?') && deleteMutation.mutate(ruleSet.id)} 
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-success/15 rounded-lg">
                  <div className="text-2xl text-success font-bold">{ruleSet.pt_vitoria}</div>
                  <div className="text-xs text-muted-foreground">Vitória</div>
                </div>
                <div className="text-center p-3 bg-muted/40 rounded-lg">
                  <div className="text-2xl text-muted-foreground font-bold">{ruleSet.pt_empate}</div>
                  <div className="text-xs text-muted-foreground">Empate</div>
                </div>
                <div className="text-center p-3 bg-destructive/15 rounded-lg">
                  <div className="text-2xl text-destructive font-bold">{ruleSet.pt_derrota}</div>
                  <div className="text-xs text-muted-foreground">Derrota</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}