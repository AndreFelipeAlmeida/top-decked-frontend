import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type InfoTooltipProps = {
  text: string;
};

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger type="button" className="inline-flex align-middle text-muted-foreground hover:text-foreground">
        <Info className="w-3.5 h-3.5" />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
