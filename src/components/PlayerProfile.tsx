import React from 'react';
import { Button } from './ui/button.tsx';
import { Card } from './ui/card.tsx';
import { Avatar } from './ui/avatar.tsx';
import { User } from '../data/store';

interface PlayerProfileProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ currentUser, onNavigate }) => {
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Usuário não encontrado.</p>
        <Button onClick={() => onNavigate('login')}>Voltar ao login</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-8">
      <Card className="w-full max-w-md p-6 flex flex-col items-center">
        <Avatar name={currentUser.name} className="mb-4 w-24 h-24 text-3xl" />
        <h2 className="text-2xl font-bold mb-2">{currentUser.name}</h2>
        <p className="text-gray-500 mb-4">{currentUser.email}</p>
        {currentUser.store && (
          <p className="text-gray-500 mb-4">Loja: {currentUser.store}</p>
        )}

        <div className="w-full mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold">Tipo:</span>
            <span>{currentUser.type === 'player' ? 'Jogador' : 'Organizador'}</span>
          </div>

          {currentUser.dateOfBirth && (
            <div className="flex justify-between">
              <span className="font-semibold">Data de nascimento:</span>
              <span>{currentUser.dateOfBirth}</span>
            </div>
          )}

          {currentUser.stats && (
            <>
              <div className="flex justify-between">
                <span className="font-semibold">Total de Pontos:</span>
                <span>{currentUser.stats.totalPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Vitórias:</span>
                <span>{currentUser.stats.wins}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Derrotas:</span>
                <span>{currentUser.stats.losses}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Empates:</span>
                <span>{currentUser.stats.draws}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Taxa de Vitórias:</span>
                <span>{currentUser.stats.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Torneios Participados:</span>
                <span>{currentUser.stats.tournaments}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Ranking:</span>
                <span>{currentUser.stats.rank}</span>
              </div>
            </>
          )}
        </div>

        <Button onClick={() => onNavigate('player-dashboard')}>Voltar ao Dashboard</Button>
      </Card>
    </div>
  );
};
