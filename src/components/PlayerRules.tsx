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
import PlayerTypeDialog from "./PlayerTypeDialog.tsx";


const API_URL = process.env.REACT_APP_BACKEND_API_URL;

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

  const currentUser = { id: 1, type: 'organizer' };

  const fetchRules = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Token de acesso não encontrado. Faça o login novamente.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/lojas/tipoJogador/`, {
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

  const handleAddNew = () => {
    setEditingRule(null);
    setIsFormOpen(true);
  };

  const openEditForm = (rule: PlayerRule) => {
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const handleDelete = async (ruleId: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Token de acesso não encontrado. Faça o login novamente.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/lojas/tipoJogador/${ruleId}`, {
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
        <Button
          onClick={handleAddNew}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Novo Tipo</span>
        </Button>
        </div>
        <PlayerTypeDialog
        editingRule={editingRule}
        initialData={editingRule}
        currentUser={currentUser}
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        />
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