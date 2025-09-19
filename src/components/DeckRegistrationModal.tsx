import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Plus, Minus, CheckCircle, AlertTriangle, Maximize, Minimize } from 'lucide-react';
import { DeckList, DeckCard } from '../data/store';
import { toast } from 'sonner@2.0.3';

interface DeckRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deckList: DeckList) => void;
  tournamentName: string;
}

// Mock card database for search
const mockCards: Omit<DeckCard, 'quantity'>[] = [
  { id: '1', name: 'Lightning Bolt', type: 'Instant', manaCost: 'R' },
  { id: '2', name: 'Black Lotus', type: 'Artifact', manaCost: '0' },
  { id: '3', name: 'Ancestral Recall', type: 'Instant', manaCost: 'U' },
  { id: '4', name: 'Giant Growth', type: 'Instant', manaCost: 'G' },
  { id: '5', name: 'Serra Angel', type: 'Creature', manaCost: '3WW' },
  { id: '6', name: 'Shivan Dragon', type: 'Creature', manaCost: '4RR' },
  { id: '7', name: 'Force of Nature', type: 'Creature', manaCost: '2GGGG' },
  { id: '8', name: 'Counterspell', type: 'Instant', manaCost: 'UU' },
  { id: '9', name: 'Dark Ritual', type: 'Instant', manaCost: 'B' },
  { id: '10', name: 'Swords to Plowshares', type: 'Instant', manaCost: 'W' },
  { id: '11', name: 'Llanowar Elves', type: 'Creature', manaCost: 'G' },
  { id: '12', name: 'Mox Ruby', type: 'Artifact', manaCost: '0' },
  { id: '13', name: 'Time Walk', type: 'Sorcery', manaCost: '1U' },
  { id: '14', name: 'Timetwister', type: 'Sorcery', manaCost: '2U' },
  { id: '15', name: 'Mox Sapphire', type: 'Artifact', manaCost: '0' },
  { id: '16', name: 'Birds of Paradise', type: 'Creature', manaCost: 'G' },
  { id: '17', name: 'Sol Ring', type: 'Artifact', manaCost: '1' },
  { id: '18', name: 'Brainstorm', type: 'Instant', manaCost: 'U' },
  { id: '19', name: 'Chain Lightning', type: 'Sorcery', manaCost: 'R' },
  { id: '20', name: 'Tropical Island', type: 'Land', manaCost: undefined }
];

