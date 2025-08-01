import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Textarea } from './ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Calendar, Trophy, ArrowLeft, CheckCircle } from 'lucide-react';
import { tournamentStore, User } from '../data/store.ts';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'tournament-details';

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
    store: currentUser?.store || '',
    prizes: '',
    description: '',
    totalVagas: '',
    entryFee: '',
    structure: '',
    rounds: '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!formData.name || !formData.date || !formData.format || !formData.structure || !formData.totalVagas || !formData.entryFee || !formData.rounds) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      setIsLoading(false);
      return;
    }

    // Simulação de chamada de API
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (currentUser) {
      try {
        const tournament = tournamentStore.createTournament({
          name: formData.name,
          organizerId: currentUser.id,
          organizerName: currentUser.name,
          date: formData.date,
          time: formData.time,
          format: formData.format,
          store: formData.store,
          description: formData.description,
          prizes: formData.prizes,
          totalVagas: parseInt(formData.totalVagas),
          entryFee: formData.entryFee,
          structure: formData.structure,
          rounds: parseInt(formData.rounds),
        });

        tournamentStore.updateTournamentStatus(tournament.id, 'registration');

        setMessage({ type: 'success', text: 'Torneio criado com sucesso!' });
        setTimeout(() => {
          onNavigate('organizer-dashboard');
        }, 1500);
      } catch (error) {
        setMessage({ type: 'error', text: 'Falha ao criar torneio. Por favor, tente novamente.' });
      }
    } else {
      setMessage({ type: 'error', text: 'Erro: O usuário não está autenticado.' });
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      time: '',
      format: '',
      store: currentUser?.store || '',
      prizes: '',
      description: '',
      totalVagas: '',
      entryFee: '',
      structure: '',
      rounds: '',
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
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Informações Básicas</span>
            </CardTitle>
            <CardDescription>Insira os detalhes básicos do seu torneio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Torneio *</Label>
                <Input
                  id="name"
                  placeholder="Magic de Sexta-feira"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
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
                <Label htmlFor="totalVagas">Total de Vagas *</Label>
                <Input
                  id="totalVagas"
                  type="number"
                  placeholder="32"
                  value={formData.totalVagas}
                  onChange={(e) => setFormData({ ...formData, totalVagas: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryFee">Taxa de Inscrição *</Label>
                <Input
                  id="entryFee"
                  placeholder="R$15"
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
                placeholder="1º Lugar: R$100 em crédito na loja, 2º Lugar: R$50 em crédito..."
                value={formData.prizes}
                onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estrutura do Torneio */}
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
                    <SelectItem value="Round Robin">Round Robin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rounds">Número de Rodadas *</Label>
                <Input
                  id="rounds"
                  type="number"
                  placeholder="5"
                  value={formData.rounds}
                  onChange={(e) => setFormData({ ...formData, rounds: e.target.value })}
                />
              </div>
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
          <Button type="submit" 
          disabled={isLoading}
          className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-[#3f2d7b] transition-colors"
          >
            {isLoading ? 'Criando Torneio...' : 'Criar Torneio'}
          </Button>
        </div>
      </form>
    </div>
  );
}
