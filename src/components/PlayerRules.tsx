import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog.tsx';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { tournamentStore, PlayerRule } from '../data/store.ts';
import { toast } from 'sonner';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface PlayerRulesProps {
  onNavigate: (page: Page) => void;
  currentUser: any;
}

interface PlayerRuleFormData {
  typeName: string;
  pointsForWin: number;
  pointsForLoss: number;
  pointsGivenToOpponent: number;
  pointsLostByOpponent: number;
}

export function PlayerRules({ onNavigate }: PlayerRulesProps) {
  const [playerRules, setPlayerRules] = useState<PlayerRule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PlayerRule | null>(null);
  const [formData, setFormData] = useState<PlayerRuleFormData>({
    typeName: '',
    pointsForWin: 3,
    pointsForLoss: 0,
    pointsGivenToOpponent: 0,
    pointsLostByOpponent: 0
  });

  const currentUser = tournamentStore.getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      const rules = tournamentStore.getPlayerRulesByOrganizer(currentUser.id);
      setPlayerRules(rules);
    }
  }, [currentUser]);

  const resetForm = () => {
    setFormData({
      typeName: '',
      pointsForWin: 3,
      pointsForLoss: 0,
      pointsGivenToOpponent: 0,
      pointsLostByOpponent: 0
    });
    setEditingRule(null);
  };

  const openEditForm = (rule: PlayerRule) => {
    setFormData({
      typeName: rule.typeName,
      pointsForWin: rule.pointsForWin,
      pointsForLoss: rule.pointsForLoss,
      pointsGivenToOpponent: rule.pointsGivenToOpponent,
      pointsLostByOpponent: rule.pointsLostByOpponent
    });
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Você deve estar logado para gerenciar as regras de jogadores');
      return;
    }

    if (!formData.typeName.trim()) {
      toast.error('O nome do tipo é obrigatório');
      return;
    }

    try {
      if (editingRule) {
        // Update existing rule
        const updatedRule = tournamentStore.updatePlayerRule(editingRule.id, formData);
        if (updatedRule) {
          const updatedRules = playerRules.map(rule => 
            rule.id === editingRule.id ? updatedRule : rule
          );
          setPlayerRules(updatedRules);
          toast.success('Regra do jogador atualizada com sucesso');
        } else {
          toast.error('Falha ao atualizar a regra do jogador');
        }
      } else {
        // Create new rule
        const newRule = tournamentStore.createPlayerRule({
          ...formData,
          organizerId: currentUser.id
        });
        setPlayerRules([...playerRules, newRule]);
        toast.success('Regra do jogador criada com sucesso');
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Ocorreu um erro ao salvar a regra do jogador');
    }
  };

  const handleDelete = (ruleId: string) => {
    const success = tournamentStore.deletePlayerRule(ruleId);
    if (success) {
      setPlayerRules(playerRules.filter(rule => rule.id !== ruleId));
      toast.success('Regra do jogador excluída com sucesso');
    } else {
      toast.error('Falha ao excluir a regra do jogador');
    }
  };

  const formatScoringRule = (rule: PlayerRule) => {
    let description = `Vitória: ${rule.pointsForWin} pontos, Derrota: ${rule.pointsForLoss} pontos`;
    
    if (rule.pointsGivenToOpponent > 0) {
      description += `, Pontos dados ao oponente (se o oponente vencer): ${rule.pointsGivenToOpponent}`;
    } else {
      description += `, Pontos dados ao oponente (se o oponente vencer): 0`;
    }
    
    if (rule.pointsLostByOpponent > 0) {
      description += `, Pontos perdidos pelo oponente (se o oponente perder): ${rule.pointsLostByOpponent}`;
    } else {
      description += `, Pontos perdidos pelo oponente (se o oponente perder): 0`;
    }
    
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
                  <Label htmlFor="typeName">Nome do Tipo</Label>
                  <Input
                    id="typeName"
                    value={formData.typeName}
                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                    placeholder="e.g., Equipe Rocket"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pointsForWin">Pontos por Vitória</Label>
                    <Input
                      id="pointsForWin"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pointsForWin}
                      onChange={(e) => setFormData({ ...formData, pointsForWin: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pointsForLoss">Pontos por Derrota</Label>
                    <Input
                      id="pointsForLoss"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pointsForLoss}
                      onChange={(e) => setFormData({ ...formData, pointsForLoss: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="pointsGivenToOpponent">Pontos dados ao oponente (se o oponente vencer)</Label>
                  <Input
                    id="pointsGivenToOpponent"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.pointsGivenToOpponent}
                    onChange={(e) => setFormData({ ...formData, pointsGivenToOpponent: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="pointsLostByOpponent">Pontos perdidos pelo oponente (se o oponente perder)</Label>
                  <Input
                    id="pointsLostByOpponent"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.pointsLostByOpponent}
                    onChange={(e) => setFormData({ ...formData, pointsLostByOpponent: parseFloat(e.target.value) || 0 })}
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
                      <Badge variant="secondary">Regra personalizada</Badge>
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