export function DeckRegistrationModal({ isOpen, onOpenChange, onConfirm, tournamentName }: DeckRegistrationModalProps) {
  const [deckName, setDeckName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
  const [step, setStep] = useState<'build' | 'review'>('build');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredCards = mockCards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCards = selectedCards.reduce((sum, card) => sum + card.quantity, 0);
  const isValidDeck = totalCards === 60; // Must be exactly 60 cards
  
  // Check for card limit violations (max 4 copies of each card)
  const hasCardLimitViolations = selectedCards.some(card => card.quantity > 4);

  const addCard = (card: Omit<DeckCard, 'quantity'>) => {
    const existingCardIndex = selectedCards.findIndex(c => c.id === card.id);
    
    if (existingCardIndex >= 0) {
      const currentQuantity = selectedCards[existingCardIndex].quantity;
      if (currentQuantity >= 4) {
        toast.error('Maximum 4 copies of each card allowed');
        return;
      }
      const newCards = [...selectedCards];
      newCards[existingCardIndex].quantity += 1;
      setSelectedCards(newCards);
    } else {
      setSelectedCards([...selectedCards, { ...card, quantity: 1 }]);
    }
  };

  const removeCard = (cardId: string) => {
    const existingCardIndex = selectedCards.findIndex(c => c.id === cardId);
    
    if (existingCardIndex >= 0) {
      const newCards = [...selectedCards];
      if (newCards[existingCardIndex].quantity > 1) {
        newCards[existingCardIndex].quantity -= 1;
      } else {
        newCards.splice(existingCardIndex, 1);
      }
      setSelectedCards(newCards);
    }
  };

  const handleConfirm = () => {
    if (!isValidDeck) {
      toast.error('Deck must contain exactly 60 cards');
      return;
    }

    if (hasCardLimitViolations) {
      toast.error('Maximum 4 copies of each card allowed');
      return;
    }

    if (!deckName.trim()) {
      toast.error('Please enter a deck name');
      return;
    }

    const deckList: DeckList = {
      id: `deck-${Date.now()}`,
      name: deckName,
      cards: selectedCards,
      totalCards,
      createdAt: new Date().toISOString()
    };

    onConfirm(deckList);
    handleClose();
  };

  const handleClose = () => {
    setDeckName('');
    setSearchQuery('');
    setSelectedCards([]);
    setStep('build');
    setIsFullscreen(false);
    onOpenChange(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getCardTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'creature': return 'bg-green-100 text-green-800';
      case 'instant': return 'bg-blue-100 text-blue-800';
      case 'sorcery': return 'bg-purple-100 text-purple-800';
      case 'artifact': return 'bg-gray-100 text-gray-800';
      case 'land': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCardQuantityDisplay = (card: DeckCard) => {
    const isViolation = card.quantity > 4;
    return (
      <span className={`font-medium ${isViolation ? 'text-red-600' : ''}`}>
        {card.quantity}x {card.name}
        {isViolation && <span className="text-red-600 ml-1">(Max 4!)</span>}
      </span>
    );
  };

  // Fullscreen view
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Register for {tournamentName}</h1>
            <p className="text-muted-foreground">Cup tournaments require a deck list. Build your deck below (exactly 60 cards, max 4 copies per card).</p>
          </div>
          <Button variant="outline" onClick={toggleFullscreen}>
            <Minimize className="h-4 w-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          {step === 'build' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Card Search */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="deckName" className="text-lg">Deck Name</Label>
                  <Input
                    id="deckName"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Enter deck name..."
                    className="mt-2 text-lg h-12"
                  />
                </div>
                
                <div>
                  <Label htmlFor="search" className="text-lg">Search Cards</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for cards..."
                      className="pl-12 text-lg h-12"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 border rounded-lg p-4">
                  <div className="space-y-3">
                    {filteredCards.map((card) => (
                      <Card key={card.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold text-lg truncate">{card.name}</span>
                              <Badge className={getCardTypeColor(card.type)} variant="secondary">
                                {card.type}
                              </Badge>
                            </div>
                            {card.manaCost && (
                              <span className="text-base text-muted-foreground">{card.manaCost}</span>
                            )}
                          </div>
                          <Button
                            size="lg"
                            onClick={() => addCard(card)}
                            className="ml-3"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Cards */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Selected Cards</Label>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={isValidDeck && !hasCardLimitViolations ? 'default' : 'destructive'}
                      className="text-base px-3 py-1"
                    >
                      {totalCards}/60 cards
                    </Badge>
                    {isValidDeck && !hasCardLimitViolations ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 border rounded-lg p-4">
                  {selectedCards.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 text-lg">
                      No cards selected yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCards.map((card) => (
                        <Card key={card.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                {getCardQuantityDisplay(card)}
                                <Badge className={getCardTypeColor(card.type)} variant="secondary">
                                  {card.type}
                                </Badge>
                              </div>
                              {card.manaCost && (
                                <span className="text-base text-muted-foreground">{card.manaCost}</span>
                              )}
                            </div>
                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() => removeCard(card.id)}
                              className="ml-3"
                            >
                              <Minus className="h-5 w-5" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Deck Review</CardTitle>
                  <CardDescription className="text-lg">
                    Please review your deck before finalizing registration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-lg">Deck Name</Label>
                    <p className="font-semibold text-xl">{deckName}</p>
                  </div>
                  
                  <div>
                    <Label className="text-lg">Total Cards</Label>
                    <p className="font-semibold text-xl flex items-center space-x-3">
                      <span>{totalCards}/60</span>
                      {isValidDeck && !hasCardLimitViolations ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      )}
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <Label className="text-lg">Card List</Label>
                    <div className="mt-3 space-y-2">
                      {selectedCards.map((card) => (
                        <div key={card.id} className="flex items-center justify-between py-2 border-b">
                          {getCardQuantityDisplay(card)}
                          <Badge className={getCardTypeColor(card.type)} variant="secondary">
                            {card.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 border-t">
          <Button variant="outline" onClick={handleClose} size="lg">
            Cancel
          </Button>
          
          <div className="space-x-3">
            {step === 'review' && (
              <Button variant="outline" onClick={() => setStep('build')} size="lg">
                Back to Build
              </Button>
            )}
            
            {step === 'build' ? (
              <Button 
                onClick={() => setStep('review')}
                disabled={!isValidDeck || !deckName.trim() || hasCardLimitViolations}
                size="lg"
              >
                Review Deck
              </Button>
            ) : (
              <Button onClick={handleConfirm} size="lg">
                Confirm Registration
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Register for {tournamentName}</DialogTitle>
              <DialogDescription className="text-base">
                Cup tournaments require a deck list. Build your deck below (exactly 60 cards, max 4 copies per card).
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'build' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Card Search */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deckName">Deck Name</Label>
                  <Input
                    id="deckName"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Enter deck name..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="search">Search Cards</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for cards..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto h-[400px] border rounded-lg p-4">
                  <div className="space-y-2">
                    {filteredCards.map((card) => (
                      <Card key={card.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium truncate">{card.name}</span>
                              <Badge className={getCardTypeColor(card.type)} variant="secondary">
                                {card.type}
                              </Badge>
                            </div>
                            {card.manaCost && (
                              <span className="text-sm text-muted-foreground">{card.manaCost}</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addCard(card)}
                            className="ml-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Selected Cards</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isValidDeck && !hasCardLimitViolations ? 'default' : 'destructive'}>
                      {totalCards}/60 cards
                    </Badge>
                    {isValidDeck && !hasCardLimitViolations ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="overflow-y-auto h-[450px] border rounded-lg p-4">
                  {selectedCards.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No cards selected yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCards.map((card) => (
                        <Card key={card.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                {getCardQuantityDisplay(card)}
                                <Badge className={getCardTypeColor(card.type)} variant="secondary">
                                  {card.type}
                                </Badge>
                              </div>
                              {card.manaCost && (
                                <span className="text-sm text-muted-foreground">{card.manaCost}</span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeCard(card.id)}
                              className="ml-2"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deck Review</CardTitle>
                  <CardDescription>
                    Please review your deck before finalizing registration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Deck Name</Label>
                      <p className="font-medium">{deckName}</p>
                    </div>
                    
                    <div>
                      <Label>Total Cards</Label>
                      <p className="font-medium flex items-center space-x-2">
                        <span>{totalCards}/60</span>
                        {isValidDeck && !hasCardLimitViolations ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </p>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      <Label>Card List</Label>
                      <div className="mt-2 space-y-1">
                        {selectedCards.map((card) => (
                          <div key={card.id} className="flex items-center justify-between py-1">
                            {getCardQuantityDisplay(card)}
                            <Badge className={getCardTypeColor(card.type)} variant="secondary">
                              {card.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          <div className="space-x-2">
            {step === 'review' && (
              <Button variant="outline" onClick={() => setStep('build')}>
                Back to Build
              </Button>
            )}
            
            {step === 'build' ? (
              <Button 
                onClick={() => setStep('review')}
                disabled={!isValidDeck || !deckName.trim() || hasCardLimitViolations}
              >
                Review Deck
              </Button>
            ) : (
              <Button onClick={handleConfirm}>
                Confirm Registration
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}