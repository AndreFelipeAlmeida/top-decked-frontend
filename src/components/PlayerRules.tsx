import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog.tsx';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Adicionadas interfaces do backend
interface TipoJogadorPublico {
  id: number;
  nome: string;
  pt_vitoria: number;
  pt_derrota: number;
  pt_empate: number;
  pt_oponente_perde: number;
  pt_oponente_ganha: number;
  pt_oponente_empate: number;
  loja: number;
  tcg: string;
}

interface PlayerRule {
  id: number;
  typeName: string;
  pointsForWin: number;
  pointsForLoss: number;
  pointsForDraw: number;
  pointsGivenToOpponent: number;
  pointsLostByOpponent: number;
  pointsGivenToOpponentOnDraw: number;
  tcg: string;
}

interface PlayerRuleFormData {
  nome: string;
  pt_vitoria: number;
  pt_derrota: number;
  pt_empate: number;
  pt_oponente_ganha: number;
  pt_oponente_perde: number;
  pt_oponente_empate: number;
  tcg: string;
}

const mapBackendToFrontendRule = (backendRule: TipoJogadorPublico): PlayerRule => {
  return {
    id: backendRule.id,
    typeName: backendRule.nome,
    pointsForWin: backendRule.pt_vitoria,
    pointsForLoss: backendRule.pt_derrota,
    pointsForDraw: backendRule.pt_empate,
    pointsGivenToOpponent: backendRule.pt_oponente_ganha,
    pointsLostByOpponent: backendRule.pt_oponente_perde,
    pointsGivenToOpponentOnDraw: backendRule.pt_oponente_empate,
    tcg: backendRule.tcg,
  };
};

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface PlayerRulesProps {
  onNavigate: (page: Page) => void;
  currentUser: any;
}

