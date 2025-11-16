import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Textarea } from './ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Calendar, Settings, Trophy, ArrowLeft, CheckCircle, Plus } from 'lucide-react';
import { User } from '../data/store.ts';
import PlayerTypeDialog from './PlayerTypeDialog.tsx';
import {
  PlayerRule,
} from "../data/store.ts";

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

interface TournamentCreationProps {
  onNavigate: (page: Page, data?: any) => void;
  currentUser: User | null;
}

export function TournamentCreation({ onNavigate, currentUser }: TournamentCreationProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    format: '',
    prizes: '',
    description: '',
    maxParticipants: '',
    entryFee: '',
    structure: '',
    rounds: '',
    city: '',
    state: '',
    roundTime: '',
    regraBasica: null
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerRuleDialogOpen, setIsPlayerRuleDialogOpen] = useState(false);
  const [defaultRuleId, setDefaultRuleId] =
    useState<string>(null);
  const [availableRules, setAvailableRules] = useState<
    PlayerRule[]
  >([]);

  const fetchAvailableRules = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn("Token de acesso não encontrado.");
      return;
    }

    try {
      const rulesResponse = await fetch(`${API_URL}/lojas/tipoJogador/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();

        const mappedRules = rulesData.map((rule: any) => ({
          id: rule.id.toString(),
          typeName: rule.nome,
          pointsForWin: rule.pt_vitoria,
          pointsForLoss: rule.pt_derrota,
        }));

        setAvailableRules(mappedRules);

        const defaultRule = rulesData.find((rule: any) => rule.nome === "Normal Player") || rulesData[0];
        if (defaultRule) setDefaultRuleId(defaultRule.id.toString());

      } else if (rulesResponse.status === 404) {
        setAvailableRules([]);
        console.warn('Nenhum tipo de jogador encontrado. Usando lista vazia.');
      } else {
        const errorData = await rulesResponse.json();
        throw new Error(errorData.detail || 'Falha ao buscar as regras de jogador.');
      }
    } catch (error) {
      console.error("Erro ao buscar regras:", error);
    }
  };

  useEffect(() => {
    fetchAvailableRules();
  }, []);

  const handleEntryFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^\d*([.,]\d*)?$/;
    if (value === "" || regex.test(value.replace(',', '.'))) {
      setFormData({
        ...formData,
        entryFee: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada. Por favor, faça login novamente.' });
      setIsLoading(false);
      onNavigate('login');
      return;
    }

    if (!currentUser) {
      setMessage({ type: 'error', text: 'Você deve estar logado para criar um torneio.' });
      setIsLoading(false);
      return;
    }

    const { name, date, format, structure, entryFee, rounds, maxParticipants, roundTime } = formData;

    if (!name || !date || !format || !structure) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      setIsLoading(false);
      return;
    }
    
    const parsedTaxa = entryFee ? parseFloat(entryFee.replace(',', '.')) : 0.00;
    
    if (isNaN(parsedTaxa) || parsedTaxa < 0) {
        setMessage({ type: 'error', text: 'A taxa de inscrição deve ser um valor numérico positivo ou zero.' });
        setIsLoading(false);
        return;
    }
    
    const parsedVagas = maxParticipants ? parseInt(maxParticipants, 10) : 0;
    const parsedRodadas = rounds ? parseInt(rounds, 10) : 0;
    const parsedTempoRodada = roundTime ? parseInt(roundTime, 10) : 30;

    if (parsedVagas < 0 || parsedRodadas < 0 || parsedTempoRodada < 0) {
      setMessage({ type: 'error', text: 'Os campos de vagas, rodadas e tempo de rodada não podem ser negativos.' });
      setIsLoading(false);
      return;
    }

    const payload = {
      nome: formData.name,
      descricao: formData.description,
      cidade: formData.city,
      estado: formData.state,
      tempo_por_rodada: parsedTempoRodada,
      data_inicio: formData.date,
      vagas: parsedVagas,
      hora: formData.time || '12:00',
      formato: formData.format,
      taxa: parsedTaxa, 
      premio: formData.prizes,
      n_rodadas: parsedRodadas, 
      ...(defaultRuleId && { regra_basica_id: defaultRuleId })
    };
    console.log(payload)
    try {
      const response = await fetch(`${API_URL}/lojas/torneios/criar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Torneio criado com sucesso!' });
        setTimeout(() => {
          onNavigate('tournament-details', { tournamentId: data.id });
        }, 1500);
      } else {
        console.error('Falha na criação do torneio:', data);
        const errorMessage = Array.isArray(data.detail) ? data.detail.map((err: any) => err.msg).join(", ") : data.detail;
        setMessage({ type: 'error', text: errorMessage || 'Falha ao criar o torneio. Por favor, tente novamente.' });
      }
    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
      setMessage({ type: 'error', text: 'Falha na conexão com o servidor. Por favor, tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      time: '',
      format: '',
      prizes: '',
      description: '',
      maxParticipants: '',
      entryFee: '',
      structure: '',
      rounds: '',
      city: '',
      state: '',
      roundTime: '',
    });
    setMessage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('organizer-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o Painel
        </Button>
        <h1 className="text-3xl font-bold mb-2">Criar Torneio</h1>
        <p className="text-muted-foreground">Configure um novo evento de torneio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Informações Básicas</span>
            </CardTitle>
            <CardDescription>Insira os detalhes básicos para o seu torneio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Torneio *</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome do torneio"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Formato *</Label>
                <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Commander">Commander</SelectItem>
                    <SelectItem value="Legacy">Legacy</SelectItem>
                    <SelectItem value="Vintage">Vintage</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sealed">Sealed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date?.split("T")[0] || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Digite a cidade do torneio"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="Digite o estado do torneio"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Vagas Totais</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="0"
                  value={formData.maxParticipants}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                      setFormData({ ...formData, maxParticipants: value });
                    }
                  }}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryFee">Taxa de Inscrição</Label>
                <Input
                  id="entryFee"
                  type="text"
                  placeholder="0.00"
                  value={formData.entryFee}
                  onChange={handleEntryFeeChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do torneio, regras ou informações adicionais..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prizes">Prêmios</Label>
              <Textarea
                id="prizes"
                placeholder="1º Lugar: $100 em crédito na loja, 2º Lugar: $50 em crédito na loja..."
                value={formData.prizes}
                onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Estrutura do Torneio</span>
            </CardTitle>
            <CardDescription>Configure o formato e as regras do torneio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="structure">Estrutura do Torneio *</Label>
                <Select value={formData.structure} onValueChange={(value) => setFormData({ ...formData, structure: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a estrutura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Swiss">Suíço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rounds">Número de Rodadas</Label>
                <Input
                  id="rounds"
                  type="number"
                  placeholder="0"
                  value={formData.rounds}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                      setFormData({ ...formData, rounds: value });
                    }
                  }}
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roundTime">Tempo por Rodada (minutos)</Label>
              <Input
                id="roundTime"
                type="number"
                placeholder="0"
                value={formData.roundTime}
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                      setFormData({ ...formData, roundTime: value });
                    }
                  }}
                min="0"
              />
            </div>
          </CardContent>
        </Card>
        {/* Tournament Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Regras do Torneio</span>
                </CardTitle>
                <CardDescription>
                  Definir as regras básicas e opcionais do torneio
                </CardDescription>
              </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => setIsPlayerRuleDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Criar Regra de Jogador</span>
          </Button>
          <PlayerTypeDialog
            editingRule={false}
            currentUser={currentUser}
            isFormOpen={isPlayerRuleDialogOpen}
            setIsFormOpen={setIsPlayerRuleDialogOpen}
            onSuccess={fetchAvailableRules}
          />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
                        {/* Default Rule */}
                        <div className="space-y-2">
                          <Label htmlFor="defaultRule">
                            Regra Básica do Jogador
                          </Label>
                          <Select
                            value={defaultRuleId}
                            onValueChange={setDefaultRuleId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar regra padrão para todos os jogadores" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRules.map((rule) => (
                                <SelectItem key={rule.id} value={rule.id}>
                                  {rule.typeName} (Vitória:{" "}
                                  {rule.pointsForWin}pts, Derrota:{" "}
                                  {rule.pointsForLoss}pts)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Esta regra será aplicada a todos os jogadores
                            por padrão
                          </p>
                        </div>
          </CardContent>
        </Card>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription className="flex items-center space-x-2">
              {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
              <span>{message.text}</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
          >
            Limpar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate('organizer-dashboard')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Criando Torneio...' : 'Criar Torneio'}
          </Button>
        </div>
      </form>
    </div>
  );
}