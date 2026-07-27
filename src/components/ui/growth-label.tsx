type GrowthLabelProps = {
  diferenca: number;
  sufixo: string;
};

/** Rótulo de crescimento real (nunca um texto fixo): verde com "+" se
 * positivo, vermelho com "-" se negativo, "Sem alterações" se neutro. */
export function GrowthLabel({ diferenca, sufixo }: GrowthLabelProps) {
  if (diferenca === 0) {
    return <div className="text-xs text-muted-foreground mt-1">Sem alterações</div>;
  }

  const positivo = diferenca > 0;
  return (
    <div className={`text-xs mt-1 ${positivo ? 'text-success' : 'text-destructive'}`}>
      {positivo ? '+' : ''}{diferenca} {sufixo}
    </div>
  );
}
