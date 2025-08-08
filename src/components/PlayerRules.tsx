import React, { useState, useEffect } from 'react';
import { Card, CardContent} from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog.tsx';
import { Plus, Edit, Trash2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { tournamentStore, PlayerRule } from '../data/store.ts';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'player-rules';

interface PlayerRulesProps {
  onNavigate: (page: Page) => void;
  currentUser: any;
}

interface PlayerRuleFormData {
  typeName: string;
  pointsForWin: number;
  pointsForLoss: number;
  pointsForTie: number;
  pointsGivenToOpponent: number;
  pointsLostByOpponent: number;
  pointsToOpponentOnTie: number;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

const MessageBox = ({ type, text, onClose }: { type: 'success' | 'error', text: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === 'success' 
    ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
    : <XCircle className="h-5 w-5 text-red-500" />;

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
      {icon}
      <p className="text-sm font-medium text-gray-800">{text}</p>
    </div>
  );
};

export function PlayerRules({ onNavigate }: PlayerRulesProps) {
  const [playerRules, setPlayerRules] = useState<PlayerRule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PlayerRule | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [formMessage, setFormMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<PlayerRuleFormData>({
    typeName: '',
    pointsForWin: 3,
    pointsForLoss: 0,
    pointsForTie: 1,
    pointsGivenToOpponent: 0,
    pointsLostByOpponent: 0,
    pointsToOpponentOnTie: 0
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
      pointsForTie: 1,
      pointsGivenToOpponent: 0,
      pointsLostByOpponent: 0,
      pointsToOpponentOnTie: 0
    });
    setEditingRule(null);
    setFormMessage(null);
  };

  const openEditForm = (rule: PlayerRule) => {
    setFormData({
      typeName: rule.typeName,
      pointsForWin: rule.pointsForWin,
      pointsForLoss: rule.pointsForLoss,
      pointsForTie: rule.pointsForTie,
      pointsGivenToOpponent: rule.pointsGivenToOpponent,
      pointsLostByOpponent: rule.pointsLostByOpponent,
      pointsToOpponentOnTie: rule.pointsToOpponentOnTie
    });
    setEditingRule(rule);
    setIsFormOpen(true);
    setFormMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormMessage(null);
    
    if (!currentUser) {
      setFormMessage({ type: 'error', text: 'Você deve estar logado para gerenciar as regras dos jogadores.' });
      setIsLoading(false);
      return;
    }

    if (!formData.typeName.trim()) {
      setFormMessage({ type: 'error', text: 'O nome do tipo é obrigatório.' });
      setIsLoading(false);
      return;
    }

    try {
      // Simulação de chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingRule) {
        const updatedRule = tournamentStore.updatePlayerRule(editingRule.id, formData);
        if (updatedRule) {
          const updatedRules = playerRules.map(rule => 
            rule.id === editingRule.id ? updatedRule : rule
          );
          setPlayerRules(updatedRules);
          setMessage({ type: 'success', text: 'Regra do jogador atualizada com sucesso.' });
        } else {
          setMessage({ type: 'error', text: 'Falha ao atualizar a regra do jogador.' });
        }
      } else {
        const newRule = tournamentStore.createPlayerRule({
          ...formData,
          organizerId: currentUser.id
        });
        setPlayerRules([...playerRules, newRule]);
        setMessage({ type: 'success', text: 'Regra do jogador criada com sucesso.' });
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocorreu um erro ao salvar a regra do jogador.' });
    }
    
    setIsLoading(false);
  };

  const handleDelete = (ruleId: string) => {
    const success = tournamentStore.deletePlayerRule(ruleId);
    if (success) {
      setPlayerRules(playerRules.filter(rule => rule.id !== ruleId));
      setMessage({ type: 'success', text: 'Regra do jogador excluída com sucesso.' });
    } else {
      setMessage({ type: 'error', text: 'Falha ao excluir a regra do jogador.' });
    }
  };

  const formatScoringRule = (rule: PlayerRule) => {
    return (
      <>
        Vitória: {rule.pointsForWin} <br />
        Derrota: {rule.pointsForLoss} <br />
        Empate: {rule.pointsForTie} <br />
        Pontos dados ao oponente (se o oponente vencer): {rule.pointsGivenToOpponent} <br />
        Pontos perdidos pelo oponente (se o oponente perder): {rule.pointsLostByOpponent} <br />
        Pontos perdidos do oponente (em caso de empate): {rule.pointsToOpponentOnTie}
      </>
    );
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
            <span>Voltar para o Painel</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Regras de Jogador</h1>
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
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="typeName">Nome do Tipo</Label>
                  <Input
                    id="typeName"
                    value={formData.typeName}
                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                    placeholder="ex: Jogador Experiente"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="pointsForWin">Pontos por Vitória</Label>
                    <Input
                      id="pointsForWin"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pointsForWin}
                      onChange={(e) => setFormData({ ...formData, pointsForWin: parseFloat(e.target.value) || 0})}
                      placeholder="ex: 3"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="pointsForLoss">Pontos por Derrota</Label>
                    <Input
                      id="pointsForLoss"
                      type="number"
                      step="0.1"
                      value={formData.pointsForLoss}
                      onChange={(e) => setFormData({ ...formData, pointsForLoss: parseFloat(e.target.value) || 0})}
                      placeholder="ex: -1 ou 0"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="pointsForTie">Pontos por Empate</Label>
                    <Input
                      id="pointsForTie"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pointsForTie}
                      onChange={(e) => setFormData({ ...formData, pointsForTie: parseFloat(e.target.value) || 0})}
                      placeholder="ex: 1"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="pointsGivenToOpponent">Pontos dados ao oponente (se o oponente vencer)</Label>
                  <Input
                    id="pointsGivenToOpponent"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.pointsGivenToOpponent}
                    onChange={(e) => setFormData({ ...formData, pointsGivenToOpponent: parseFloat(e.target.value) || 0})}
                    placeholder="ex: 0"
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="pointsLostByOpponent">Pontos perdidos pelo oponente (se o oponente perder)</Label>
                  <Input
                    id="pointsLostByOpponent"
                    type="number"
                    step="0.1"
                    value={formData.pointsLostByOpponent}
                    onChange={(e) => setFormData({ ...formData, pointsLostByOpponent: parseFloat(e.target.value) || 0})}
                    placeholder="ex: 0"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="pointsToOpponentOnTie">Pontos para o oponente (em caso de empate)</Label>
                  <Input
                    id="pointsToOpponentOnTie"
                    type="number"
                    step="0.1"
                    value={formData.pointsToOpponentOnTie}
                    onChange={(e) => setFormData({ ...formData, pointsToOpponentOnTie: parseFloat(e.target.value) || 0})}
                    placeholder="ex: -1, 0 ou 1"
                  />
                </div>
                
                {formMessage && (
                  <div className="mt-4">
                    <MessageBox 
                      type={formMessage.type} 
                      text={formMessage.text} 
                      onClose={() => setFormMessage(null)} 
                    />
                  </div>
                )}

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
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : editingRule ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {message && <div className="mt-4"><MessageBox type={message.type} text={message.text} onClose={() => setMessage(null)} /></div>}
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
                    Criar Sua Primeira Regra
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
                      <Badge variant="secondary">Regra Personalizada</Badge>
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
                            Tem certeza que deseja excluir a regra de jogador "{rule.typeName}"? Esta ação não pode ser desfeita.
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
