import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { RadioGroup, RadioGroupItem } from './ui/radio-group.tsx';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover.tsx';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from './ui/utils.ts';
import { tournamentStore, User, Tournament } from '../data/store.ts';
import { toast } from 'sonner';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

interface TournamentImportProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: Page, data?: any) => void;
  targetTournamentId?: string;
  targetTournamentName?: string;
  currentUser: User | null;
}

export function TournamentImport({ isOpen, onOpenChange, onNavigate, targetTournamentId, targetTournamentName, currentUser }: TournamentImportProps) {
  const [importType, setImportType] = useState(targetTournamentId ? 'existing' : 'new');
  const [selectedTournamentId, setSelectedTournamentId] = useState(targetTournamentId || '');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Usando dados mock temporariamente para a seleção de torneio
  // No futuro, isso virá da API
  const tournaments: Tournament[] = currentUser
    ? tournamentStore.getTournamentsByOrganizer(currentUser.id)
    : [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const resetForm = () => {
    setImportFile(null);
    setImportType(targetTournamentId ? 'existing' : 'new');
    setSelectedTournamentId(targetTournamentId || '');
    setOpen(false);
  };

  const handleImportNext = async () => {
    if (!importFile) {
      toast.error('Por favor, selecione um arquivo para importar');
      return;
    }

    if (importType === 'existing' && !selectedTournamentId) {
      toast.error('Por favor, selecione um torneio para importar');
      return;
    }
    
    setIsLoading(true);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      onNavigate('login');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('arquivo', importFile);
    
    let apiUrl = '';
    let successMessage = '';
    let tournamentIdToNavigate = '';

    if (importType === 'new') {
      apiUrl = `${API_URL}/lojas/torneios/importar`;
      successMessage = 'Torneio importado com sucesso!';
    } else {
      apiUrl = `${API_URL}/lojas/torneios/${selectedTournamentId}/importar`;
      successMessage = 'Dados importados para o torneio existente!';
      tournamentIdToNavigate = selectedTournamentId;
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(successMessage);
        onOpenChange(false);
        resetForm();

        tournamentIdToNavigate = result.id;
        onNavigate('tournament-edit', { tournamentId: tournamentIdToNavigate });
      } else {
        console.error('Falha na importação:', result);
        toast.error(result.detail || 'Falha ao importar os dados do torneio');
      }
    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
      toast.error('Falha na conexão com o servidor. Por favor, tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Torneio</DialogTitle>
          <DialogDescription>
            {targetTournamentId 
              ? `Importar dados de torneio de um arquivo XML para atualizar "${targetTournamentName}".`
              : 'Importar dados de torneio de um arquivo XML para criar um novo torneio ou atualizar um existente.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label htmlFor="import-file">Arquivo XML</Label>
            <div className="mt-2">
            <Input
                id="import-file"
                type="file"
                accept=".xml, .tdf"
                onChange={handleFileUpload}
                className="cursor-pointer"
            />
              {importFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selecionado: {importFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Import Type - Only show if no target tournament specified */}
          {!targetTournamentId && (
            <div>
              <Label>Tipo de Importação</Label>
              <RadioGroup value={importType} onValueChange={setImportType} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new">Importar para um novo torneio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing">Importar para um torneio existente</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Target Tournament Display (when specified) */}
          {targetTournamentId && (
            <div>
              <Label>Torneio de Destino</Label>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <div className="font-medium">{targetTournamentName}</div>
                <div className="text-sm text-muted-foreground">Os dados serão importados para este torneio</div>
              </div>
            </div>
          )}

          {/* Tournament Selection (only shown when importing to existing and no target specified) */}
          {importType === 'existing' && !targetTournamentId && (
            <div>
              <Label>Selecionar Torneio</Label>
              <div className="mt-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between text-muted-foreground"
                    >
                      {selectedTournamentId
                        ? tournaments.find((tournament) => tournament.id === selectedTournamentId)?.name
                        : "Procurar e selecionar torneio..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto min-w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Procurar torneios..." />
                      <CommandList>
                        <CommandEmpty>Nenhum torneio encontrado.</CommandEmpty>
                        <CommandGroup>
                          {tournaments.map((tournament) => (
                            <CommandItem
                              key={tournament.id}
                              value={tournament.name}
                              onSelect={() => {
                                setSelectedTournamentId(tournament.id === selectedTournamentId ? "" : tournament.id);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTournamentId === tournament.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{tournament.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {tournament.format} • {tournament.date}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleImportNext}>
              {isLoading ? 'Importando...' : 'Próximo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
