import { Trophy } from 'lucide-react';

type Props = {
  message?: string;
};

export default function BrickeiLoadingScreen({ message = 'Preparando tudo pra você...' }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col items-center justify-center p-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient shadow-lg shadow-primary/20 mb-4 animate-pulse">
        <Trophy className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-primary">Brickei</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