export function PlayerRules({ onNavigate }: PlayerRulesProps) {
  const [playerRules, setPlayerRules] = useState<PlayerRule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PlayerRule | null>(null);
  const [formData, setFormData] = useState<PlayerRuleFormData>({
    nome: '',
    pt_vitoria: 3,
    pt_derrota: 0,
    pt_empate: 1,
    pt_oponente_ganha: 0,
    pt_oponente_perde: 0,
    pt_oponente_empate: 0,
    tcg: ''
  });

  const currentUser = { id: 1, type: 'organizer' };

  const fetchRules = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Token de acesso não encontrado. Faça o login novamente.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/lojas/tipoJogador/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: TipoJogadorPublico[] = await response.json();
        setPlayerRules(data.map(mapBackendToFrontendRule));
      } else if (response.status === 404) {
        setPlayerRules([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao buscar as regras de jogador.');
      }
    } catch (error) {
      console.error('Erro ao buscar regras:', error);
    }
  };

  useEffect(() => {
    if (currentUser?.type === 'organizer') {
      fetchRules();
    }
  }, [currentUser]);

  const resetForm = () => {
    setFormData({
      nome: '',
      pt_vitoria: 3,
      pt_derrota: 0,
      pt_empate: 1,
      pt_oponente_ganha: 0,
      pt_oponente_perde: 0,
      pt_oponente_empate: 0,
      tcg: ''
    });
    setEditingRule(null);
  };

  const openEditForm = (rule: PlayerRule) => {
    setFormData({
      nome: rule.typeName,
      pt_vitoria: rule.pointsForWin,
      pt_derrota: rule.pointsForLoss,
      pt_empate: rule.pointsForDraw,
      pt_oponente_ganha: rule.pointsGivenToOpponent,
      pt_oponente_perde: rule.pointsLostByOpponent,
      pt_oponente_empate: rule.pointsGivenToOpponentOnDraw,
      tcg: rule.tcg,
    });
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Você deve estar logado para gerenciar as regras de jogadores');
      return;
    }

    if (!formData.nome.trim()) {
      toast.error('O nome do tipo é obrigatório');
      return;
    }

    if (!formData.tcg.trim()) {
      toast.error('O TCG é obrigatório');
      return;
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Token de acesso não encontrado. Faça o login novamente.');
      return;
    }

    try {
      if (editingRule) {
        // Lógica de atualização (PUT)
        const response = await fetch(`http://localhost:8000/lojas/tipoJogador/${editingRule.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('Regra do jogador atualizada com sucesso');
          setIsFormOpen(false);
          resetForm();
          fetchRules();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao atualizar a regra do jogador');
        }
      } else {
        // Lógica de criação (POST)
        const response = await fetch('http://localhost:8000/lojas/tipoJogador/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('Regra do jogador criada com sucesso');
          setIsFormOpen(false);
          resetForm();
          fetchRules();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao criar a regra do jogador');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar a regra:', error);
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async (ruleId: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Token de acesso não encontrado. Faça o login novamente.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/lojas/tipoJogador/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Regra do jogador excluída com sucesso');
        try {
          console.log("Chamando fetchRules() após exclusão bem-sucedida...");
          await fetchRules();
          console.log("fetchRules() concluído.");
        } catch (reloadError) {
          console.error("Falha ao recarregar a lista de regras após a exclusão:", reloadError);
          toast.error("Falha ao recarregar a lista após exclusão.");
        }
      
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao excluir a regra do jogador');
      }
    } catch (error) {
      console.error('Erro ao excluir regra:', error);
      toast.error((error as Error).message);
    }
  };

  const formatScoringRule = (rule: PlayerRule) => {
    let description = `Vitória: ${rule.pointsForWin} pontos, Derrota: ${rule.pointsForLoss} pontos, Empate: ${rule.pointsForDraw} pontos`;
    description += `, Pontos dados ao oponente (se o oponente vencer): ${rule.pointsGivenToOpponent}`;
    description += `, Pontos perdidos pelo oponente (se o oponente perder): ${rule.pointsLostByOpponent}`;
    description += `, Pontos dados ao oponente (se o oponente empatar): ${rule.pointsGivenToOpponentOnDraw}`;
    
    return description;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('organizer-dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar Para o Painel</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Regras de Jogadores</h1>
            <p className="text-muted-foreground">Gerencie regras de pontuação personalizadas para diferentes tipos de jogadores em seus torneios.</p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Novo Tipo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Editar Tipo de Jogador' : 'Adicionar Novo Tipo de Jogador'}
                </DialogTitle>
                <DialogDescription>
                Crie regras de pontuação personalizadas para diferentes tipos de jogadores em seus torneios.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="nome">Nome do Tipo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="e.g., Equipe Rocket"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pt_vitoria">Pontos por Vitória</Label>
                    <Input
                      id="pt_vitoria"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pt_vitoria}
                      onChange={(e) => setFormData({ ...formData, pt_vitoria: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pt_derrota">Pontos por Derrota</Label>
                    <Input
                      id="pt_derrota"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pt_derrota}
                      onChange={(e) => setFormData({ ...formData, pt_derrota: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="pt_empate">Pontos por Empate</Label>
                    <Input
                      id="pt_empate"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pt_empate}
                      onChange={(e) => setFormData({ ...formData, pt_empate: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="pt_oponente_ganha">Pts. Oponente (Vitória)</Label>
                    <Input
                      id="pt_oponente_ganha"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pt_oponente_ganha}
                      onChange={(e) => setFormData({ ...formData, pt_oponente_ganha: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="pt_oponente_perde">Pts. Oponente (Derrota)</Label>
                    <Input
                      id="pt_oponente_perde"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pt_oponente_perde}
                      onChange={(e) => setFormData({ ...formData, pt_oponente_perde: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="pt_oponente_empate">Pts. Oponente (Empate)</Label>
                    <Input
                      id="pt_oponente_empate"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pt_oponente_empate}
                      onChange={(e) => setFormData({ ...formData, pt_oponente_empate: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tcg">TCG</Label>
                  <Input
                    id="tcg"
                    value={formData.tcg}
                    onChange={(e) => setFormData({ ...formData, tcg: e.target.value })}
                    placeholder="e.g., Magic: The Gathering"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingRule ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {playerRules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhuma regra de jogador foi criada ainda.</p>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setIsFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crie sua primeira regra de jogador
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {playerRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{rule.typeName}</h3>
                      <Badge variant="secondary">{rule.tcg}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatScoringRule(rule)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(rule)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Editar</span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Excluir</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Regra de Jogador</AlertDialogTitle>
                          <AlertDialogDescription>
                          Tem certeza de que deseja excluir a regra do jogador "{rule.typeName}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(rule.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}