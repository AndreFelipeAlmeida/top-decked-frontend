import { useViewMode } from '@/hooks/viewModeContext.hooks';

type Props = {
  visible: boolean;
};

// Alterna entre a visão de "Jogador" e a de "Organizador" para um jogador que
// também organiza torneios em alguma loja. Só deve ser renderizado (visible=true)
// no dashboard do jogador e na página de torneios, conforme regras de cada página.
export function OrganizerViewSwitch({ visible }: Props) {
  const { viewMode, setViewMode } = useViewMode();

  if (!visible) return null;

  return (
    <div className="inline-flex items-center rounded-full bg-muted p-1 text-sm font-medium">
      <button
        type="button"
        onClick={() => setViewMode('jogador')}
        className={`px-4 py-1.5 rounded-full transition-colors ${
          viewMode === 'jogador'
            ? 'bg-primary text-white shadow'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Jogador
      </button>
      <button
        type="button"
        onClick={() => setViewMode('organizador')}
        className={`px-4 py-1.5 rounded-full transition-colors ${
          viewMode === 'organizador'
            ? 'bg-primary text-white shadow'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Organizador
      </button>
    </div>
  );
}
