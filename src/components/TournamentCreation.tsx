import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Textarea } from './ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Calendar, Trophy, ArrowLeft, CheckCircle } from 'lucide-react';
import { User } from '../data/store.ts';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

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
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    const { name, date, format, structure, maxParticipants, entryFee, rounds, roundTime } = formData;
    if (!name || !date || !format || !structure) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      setIsLoading(false);
      return;
    }

    // Convertendo valores para os tipos corretos e usando os nomes de campos corretos
    const parsedVagas = maxParticipants ? parseInt(maxParticipants, 10) : 0;
    const parsedTaxa = entryFee ? parseFloat(entryFee.replace(',', '.')) : 0.00;
    const parsedRodadas = rounds ? parseInt(rounds, 10) : 0;
    const parsedTempoRodada = roundTime ? parseInt(roundTime, 10) : 30;

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
      n_rodadadas: parsedRodadas,
    };
    
    try {
      const response = await fetch('http://localhost:8000/lojas/torneios/criar', {
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
        setMessage({ type: 'error', text: data.detail || 'Falha ao criar o torneio. Por favor, tente novamente.' });
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
                  placeholder="Friday Night Magic"
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
                  value={formData.date}
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
                  placeholder="São Paulo"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="SP"
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
                  placeholder="32"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryFee">Taxa de Inscrição</Label>
                <Input
                  id="entryFee"
                  type="number"
                  placeholder="15.00"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
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
                    <SelectItem value="Single Elimination">Eliminação Simples</SelectItem>
                    <SelectItem value="Double Elimination">Eliminação Dupla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rounds">Número de Rodadas</Label>
                <Input
                  id="rounds"
                  type="number"
                  placeholder="5"
                  value={formData.rounds}
                  onChange={(e) => setFormData({ ...formData, rounds: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roundTime">Tempo por Rodada (minutos)</Label>
              <Input
                id="roundTime"
                type="number"
                placeholder="30"
                value={formData.roundTime}
                onChange={(e) => setFormData({ ...formData, roundTime: e.target.value })}
              />
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
