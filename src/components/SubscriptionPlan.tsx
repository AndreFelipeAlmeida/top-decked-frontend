import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Progress } from './ui/progress.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Check, X, AlertCircle, CreditCard, Calendar, Users, Trophy, ArrowLeft, Star } from 'lucide-react';

type Page = 'login' | 'player-dashboard' | 'subscription' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface SubscriptionPlanProps {
  onNavigate: (page: Page) => void;
}

const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    interval: 'mês',
    description: 'Perfeito para começar a gerenciar torneios',
    features: [
      'Até 3 torneios por mês',
      'Gerenciamento básico de torneios',
      'Estatísticas de jogadores',
      'Suporte por e-mail'
    ],
    limitations: [
      'Sem análises avançadas',
      'Formatos de torneio limitados',
      'Sem personalização de marca',
      'Apenas relatórios básicos',
      'Sem banner de propaganda'
    ],
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '59,90',
    interval: 'mês',
    description: 'Solução completa para organizadores de torneios sérios',
    features: [
      'Torneios ilimitados',
      'Suíte completa de gerenciamento de torneios',
      'Análises e insights avançados',
      'Personalização de marca e temas',
      'Suporte prioritário',
      'Acesso total à API',
      'Engajamento avançado de jogadores',
      'Capacidade de exportação para a comunidade no Instagram'
    ],
    limitations: [],
    popular: true
  }
];

const currentSubscription = {
  plan: 'premium',
  status: 'ativo',
  nextBilling: '2025-12-15',
  usage: {
    tournaments: 12,
    limit: 999,
    players: 180,
    storage: 65
  }
};

export function SubscriptionPlan({ onNavigate }: SubscriptionPlanProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    address: '',
    city: '',
    zipCode: ''
  });

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    if (planId === 'free') {
      console.log('Subscribing to free plan:', planId);
      setSelectedPlan(null);
    } else {
      setShowPayment(true);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Processing payment for plan:', selectedPlan);
    setShowPayment(false);
    setSelectedPlan(null);
  };

  const currentPlan = plans.find(p => p.id === currentSubscription.plan);
  const selectedPlanData = plans.find(p => p.id === selectedPlan);

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
        <h1 className="text-3xl font-bold mb-2">Planos de Assinatura</h1>
        <p className="text-muted-foreground">Escolha o plano perfeito para sua loja</p>
      </div>

      {/* Current Subscription Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Assinatura Atual</span>
          </CardTitle>
          <CardDescription>Seu plano e uso atuais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plano Atual</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">{currentPlan?.name}</Badge>
                  <Badge variant={currentSubscription.status === 'ativo' ? 'secondary' : 'destructive'}>
                    {currentSubscription.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Próxima Cobrança</span>
                <span className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${currentSubscription.nextBilling}T00:00:00Z`))}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Custo Mensal</span>
                <span className="text-sm font-bold">R${currentPlan?.price}/mês</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Torneios Utilizados</span>
                  <span className="text-sm text-muted-foreground">
                    {currentSubscription.usage.tournaments}/{currentSubscription.usage.limit}
                  </span>
                </div>
                <Progress 
                  value={(currentSubscription.usage.tournaments / currentSubscription.usage.limit) * 100} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Jogadores Ativos</span>
                  <span className="text-sm text-muted-foreground">
                    {currentSubscription.usage.players}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Armazenamento Utilizado</span>
                  <span className="text-sm text-muted-foreground">
                    {currentSubscription.usage.storage}%
                  </span>
                </div>
                <Progress value={currentSubscription.usage.storage} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Alert */}
      {currentSubscription.usage.tournaments / currentSubscription.usage.limit > 0.8 && (
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você está se aproximando do seu limite de torneios. Considere fazer um upgrade para evitar interrupção no serviço.
          </AlertDescription>
        </Alert>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Mais Popular</span>
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                R${plan.price}
                <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Recursos incluídos:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {plan.limitations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Limitações:</h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                className="w-full"
                variant={plan.id === currentSubscription.plan ? 'outline' : 'default'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.id === currentSubscription.plan}
              >
                {plan.id === currentSubscription.plan ? 'Plano Atual' : 'Selecionar Plano'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedPlanData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assinar {selectedPlanData.name}</CardTitle>
              <CardDescription>
                R${selectedPlanData.price}/{selectedPlanData.interval} - Conclua sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Data de Validade</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/AA"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Titular do Cartão</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={paymentData.name}
                    onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                    required
                  />
                </div>
                
                <Alert>
                  <AlertDescription className="text-sm">
                    Este é um protótipo. Nenhum pagamento real será processado.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setShowPayment(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Assinar por R${selectedPlanData.price}/mês
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}